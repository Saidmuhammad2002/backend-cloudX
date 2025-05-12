import { Handler } from "aws-lambda";
import {
  DynamoDBClient,
  TransactWriteItemsCommand,
} from "@aws-sdk/client-dynamodb";
import { buildResponse } from "../utils/responseBuillder";

const dynamoDB = new DynamoDBClient({ region: process.env.AWS_REGION });
const productTable = process.env.PRODUCTS_TABLE as string;
const stockTable = process.env.STOCK_TABLE as string;

export const handler: Handler = async (event) => {
  try {
    const productId = event.pathParameters?.productId;

    if (!productId) {
      return buildResponse(400, { message: "Missing productId in path" });
    }

    const command = new TransactWriteItemsCommand({
      TransactItems: [
        {
          Delete: {
            TableName: productTable,
            Key: {
              id: { S: productId },
            },
          },
        },
        {
          Delete: {
            TableName: stockTable,
            Key: {
              product_id: { S: productId },
            },
          },
        },
      ],
    });

    await dynamoDB.send(command);

    return buildResponse(200, { message: "Product and stock deleted" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return buildResponse(500, { message: "Internal server error" });
  }
};
