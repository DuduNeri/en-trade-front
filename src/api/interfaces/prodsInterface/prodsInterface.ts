export interface Product {
  id: string;
  userId: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  stock_quantity: number;
  sku?: string;
  category_id: string;
  image?: string;
  images?: string[];
  is_active: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  };
}

export interface CreateProduct {
  title: string;
  slug?: string;
  description: string;
  price: number;
  stock_quantity: number;
  sku?: string;
  category_id?: string;
  is_active?: boolean;
  weight?: number;
  height?: number;
  width?: number;
  length?: number;
  image: File; // era string, agora é o arquivo
}