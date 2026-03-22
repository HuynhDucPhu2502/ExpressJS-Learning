const { S3Client } = require("@aws-sdk/client-s3");

// JDBc Driver
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
// Jpa/Hibernate Wrapper
const { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb");

const info = {
  region: "ap-southeast-1",
  credentials: {
    accessKeyId: "",
    secretAccessKey: "",
  },
};

const s3Client = new S3Client(info);
const dynamoDbCleint = DynamoDBDocument.from(new DynamoDBClient(info));

module.exports = {
  s3Client,
  dynamoDbCleint,
};
