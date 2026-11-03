import { jwtDecode } from "jwt-decode";

interface TokenPayload {
  sub?: string;
  id?: string;
  userId?: string;
  email?: string;
  role?: string;
  exp: number;
}

export function getUserIdFromToken(): string | null {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = jwtDecode<TokenPayload>(token);

    if (payload.exp && payload.exp * 1000 < Date.now()) {
      localStorage.removeItem("token");
      return null;
    }

    return payload.sub ?? payload.id ?? payload.userId ?? null;
  } catch {
    return null;
  }
}