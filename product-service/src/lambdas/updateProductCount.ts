import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { Handler } from "aws-lambda";
import { buildResponse } from "../utils/responseBuillder";

const stockTable = process.env.STOCK_TABLE as string;

const dynamoDB = new DynamoDBClient({ region: process.env.AWS_REGION });

export const handler: Handler = async (event) => {
  const productId = event.pathParameters?.productId;
  const requestBody = JSON.parse(event.body || "{}");

  if (!productId) {
    return buildResponse(400, { message: "Missing productId in path" });
  }

  const { count } = requestBody;

  if (typeof count !== "number") {
    return buildResponse(400, { message: "Invalid stock count" });
  }

  const command = new UpdateItemCommand({
    TableName: stockTable,
    Key: { product_id: { S: productId } },
    UpdateExpression: "SET #count = :count, updated_at = :updated_at",
    ExpressionAttributeNames: {
      "#count": "count",
    },
    ExpressionAttributeValues: {
      ":count": { N: count.toString() },
      ":updated_at": { N: Date.now().toString() },
    },
    ReturnValues: "ALL_NEW",
  });

  try {
    const result = await dynamoDB.send(command);
    return buildResponse(200, { message: "Stock updated", data: result });
  } catch (error) {
    console.error("Error updating stock:", error);
    return buildResponse(500, { message: "Internal server error" });
  }
};
