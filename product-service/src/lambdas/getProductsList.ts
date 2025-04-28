import { APIGatewayProxyHandler } from "aws-lambda";
import { products } from "../data/products";
import { buildResponse } from "../utils/responseBuillder";
import { findAllProducts } from "../utils/mockFunctions";

export const handler: APIGatewayProxyHandler = async (event) => {
  const productsList = await findAllProducts();
  return buildResponse(200, productsList);
};
