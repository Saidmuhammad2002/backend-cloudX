// Filename: handler.ts
import { Handler } from "aws-lambda";
import {
  DynamoDBClient,
  TransactWriteItemsCommand,
} from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { buildResponse } from "../utils/responseBuillder";

const dynamoDB = new DynamoDBClient({ region: process.env.AWS_REGION });
const productTable = process.env.PRODUCTS_TABLE as string;
const stockTable = process.env.STOCK_TABLE as string;

export const handler: Handler = async (event) => {
  try {
    const { title, description, price, count } = JSON.parse(event.body);

    if (!title || !price || count == null) {
      return buildResponse(400, { message: "Missing required fields." });
    }

    const id = uuidv4();

    const command = new TransactWriteItemsCommand({
      TransactItems: [
        {
          Put: {
            TableName: productTable,
            Item: {
              id: { S: id },
              title: { S: title },
              description: { S: description || "" },
              price: { N: price.toString() },
              created_at: { N: Date.now().toString() },
            },
          },
        },
        {
          Put: {
            TableName: stockTable,
            Item: {
              product_id: { S: id },
              count: { N: count.toString() },
              created_at: { N: Date.now().toString() },
            },
          },
        },
      ],
    });

    await dynamoDB.send(command);

    return buildResponse(201, { message: "Product created", id });
  } catch (error) {
    return buildResponse(500, { message: "Internal Server Error" });
  }
};
