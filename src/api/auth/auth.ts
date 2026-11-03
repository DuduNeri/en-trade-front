import api from "../connection";
import type {
  UserLogin,
  UserRegister,
} from "../interfaces/userInterface/interfaceUser";

export async function login(data: UserLogin) {
  try {
    const response = await api.post("/auth/signin", data);

    localStorage.setItem("userName", response.data.user.name);
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("userId", response.data.user.id);

    return response;
  } catch (error: any) {
    console.log("Erro aqui:", error);
    throw error;
  }
}

export async function register(data: UserRegister) {
  try {
    const response = await api.post("/user/create", data);

    localStorage.setItem("token", response.data.token);
    localStorage.setItem("userId", response.data.user.id);
    localStorage.setItem("userName", response.data.user.name);

    return response;
  } catch (error: any) {
    console.log("Erro aqui:", error);
    throw error;
  }
}

export async function sellerRegister(data: UserRegister) {
  try {
    const response = await api.post("/user/create-seller", data);

    localStorage.setItem("token", response.data.token);
    localStorage.setItem("userId", response.data.user.id);
    localStorage.setItem("userName", response.data.user.name);

    return response;
  } catch (error: any) {
    console.log("Erro aqui:", error);
    throw error;
  }
}