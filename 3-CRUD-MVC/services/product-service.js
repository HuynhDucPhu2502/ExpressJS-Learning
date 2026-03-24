const {
  ScanCommand,
  GetCommand,
  DeleteCommand,
  PutCommand,
} = require("@aws-sdk/lib-dynamodb");
const { dynamodbClient, s3Client } = require("../config/aws-config");
const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");

const TableName = "products";
const Bucket = "bucket-cua-phu-34";

const getAllProducts = async () => {
  const data = await dynamodbClient.send(new ScanCommand({ TableName }));
  return data.Items;
};

const getProductById = async (id) => {
  const data = await dynamodbClient.send(
    new GetCommand({ TableName, Key: { id } }),
  );
  return data.Item;
};

const upsertProduct = async (id, body, file) => {
  const { name, price } = body;

  // 2.1 Tạo payload TH1 Create
  let productData = { id: id ?? Date.now().toString(), name, price };

  // 2.2 Tạo payload TH2 Update
  if (id) {
    const data = await dynamodbClient.send(
      new GetCommand({
        TableName,
        Key: { id },
      }),
    );
    if (data.Item) productData = { ...data.Item, name, price };
  }

  // 3. Cập nhật s3
  if (file) {
    // 3.1 Upload ảnh
    const key = `${Date.now()}-${file.originalname}`;
    await s3Client.send(
      new PutObjectCommand({
        Bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );
    const image = `https://${Bucket}.s3.amazonaws.com/${key}`;

    // 3.2 Xóa ảnh nếu có
    if (productData.image) {
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket,
          Key: productData.image.split("/").pop(),
        }),
      );
    }

    // 3.3 Cập nhật payload
    productData.image = image;
  }

  // 4.
  await dynamodbClient.send(
    new PutCommand({
      TableName,
      Item: productData,
    }),
  );
};

const deleteProductById = async (id) => {
  const data = await dynamodbClient.send(
    new GetCommand({ TableName, Key: { id } }),
  );

  if (data.Item?.image) {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket,
        Key: data.Item.image.split("/").pop(),
      }),
    );
  }

  await dynamodbClient.send(new DeleteCommand({ TableName, Key: { id } }));
};

module.exports = {
  getAllProducts,
  getProductById,
  upsertProduct,
  deleteProductById,
};
