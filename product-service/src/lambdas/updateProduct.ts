import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { Handler } from "aws-lambda";
import { buildResponse } from "../utils/responseBuillder";

const productTable = process.env.PRODUCTS_TABLE as string;

const dynamoDB = new DynamoDBClient({ region: process.env.AWS_REGION });

export const handler: Handler = async (event) => {
  const productId = event.pathParameters?.productId;
  const requestBody = JSON.parse(event.body || "{}");

  if (!productId) {
    return buildResponse(400, { message: "Missing productId in path" });
  }

  const { description, price, title } = requestBody;

  if (
    typeof price !== "number" ||
    typeof description !== "string" ||
    typeof title !== "string"
  ) {
    return buildResponse(400, { message: "Invalid data" });
  }

  const command = new UpdateItemCommand({
    TableName: productTable,
    Key: { id: { S: productId } },
    UpdateExpression:
      "SET description = :desc, price = :price, updatedAt = :updatedAt",
    ExpressionAttributeValues: {
      ":title": { S: title },
      ":desc": { S: description },
      ":price": { N: price.toString() },
      ":updated_at": { N: Date.now().toString() },
    },
    ReturnValues: "ALL_NEW",
  });

  try {
    const result = await dynamoDB.send(command);
    return buildResponse(200, { message: "Product updated", data: result });
  } catch (error) {
    console.error("Error updating product:", error);
    return buildResponse(500, { message: "Internal server error" });
  }
};
