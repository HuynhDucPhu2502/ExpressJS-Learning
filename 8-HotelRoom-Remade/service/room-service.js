const { dynamodbClient, s3Client } = require("../config/aws-config");
const {
  GetCommand,
  DeleteCommand,
  PutCommand,
  ScanCommand,
} = require("@aws-sdk/lib-dynamodb");
const { DeleteObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");

const TableName = "HotelRooms";
const Bucket = "bucket-cua-phu-34";

const getAvaliableNumberByRoomType = async () => {
  const data = await getAllRooms();

  const res = {
    Standard: data.filter(
      (x) => x.roomType == "Standard" && x.status == "Available",
    ).length,
    Deluxe: data.filter(
      (x) => x.roomType == "Deluxe" && x.status == "Available",
    ).length,
    Suite: data.filter((x) => x.roomType == "Suite" && x.status == "Available")
      .length,
  };
  return res;
};

const getAllRooms = async (nameQuery, statusQuery) => {
  const params = { TableName };
  const conditions = [];
  const values = {};

  if (nameQuery) {
    conditions.push("(contains(roomName, :nameQuery))");
    values[":nameQuery"] = nameQuery;
  }

  if (statusQuery && statusQuery !== "All") {
    conditions.push(
      "(contains(roomType, :statusQuery) OR contains(#st, :statusQuery))",
    );
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

const getRoomById = async (roomId) => {
  const data = await dynamodbClient.send(
    new GetCommand({ TableName, Key: { roomId } }),
  );
  return data.Item || null;
};

const upsertRoom = async (roomId, body, file) => {
  const { roomName, roomType, pricePerNight, capacity, status } = body;

  const newRoomId =
    roomId && roomId !== "undefined" ? roomId : Date.now().toString();
  let roomData = {
    roomId: newRoomId,
    roomName,
    roomType,
    pricePerNight,
    capacity,
    status,
  };

  if (!roomName) throw new Error("roomName không được đế trống");
  if (!pricePerNight || pricePerNight <= 0)
    throw new Error("Giá theo đêm không hợp lệ");
  if (capacity <= 0 || capacity > 10) throw new Error("Capicity từ 1 đến 10");

  if (roomId && roomId !== "undefined") {
    const data = await getRoomById(roomId);
    if (data)
      roomData = {
        ...data,
        roomName,
        roomType,
        pricePerNight,
        capacity,
        status,
      };
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

    if (roomData.imageUrl) {
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket,
          Key: roomData.imageUrl.split("/").pop(),
        }),
      );
    }

    roomData.imageUrl = `https://${Bucket}.s3.amazonaws.com/${key}`;
  }

  await dynamodbClient.send(new PutCommand({ TableName, Item: roomData }));
};

const deleteRoomById = async (roomId) => {
  const data = await getRoomById(roomId);
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
      new DeleteCommand({ TableName, Key: { roomId } }),
    );
  }
};

module.exports = {
  getAllRooms,
  getRoomById,
  upsertRoom,
  deleteRoomById,
  getAvaliableNumberByRoomType,
};
