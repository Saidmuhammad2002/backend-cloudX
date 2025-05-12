// Filename: getProductsList/handler.ts
import { Handler } from "aws-lambda";
import {
  DynamoDBClient,
  ScanCommand,
  GetItemCommand,
} from "@aws-sdk/client-dynamodb";
import { buildResponse } from "../utils/responseBuillder";

const dynamoDB = new DynamoDBClient({ region: process.env.AWS_REGION });
const productTable = process.env.PRODUCTS_TABLE as string;
const stockTable = process.env.STOCK_TABLE as string;

export const handler: Handler = async (event) => {
  try {
    const command = new ScanCommand({
      TableName: productTable,
    });

    const result = await dynamoDB.send(command);

    if (result.Items) {
      const products = [];

      for (const item of result.Items) {
        const productId = item.id.S;
        if (!productId) continue;
        // Retrieve stockCount from stockTable
        const stockCommand = new GetItemCommand({
          TableName: stockTable,
          Key: {
            product_id: { S: productId },
          },
        });

        const stockResult = await dynamoDB.send(stockCommand);
        const stockCount = stockResult.Item?.count?.N || "0"; // Default to 0 if no stock data

        // Push the combined product data
        products.push({
          id: item.id.S,
          title: item.title.S,
          description: item.description.S,
          price: item.price.N,
          count: stockCount,
        });
      }

      return buildResponse(200, products);
    }

    return buildResponse(404, { message: "No products found" });
  } catch (error) {
    console.error("Error fetching products:", error);
    return buildResponse(500, { message: "Internal server error" });
  }
};
