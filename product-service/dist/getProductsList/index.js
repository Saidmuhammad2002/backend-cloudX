"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/lambdas/getProductsList.ts
var getProductsList_exports = {};
__export(getProductsList_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(getProductsList_exports);

// src/utils/responseBuillder.ts
var defaultHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "OPTIONS,GET"
};
var buildResponse = (statusCode, body, customHeaders = {}) => {
  return {
    statusCode,
    headers: { ...defaultHeaders, ...customHeaders },
    body: JSON.stringify(body)
  };
};

// src/data/products.ts
var products = [
  {
    id: "1",
    title: "Apple iPhone 15",
    description: "Latest Apple iPhone with A16 Bionic chip",
    price: 999,
    count: 10
  },
  {
    id: "2",
    title: "Samsung Galaxy S24",
    description: "Flagship Samsung phone with advanced camera",
    price: 899,
    count: 15
  },
  {
    id: "3",
    title: "Google Pixel 8",
    description: "Google phone with pure Android experience",
    price: 799,
    count: 8
  },
  {
    id: "4",
    title: "OnePlus 12",
    description: "High-performance phone with fast charging",
    price: 699,
    count: 12
  }
];

// src/utils/mockFunctions.ts
var findAllProducts = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(products);
    }, 100);
  });
};

// src/lambdas/getProductsList.ts
var handler = async (event) => {
  const productsList = await findAllProducts();
  return buildResponse(200, productsList);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
