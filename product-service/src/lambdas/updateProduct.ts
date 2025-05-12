import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { Handler } from "aws-lambda";
import { buildResponse } from "../utils/responseBuillder";

const productTable = process.env.PRODUCTS_TABLE as string;
const stockTable = process.env.STOCK_TABLE as string;

const dynamoDB = new DynamoDBClient({ region: process.env.AWS_REGION });

export const handler: Handler = async (event) => {
  const productId = event.pathParameters?.productId;
  const requestBody = JSON.parse(event.body || "{}");

  if (!productId) {
    return buildResponse(400, { message: "Missing productId in path" });
  }

  const { description, price, title, count } = requestBody;

  if (
    typeof price !== "number" ||
    typeof description !== "string" ||
    typeof title !== "string" ||
    typeof count !== "number"
  ) {
    return buildResponse(400, { message: "Invalid data" });
  }

  try {
    // Update product table
    const updateProductCommand = new UpdateItemCommand({
      TableName: productTable,
      Key: { id: { S: productId } },
      UpdateExpression:
        "SET title = :title, description = :desc, price = :price, updated_at = :updated_at",
      ExpressionAttributeValues: {
        ":title": { S: title },
        ":desc": { S: description },
        ":price": { N: price.toString() },
        ":updated_at": { N: Date.now().toString() },
      },
      ReturnValues: "ALL_NEW",
    });

    const productResult = await dynamoDB.send(updateProductCommand);

    // Update stock table
    const updateStockCommand = new UpdateItemCommand({
      TableName: stockTable,
      Key: { product_id: { S: productId } },
      UpdateExpression: "SET #count = :count",
      ExpressionAttributeNames: {
        "#count": "count",
      },
      ExpressionAttributeValues: {
        ":count": { N: count.toString() },
      },
      ReturnValues: "ALL_NEW",
    });

    const stockResult = await dynamoDB.send(updateStockCommand);

    return buildResponse(200, {
      message: "Product and stock updated",
      product: productResult.Attributes,
      stock: stockResult.Attributes,
    });
  } catch (error) {
    console.error("Error updating product or stock:", error);
    return buildResponse(500, { message: "Internal server error" });
  }
};
