const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { S3Client } = require("@aws-sdk/client-s3");
const { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb");

const info = {
  region: "ap-southeast-1",
  credentials: {
    accessKeyId: "",
    secretAccessKey: "",
  },
};

const dynamodbClient = DynamoDBDocument.from(new DynamoDBClient(info));
const s3Client = new S3Client(info);

module.exports = { dynamodbClient, s3Client };
