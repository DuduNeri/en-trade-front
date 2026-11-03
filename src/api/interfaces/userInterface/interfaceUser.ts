export interface UserLogin {
  email: string;
  password: string;
}

export interface UserRegister {
  name: string;
  email: string;
  password: string;
}

export interface GetUserInterface {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  products: ProductInterface[];
}
export interface ProductInterface {
  id?: string;

  title: string;
  slug?: string;

  description: string;

  price: number;

  stock_quantity: number;

  sku?: string;

  category_id: string;

  image?: string;

  images?: string[];

  is_active?: boolean;

  weight?: number;
  height?: number;
  width?: number;
  length?: number;

  userId: string;
}
