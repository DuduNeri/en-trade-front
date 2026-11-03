import api from "../connection";
import type { GetUserInterface } from "../interfaces/userInterface/interfaceUser";

export async function getUser(id: string): Promise<GetUserInterface> {
  try {
    const response = await api.get<GetUserInterface>(`/user/${id}`);
    console.log(response.data)
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}   

export async function updateAvatar(file: File) {
  const formData = new FormData();
  formData.append("avatar", file);

  const res = await api.patch("/user/avatar", formData);
  return res.data;
}