const { dynamoDbClient, s3Client } = require("../config/aws-config");
const {
  GetCommand,
  PutCommand,
  DeleteCommand,
  ScanCommand,
} = require("@aws-sdk/lib-dynamodb");
const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");

const TableName = "EventTickets";
const Bucket = "bucket-cua-phu-34";

const getAllTickets = async () => {
  const data = await dynamoDbClient.send(new ScanCommand({ TableName }));
  return data.Items || [];
};

const getTicketById = async (ticketId) => {
  const data = await dynamoDbClient.send(
    new GetCommand({ TableName, Key: { ticketId } }),
  );
  return data.Item || null;
};

const upsertTicket = async (ticketId, body, file) => {
  // 1. Chuẩn bị dữ liệu
  const {
    eventName,
    holderName,
    category,
    quantity,
    pricePerTicket,
    eventDate,
    status,
  } = body;

  if (quantity <= 0) throw new Error("Số lượng lớn hơn 0");
  if (pricePerTicket <= 0) throw new Error("Giá vé lớn hơn 0");
  if (eventDate < Date.now()) throw new Error("Ngày sự kiện không hợp lệ");

  // 2.1 Làm payload TH1 Tạo vé mới
  let ticketData = {
    ticketId: ticketId ?? Date.now().toString(),
    eventName,
    holderName,
    category,
    quantity,
    pricePerTicket,
    eventDate,
    status,
  };

  // 2.2 Làm payload TH2 Cập nhật vé
  if (ticketId) {
    const data = await dynamoDbClient.send(
      new GetCommand({ TableName, Key: { ticketId } }),
    );

    if (!data.Item) throw new Error("Không tìm thấy sản phẩm");

    ticketData = { ...data.Item, ...body };
  }

  // 3 Làm việc với S3
  if (file) {
    // Upload ảnh
    const key = `${Date.now()}-${file.originalname}`;
    await s3Client.send(
      new PutObjectCommand({
        Bucket,
        Body: file.buffer,
        Key: key,
        ContentType: file.mimetype,
      }),
    );

    // Xóa ảnh nếu có
    if (ticketData.imageUrl) {
      await s3Client.send(
        new PutObjectCommand({
          Bucket,
          Key: ticketData.imageUrl.split("/").pop(),
        }),
      );
    }

    // Cập nhật vào payload
    ticketData.imageUrl = `https://${Bucket}.s3.amazonaws.com/${key}`;
  }

  // 4 Làm việc với Dynamodb
  await dynamoDbClient.send(
    new PutCommand({
      TableName,
      Item: ticketData,
    }),
  );
};

const deleteTicketById = async (ticketId) => {
  const data = await dynamoDbClient.send(
    new GetCommand({ TableName, Key: { ticketId } }),
  );

  // Làm việc s3
  if (data.Item?.imageUrl) {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket,
        Key: data.Item.imageUrl.split("/").pop(),
      }),
    );
  }

  // Làm việc với Dynamodb
  await dynamoDbClient.send(
    new DeleteCommand({ TableName, Key: { ticketId } }),
  );
};

module.exports = {
  getAllTickets,
  getTicketById,
  upsertTicket,
  deleteTicketById,
};
