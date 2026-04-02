const {
  ScanCommand,
  GetCommand,
  DeleteCommand,
  PutCommand,
} = require("@aws-sdk/lib-dynamodb");
const { dynamodbClient, s3Client } = require("../config/aws-config");
const { DeleteObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");

const TableName = "ClinicAppointments";
const Bucket = "bucket-cua-phu-34";

const handleThongKe = async () => {
  let data = await dynamodbClient.send(new ScanCommand({ TableName }));

  const thongKe = {
    Pending: data.Items.filter((x) => x.status === "Pending").length,
    Confirmed: data.Items.filter((x) => x.status === "Confirmed").length,
    Done: data.Items.filter((x) => x.status === "Done").length,
    Cancelled: data.Items.filter((x) => x.status === "Cancelled").length,
  };

  thongKe.Tong = thongKe.Pending + thongKe.Confirmed + thongKe.Done;

  return thongKe;
};

const getAll = async (nameQuery, statusQuery) => {
  let data = await dynamodbClient.send(new ScanCommand({ TableName }));

  if (nameQuery) {
    data.Items = data.Items.filter(
      (x) =>
        x.patientName.includes(nameQuery) || x.doctorName.includes(nameQuery),
    );
  }

  if (statusQuery) {
    data.Items = data.Items.filter(
      (x) => x.specialty === statusQuery || x.status === statusQuery,
    );
  }

  return data.Items || [];
};

const getById = async (appointmentId) => {
  const data = await dynamodbClient.send(
    new GetCommand({ TableName, Key: { appointmentId } }),
  );
  return data.Item || null;
};

const upsert = async (appointmentId, body, file) => {
  const { patientName, doctorName, specialty, appointmentDate, fee, status } =
    body;

  if (!appointmentDate || new Date(appointmentDate) < Date.now())
    throw Error("Thời gian không hợp lệ");
  if (fee <= 0) throw Error("Phí không hợp lệ");

  const newAppointmentId =
    appointmentId && appointmentId !== "undefined"
      ? appointmentId
      : Date.now().toString();
  let appointmentData = {
    appointmentId: newAppointmentId,
    patientName,
    doctorName,
    specialty,
    appointmentDate,
    fee,
    status,
  };

  if (appointmentId && appointmentId !== "undefined") {
    const data = await getById(appointmentId);
    if (data) appointmentData = { ...data, ...body };
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

    if (appointmentData.noteImageUrl) {
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket,
          Key: appointmentData.noteImageUrl.split("/").pop(),
        }),
      );
    }

    appointmentData.noteImageUrl = `https://${Bucket}.s3.amazonaws.com/${key}`;
  }

  await dynamodbClient.send(
    new PutCommand({
      TableName,
      Item: appointmentData,
    }),
  );
};

const deleteById = async (appointmentId) => {
  const data = await getById(appointmentId);
  if (data) {
    if (data.noteImageUrl) {
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket,
          Key: data.noteImageUrl.split("/").pop(),
        }),
      );
    }

    await dynamodbClient.send(
      new DeleteCommand({
        TableName,
        Key: { appointmentId },
      }),
    );
  }
};

module.exports = {
  getAll,
  getById,
  upsert,
  deleteById,
  handleThongKe,
};
