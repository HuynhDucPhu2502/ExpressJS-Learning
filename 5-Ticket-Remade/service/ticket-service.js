const { dynamodbClient, s3Client } = require("../config/aws-config");
const {
  GetCommand,
  ScanCommand,
  DeleteCommand,
  PutCommand,
} = require("@aws-sdk/lib-dynamodb");
const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");

const Bucket = "bucket-cua-phu-34";
const TableName = "EventTickets";

const getAllTickets = async (nameQuery, statusQuery) => {
  const params = { TableName };

  const values = {};
  const conditions = [];

  if (nameQuery) {
    conditions.push(
      "(contains(eventName, :nameQuery) OR contains(holderName, :nameQuery))",
    );
    values[":nameQuery"] = nameQuery;
  }

  if (statusQuery && statusQuery !== "all") {
    conditions.push("(contains(#st, :statusQuery))");
    values[":statusQuery"] = statusQuery;
    params.ExpressionAttributeNames = { "#st": "status" };
  }

  if (conditions.length > 0) {
    params.FilterExpression = conditions.join(" AND ");
    params.ExpressionAttributeValues = values;
  }

  const data = await dynamodbClient.send(new ScanCommand(params));
  return data.Items || [];
};

const getTicketById = async (ticketId) => {
  const data = await dynamodbClient.send(
    new GetCommand({ TableName, Key: { ticketId } }),
  );
  return data.Item || null;
};

const upsertTicket = async (ticketId, body, file) => {
  const {
    eventName,
    holderName,
    category,
    quantity,
    pricePerTicket,
    eventDate,
    status,
  } = body;

  if (quantity <= 0) throw new Error("Số lượng không hợp lệ");
  if (pricePerTicket <= 0) throw new Error("Giá vé không hợp lệ");
  if (category !== "Standard" && category !== "VIP" && category !== "VVIP")
    throw new Error("Danh mục không hợp lệ");
  if (new Date(eventDate) < new Date())
    throw new Error("Ngày sự kiện không hợp lệ");

  const newTicketId =
    ticketId && ticketId !== "undefined" ? ticketId : Date.now().toString();
  let ticketData = { ticketId: newTicketId, ...body };

  if (ticketId && ticketId !== "undefined") {
    const data = await getTicketById(ticketId);
    if (data) ticketData = { ...data, ...body };
  }

  if (file) {
    const key = `${Date.now()}-${file.originalname}`;
    await s3Client.send(
      new PutObjectCommand({
        Bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    if (ticketData.imageUrl) {
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket,
          Key: ticketData.imageUrl.split("/").pop(),
        }),
      );
    }

    ticketData.imageUrl = `https://${Bucket}.s3.amazonaws.com/${key}`;
  }

  ticketData.totalAmount = quantity * pricePerTicket;
  if (category === "VIP" && quantity >= 4)
    ticketData.finalAmount = ticketData.totalAmount * 0.9;
  else if (category === "VVIP " && quantity >= 2)
    ticketData.finalAmount = ticketData.totalAmount * 0.85;
  else ticketData.finalAmount = ticketData.totalAmount;

  ticketData.discount =
    ticketData.finalAmount !== ticketData.totalAmount
      ? "Có giảm giá"
      : "Không giảm giá";

  await dynamodbClient.send(
    new PutCommand({
      TableName,
      Item: ticketData,
    }),
  );
};

const deleteTicketById = async (ticketId) => {
  const data = await getTicketById(ticketId);
  if (data) {
    if (data.imageUrl) {
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket,
          Key: data.imageUrl.split("/").pop(),
        }),
      );
    }

    await dynamodbClient.send(
      new DeleteCommand({
        TableName,
        Key: { ticketId },
      }),
    );
  }
};

module.exports = {
  getAllTickets,
  getTicketById,
  upsertTicket,
  deleteTicketById,
};
