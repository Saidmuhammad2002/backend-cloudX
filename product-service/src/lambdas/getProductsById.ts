import { APIGatewayProxyHandler } from "aws-lambda";
import { products } from "../data/products";
import { buildResponse } from "../utils/responseBuillder";
import { findProductById } from "../utils/mockFunctions";

export const handler: APIGatewayProxyHandler = async (event) => {
  const { productId } = event.pathParameters as { productId: string };
  const product = await findProductById(productId);

  if (!product) {
    return buildResponse(404, { message: "Product not found" });
  }

  return buildResponse(200, product);
};
