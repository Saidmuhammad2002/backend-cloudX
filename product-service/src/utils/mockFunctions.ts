import { products } from "../data/products";

export const findProductById = async (productId: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const product = products.find((p) => p.id === productId);
      resolve(product);
    }, 100); // 100ms delay
  });
};

export const findAllProducts = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(products);
    }, 100); // 100ms delay
  });
};
