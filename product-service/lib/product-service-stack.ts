import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as path from "path";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as dotenv from "dotenv";

dotenv.config();

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB Tables
    const productsTable = new dynamodb.Table(this, "Products", {
      tableName: process.env.PRODUCTS_TABLE,
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const stockTable = new dynamodb.Table(this, "Stocks", {
      tableName: process.env.STOCK_TABLE,
      partitionKey: { name: "product_id", type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Lambda functions
    const getProductsListLambda = new lambda.Function(
      this,
      "GetProductsListLambda",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        memorySize: 1024,
        timeout: cdk.Duration.seconds(5),
        handler: "index.handler",
        code: lambda.Code.fromAsset(
          path.join(__dirname, "../dist/getProductsList")
        ),
        environment: {
          PRODUCTS_TABLE: productsTable.tableName,
          STOCK_TABLE: stockTable.tableName,
        },
      }
    );

    const getProductByIdLambda = new lambda.Function(
      this,
      "GetProductByIdLambda",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        memorySize: 1024,
        timeout: cdk.Duration.seconds(5),
        handler: "index.handler",
        code: lambda.Code.fromAsset(
          path.join(__dirname, "../dist/getProductsById")
        ),
        environment: {
          PRODUCTS_TABLE: productsTable.tableName,
          STOCK_TABLE: stockTable.tableName,
        },
      }
    );

    const createProductLambda = new lambda.Function(
      this,
      "CreateProductLambda",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        memorySize: 1024,
        timeout: cdk.Duration.seconds(5),
        handler: "index.handler",
        code: lambda.Code.fromAsset(
          path.join(__dirname, "../dist/createProduct")
        ),
        environment: {
          PRODUCTS_TABLE: productsTable.tableName,
          STOCK_TABLE: stockTable.tableName,
        },
      }
    );

    const updateProductLambda = new lambda.Function(
      this,
      "UpdateProductLambda",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        memorySize: 1024,
        timeout: cdk.Duration.seconds(5),
        handler: "index.handler",
        code: lambda.Code.fromAsset(
          path.join(__dirname, "../dist/updateProduct")
        ),
        environment: {
          PRODUCTS_TABLE: productsTable.tableName,
          STOCK_TABLE: stockTable.tableName,
        },
      }
    );

    const updateProductCountLambda = new lambda.Function(
      this,
      "UpdateProductCountLambda",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        memorySize: 1024,
        timeout: cdk.Duration.seconds(5),
        handler: "index.handler",
        code: lambda.Code.fromAsset(
          path.join(__dirname, "../dist/updateProductCount")
        ),
        environment: {
          PRODUCTS_TABLE: productsTable.tableName,
          STOCK_TABLE: stockTable.tableName,
        },
      }
    );

    const deleteProductLambda = new lambda.Function(
      this,
      "DeleteProductLambda",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        memorySize: 1024,
        timeout: cdk.Duration.seconds(5),
        handler: "index.handler",
        code: lambda.Code.fromAsset(
          path.join(__dirname, "../dist/deleteProduct")
        ),
        environment: {
          PRODUCTS_TABLE: productsTable.tableName,
          STOCK_TABLE: stockTable.tableName,
        },
      }
    );

    // Grant access to DynamoDB tables
    productsTable.grantReadData(getProductsListLambda);
    stockTable.grantReadData(getProductsListLambda);
    productsTable.grantReadData(getProductByIdLambda);
    stockTable.grantReadData(getProductByIdLambda);
    productsTable.grantWriteData(createProductLambda);
    stockTable.grantWriteData(createProductLambda);
    productsTable.grantWriteData(updateProductLambda);
    stockTable.grantWriteData(updateProductLambda);
    productsTable.grantWriteData(deleteProductLambda);
    stockTable.grantWriteData(deleteProductLambda);
    stockTable.grantWriteData(updateProductCountLambda);

    // API Gateway
    const api = new apigateway.RestApi(this, "ProductServiceApi", {
      restApiName: "Product Service",
      description: "Product Service API",
    });

    const productsResource = api.root.addResource("products");
    productsResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(getProductsListLambda)
    );
    productsResource.addMethod(
      "POST",
      new apigateway.LambdaIntegration(createProductLambda)
    );

    const productByIdResource = productsResource.addResource("{productId}");
    productByIdResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(getProductByIdLambda)
    );
    productByIdResource.addMethod(
      "PUT",
      new apigateway.LambdaIntegration(updateProductLambda)
    );
    productByIdResource.addMethod(
      "DELETE",
      new apigateway.LambdaIntegration(deleteProductLambda)
    );

    const productByIdStockResource = productByIdResource.addResource("stock");
    productByIdStockResource.addMethod(
      "PUT",
      new apigateway.LambdaIntegration(updateProductCountLambda)
    );
  }
}
