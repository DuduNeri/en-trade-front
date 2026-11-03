import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "../components/auth/Login";
import RegisterPage from "../components/auth/Register";
import { FeedPage } from "../components/pages/Feed";
import {Profile} from "../components/pages/layout/Profile";
import RegisterSeller from "../components/auth/SellerRegister";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/register-seller" element={<RegisterSeller />} />

      <Route path="/feed" element={<FeedPage />} />
      <Route path="/profile" element={<Profile />} />

      {/* Fallback: qualquer rota desconhecida volta pro login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
