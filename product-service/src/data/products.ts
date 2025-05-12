// Product type definition
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  count: number;
}

// Mock data
export const products: Product[] = [
  {
    id: "1",
    title: "Apple iPhone 15",
    description: "Latest Apple iPhone with A16 Bionic chip",
    price: 999,
    count: 10,
  },
  {
    id: "2",
    title: "Samsung Galaxy S24",
    description: "Flagship Samsung phone with advanced camera",
    price: 899,
    count: 15,
  },
  {
    id: "3",
    title: "Google Pixel 8",
    description: "Google phone with pure Android experience",
    price: 799,
    count: 8,
  },
  {
    id: "4",
    title: "OnePlus 12",
    description: "High-performance phone with fast charging",
    price: 699,
    count: 12,
  },
];
