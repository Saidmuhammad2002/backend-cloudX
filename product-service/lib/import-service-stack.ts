// lib/import-service-stack.ts
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { S3EventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import path = require("path");

export class ImportServiceStack extends cdk.Stack {
  public readonly bucket: s3.Bucket;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.bucket = new s3.Bucket(this, "ImportServiceBucket", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,

    });

    this.bucket.addCorsRule({
        allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT],
        allowedOrigins: ["*"],
        allowedHeaders: ["*"],
        exposedHeaders: ["ETag"],
    })
    

    const importProductsFileLambda = new lambda.Function(
      this,
      "importProductsFileLambda",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: "index.handler",
        code: lambda.Code.fromAsset(
            path.join(__dirname, "../dist/importProductsFile")
        ),
        environment: {
          BUCKET_NAME: this.bucket.bucketName,
        },
      }
    );
    const importFileParserLambda = new lambda.Function(
      this,
      "importFileParserLambda",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: "index.handler",
        code: lambda.Code.fromAsset(
            path.join(__dirname, "../dist/importFileParser")
        ),
        environment: {
          BUCKET_NAME: this.bucket.bucketName,
        },
      }
    );


    importFileParserLambda.addEventSource(
      new S3EventSource(this.bucket, {
        events: [s3.EventType.OBJECT_CREATED],
        filters: [{ prefix: "uploaded/" }],
      })
    );

    this.bucket.grantReadWrite(importProductsFileLambda);
    this.bucket.grantReadWrite(importFileParserLambda);

    const api = new apigateway.RestApi(this, "ImportApi");
    const importResource = api.root.addResource("import");
    importResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(importProductsFileLambda)
    );
  }
}
