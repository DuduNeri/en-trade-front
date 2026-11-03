import { ErrorBoundary } from "react-error-boundary";
import api from "../connection";
import type {
  CreateProduct,
  Product,
} from "../interfaces/prodsInterface/prodsInterface";

export async function getAllProds(): Promise<Product[]> {
  const response = await api.get<Product[]>("/product/all");
  console.log(response.data);
  return response.data;
}

export async function deleteProd(id: string) {
  const res = await api.delete(`/product/${id}`);
  if (!res) {
    console.log(ErrorBoundary);
  }

  return res;
}

export async function createProd(data: CreateProduct) {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    formData.append(key, value instanceof File ? value : String(value));
  });

  return api.post(`/product/create`, formData);
}

export async function addFavorite(productId: string): Promise<Product> {
  try {
    const res = await api.post<Product>(`/product/${productId}/favorite`)

    return res.data
  } catch (error) {
    console.error('Erro ao favoritar produto:', error);
    throw error;
  }
}

export async function removeToFavorites(productId: string) {
  try {
    const res = await api.delete(`/product/${productId}/favorites`)
    if (!res) {
      console.log(ErrorBoundary);
    }
    return res
  } catch (error) {
    console.error('Erro ao favoritar produto:', error);
    throw error;
  }
}