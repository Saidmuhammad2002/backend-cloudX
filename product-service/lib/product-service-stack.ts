import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as path from "path";

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Lambda: getProductsList
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
      }
    );

    // Lambda: getProductsById
    const getProductsByIdLambda = new lambda.Function(
      this,
      "GetProductsByIdLambda",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        memorySize: 1024,
        timeout: cdk.Duration.seconds(5),
        handler: "index.handler",
        code: lambda.Code.fromAsset(
          path.join(__dirname, "../dist/getProductsById")
        ),
      }
    );

    // API Gateway
    const api = new apigateway.RestApi(this, "ProductServiceApi", {
      restApiName: "Product Service",
      description: "Product Service API",
    });

    // /products
    const productsResource = api.root.addResource("products");
    productsResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(getProductsListLambda)
    );

    // /products/{productId}
    const productByIdResource = productsResource.addResource("{productId}");
    productByIdResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(getProductsByIdLambda)
    );
  }
}
