import { handler as getProductsList } from "../src/lambdas/getProductsList";
import { handler as getProductsById } from "../src/lambdas/getProductsById";
import { products } from "../src/data/products";
import { APIGatewayProxyResult } from "aws-lambda";

// import * as cdk from 'aws-cdk-lib';
// import { Template } from 'aws-cdk-lib/assertions';
// import * as ProductService from '../lib/product-service-stack';

// example test. To run these tests, uncomment this file along with the
// example resource in lib/product-service-stack.ts
test("SQS Queue Created", () => {
  //   const app = new cdk.App();
  //     // WHEN
  //   const stack = new ProductService.ProductServiceStack(app, 'MyTestStack');
  //     // THEN
  //   const template = Template.fromStack(stack);
  //   template.hasResourceProperties('AWS::SQS::Queue', {
  //     VisibilityTimeout: 300
  //   });
});

describe("getProductsList Lambda", () => {
  it("should return all products with status 200", async () => {
    const event = {} as any;
    const result = (await getProductsList(
      event,
      {} as any,
      () => {}
    )) as APIGatewayProxyResult;
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual(products);
  });
});

describe("getProductsById Lambda", () => {
  it("should return a product by id with status 200", async () => {
    const event = { pathParameters: { productId: products[0].id } } as any;
    const result = (await getProductsById(
      event,
      {} as any,
      () => {}
    )) as APIGatewayProxyResult;
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual(products[0]);
  });

  it("should return 404 if product not found", async () => {
    const event = { pathParameters: { productId: "non-existent-id" } } as any;
    const result = (await getProductsById(
      event,
      {} as any,
      () => {}
    )) as APIGatewayProxyResult;
    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body)).toEqual({ message: "Product not found" });
  });
});
