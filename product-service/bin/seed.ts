const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");

import { products } from "../src/data/products";
import * as dotenv from "dotenv";

dotenv.config();

const client = new DynamoDBClient({ region: process.env.AWS_REGION });

async function seed() {
  for (const item of products) {
    await client.send(
      new PutItemCommand({
        TableName: process.env.PRODUCTS_TABLE,
        Item: {
          id: { S: item.id },
          title: { S: item.title },
          description: { S: item.description },
          price: { N: item.price.toString() },
          created_at: { N: Date.now().toString() },
        },
      })
    );
    console.log(`Seeded product ${item.id}`);
  }
  for (const item of products) {
    await client.send(
      new PutItemCommand({
        TableName: process.env.STOCK_TABLE,
        Item: {
          product_id: { S: item.id },
          count: { N: item.count.toString() },
          created_at: { N: Date.now().toString() },
        },
      })
    );
    console.log(`Seeded stock for product ${item.id}`);
  }
  console.log("Seeding complete!");
}

seed().catch(console.error);
