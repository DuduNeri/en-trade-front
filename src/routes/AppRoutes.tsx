import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "../components/auth/Login";
import RegisterPage from "../components/auth/Register";
import { FeedPage } from "../components/pages/Feed";
import { ProfileSeller } from "../components/pages/layout/ProfileSeller";
import RegisterSeller from "../components/auth/SellerRegister";
import ProductsFav from '../components/pages/layout/Favorites';
import { ProfileUser } from '../components/pages/layout/ProfileUser';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/register-seller" element={<RegisterSeller />} />

      <Route path="/feed" element={<FeedPage />} />
      <Route path="/profile-user" element={<ProfileSeller />} />

      <Route path="/profile-user" element={<ProfileUser />} />

      <Route path="/favorites" element={<ProductsFav />} />

      {/* Fallback: qualquer rota desconhecida volta pro login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
