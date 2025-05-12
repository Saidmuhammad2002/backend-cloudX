// Filename: getProductsById/handler.ts
import { Handler } from "aws-lambda";
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
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

    // Retrieve product details from the Products table
    const productCommand = new GetItemCommand({
      TableName: productTable,
      Key: {
        id: { S: productId },
      },
    });

    const productResult = await dynamoDB.send(productCommand);

    if (!productResult.Item) {
      return buildResponse(404, { message: "Product not found" });
    }

    // Retrieve stockCount from the Stocks table
    const stockCommand = new GetItemCommand({
      TableName: stockTable,
      Key: {
        product_id: { S: productId },
      },
    });

    const stockResult = await dynamoDB.send(stockCommand);
    const stockCount = stockResult.Item?.count?.N || "0"; // Default to 0 if no stock data

    // Return the combined product data
    return buildResponse(200, {
      id: productResult.Item.id.S,
      title: productResult.Item.title.S,
      description: productResult.Item.description.S,
      price: productResult.Item.price.N,
      count: stockCount,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return buildResponse(500, { message: "Internal server error" });
  }
};
