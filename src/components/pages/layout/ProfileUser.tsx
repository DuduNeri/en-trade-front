import ArrowBackIcon from "@mui/icons-material/ArrowBackRounded";
import BadgeIcon from "@mui/icons-material/BadgeOutlined";
import CheckIcon from "@mui/icons-material/CheckRounded";
import ChevronRightIcon from "@mui/icons-material/ChevronRightRounded";
import ContentCopyIcon from "@mui/icons-material/ContentCopyRounded";
import EmailIcon from "@mui/icons-material/EmailOutlined";
import FavoriteIcon from "@mui/icons-material/FavoriteBorderRounded";
import LocationIcon from "@mui/icons-material/LocationOnOutlined";
import LogoutIcon from "@mui/icons-material/LogoutRounded";
import PersonIcon from "@mui/icons-material/PersonOutline";
import ReceiptIcon from "@mui/icons-material/ReceiptLongOutlined";
import RefreshIcon from "@mui/icons-material/RefreshRounded";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBagOutlined";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCartOutlined";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  IconButton,
  Skeleton,
  Snackbar,
  Tooltip,
  Typography,
} from "@mui/material";
import type { ChangeEvent, ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { GetUserInterface } from "../../../api/interfaces/userInterface/interfaceUser";
import { getUser, updateAvatar } from "../../../api/user/user";
import { getUserIdFromToken } from "../../../utils/auth";

const colors = {
  bg: "#090b12",
  surface: "#11141f",
  surfaceRaised: "#171b29",
  border: "rgba(255,255,255,0.08)",
  borderStrong: "rgba(255,255,255,0.16)",
  text: "#f5f6fa",
  textSecondary: "#b4bacb",
  textMuted: "#7d849a",
  accent: "#00FFFF",
  accentHover: "#4de8e8",
  accentSoft: "rgba(0,255,255,0.12)",
  onAccent: "#08060d",
  danger: "#ff7a7a",
  dangerSoft: "rgba(255,122,122,0.14)",
  success: "#4ade80",
};

const focusRing = { outline: `2px solid ${colors.accent}`, outlineOffset: 2 };
const reducedMotion = "@media (prefers-reduced-motion: reduce)";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

const roleLabels: Record<string, string> = {
  seller: "Vendedor",
  admin: "Administrador",
  customer: "Cliente",
};

/* ---------- Atalhos da conta (ajuste as rotas para as do seu app) ---------- */
const shortcuts = [
  {
    label: "Meus pedidos",
    description: "Acompanhe suas compras",
    icon: <ReceiptIcon />,
    to: "/orders",
  },
  {
    label: "Favoritos",
    description: "Produtos que você salvou",
    icon: <FavoriteIcon />,
    to: "/favorites",
  },
  {
    label: "Carrinho",
    description: "Itens prontos para comprar",
    icon: <ShoppingCartIcon />,
    to: "/cart",
  },
  {
    label: "Endereços",
    description: "Onde receber seus pedidos",
    icon: <LocationIcon />,
    to: "/addresses",
  },
];

/* ---------- Página ---------- */
export function ProfileUser() {
  const [user, setUser] = useState<GetUserInterface | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    severity: "success" | "error";
  } | null>(null);
  const navigate = useNavigate();

  const loadUser = useCallback(async () => {
    const userId = getUserIdFromToken();

    if (!userId) {
      setError("Sessão inválida. Faça login novamente.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getUser(userId);
      setUser(data);
    } catch {
      setError("Não foi possível carregar o perfil.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setToast({ message: "Escolha um arquivo de imagem.", severity: "error" });
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setToast({
        message: "A imagem deve ter no máximo 5 MB.",
        severity: "error",
      });
      return;
    }

    try {
      const data = await updateAvatar(file);
      setUser((prev) => (prev ? { ...prev, avatar: data.avatar } : prev));
      setToast({ message: "Foto atualizada!", severity: "success" });
    } catch (err) {
      console.error("Erro ao atualizar avatar:", err);
      setToast({
        message: "Não foi possível atualizar a foto.",
        severity: "error",
      });
    }
  }

  function handleLogout() {
    // ajuste a chave para a que você usa no seu auth
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  }

  return (
    <Box
      component="main"
      aria-label="Perfil do usuário"
      sx={{
        minHeight: "100vh",
        bgcolor: colors.bg,
        color: colors.text,
        px: { xs: 2, sm: 4 },
        py: { xs: 2, sm: 4 },
        boxSizing: "border-box",
        backgroundImage:
          "radial-gradient(rgba(255,255,255,0.045) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    >
      <Box sx={{ maxWidth: 1040, mx: "auto" }}>
        {/* Barra superior */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <IconButton
            onClick={() => navigate(-1)}
            aria-label="Voltar"
            sx={{
              color: colors.text,
              "&:hover": { bgcolor: colors.accentSoft },
              "&:focus-visible": focusRing,
            }}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Typography variant="h6" fontWeight={700}>
            Meu perfil
          </Typography>
        </Box>

        {error ? (
          <ErrorState message={error} onRetry={loadUser} />
        ) : (
          <Box
            sx={{
              display: "grid",
              gap: 3,
              gridTemplateColumns: { xs: "1fr", md: "320px 1fr" },
              alignItems: "start",
            }}
          >
            {/* Coluna esquerda: identidade */}
            <Box
              component="aside"
              sx={{
                bgcolor: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: 4,
                p: 3,
                display: "flex",
                flexDirection: "column",
                gap: 2.5,
                position: { md: "sticky" },
                top: { md: 32 },
              }}
            >
              {loading || !user ? (
                <IdentitySkeleton />
              ) : (
                <>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 1.5,
                      textAlign: "center",
                    }}
                  >
                    <Tooltip title="Trocar foto">
                      <label
                        htmlFor="avatar-upload"
                        style={{ cursor: "pointer" }}
                      >
                        <Avatar
                          src={user.avatar}
                          alt={`Avatar de ${user.name}`}
                          sx={{
                            width: 112,
                            height: 112,
                            fontSize: 40,
                            fontWeight: 700,
                            bgcolor: colors.accentSoft,
                            color: colors.accent,
                            border: `3px solid ${colors.accent}`,
                            outline: `6px solid ${colors.accentSoft}`,
                            mb: 0.5,
                            transition: "0.2s ease",
                            "&:hover": {
                              opacity: 0.8,
                              filter: "brightness(0.85)",
                            },
                            [reducedMotion]: { transition: "none" },
                          }}
                        >
                          {!user.avatar && user.name?.charAt(0).toUpperCase()}
                        </Avatar>
                        <input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={handleAvatarChange}
                        />
                      </label>
                    </Tooltip>

                    <Typography
                      variant="h5"
                      fontWeight={800}
                      letterSpacing="-0.02em"
                      sx={{ wordBreak: "break-word" }}
                    >
                      {user.name}
                    </Typography>

                    <Chip
                      icon={<PersonIcon />}
                      label={roleLabels[user.role] ?? user.role}
                      size="small"
                      sx={{
                        bgcolor: colors.accentSoft,
                        color: colors.accent,
                        fontWeight: 600,
                        "& .MuiChip-icon": { color: colors.accent },
                      }}
                    />
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                      pt: 2.5,
                      borderTop: `1px solid ${colors.border}`,
                    }}
                  >
                    <InfoRow
                      icon={<EmailIcon fontSize="small" />}
                      label="E-mail"
                      value={user.email}
                      copyable
                    />
                    <InfoRow
                      icon={<BadgeIcon fontSize="small" />}
                      label="ID do usuário"
                      value={user.id}
                      copyable
                    />

                    <Button
                      variant="outlined"
                      startIcon={<ShoppingBagIcon />}
                      onClick={() => navigate("/")}
                      sx={{
                        mt: 0.5,
                        color: colors.accent,
                        borderColor: colors.accent,
                        borderRadius: "10px",
                        padding: "9px 16px",
                        backgroundColor: colors.accentSoft,
                        textTransform: "none",
                        fontWeight: 600,
                        transition: "all 0.25s ease",
                        "&:hover": {
                          backgroundColor: colors.accent,
                          color: colors.onAccent,
                          borderColor: colors.accent,
                          boxShadow: "0 0 15px rgba(0, 255, 255, 0.5)",
                          transform: "translateY(-2px)",
                        },
                        "&:focus-visible": focusRing,
                        [reducedMotion]: {
                          transition: "none",
                          "&:hover": { transform: "none" },
                        },
                      }}
                    >
                      Continuar comprando
                    </Button>

                    <Button
                      startIcon={<LogoutIcon />}
                      onClick={handleLogout}
                      sx={{
                        color: colors.danger,
                        textTransform: "none",
                        fontWeight: 600,
                        borderRadius: "10px",
                        "&:hover": { bgcolor: colors.dangerSoft },
                        "&:focus-visible": focusRing,
                      }}
                    >
                      Sair da conta
                    </Button>
                  </Box>
                </>
              )}
            </Box>

            {/* Coluna direita: acesso rápido + atividade */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Box>
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                  sx={{ mb: 1.5 }}
                >
                  Minha conta
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gap: 2,
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
                  }}
                >
                  {shortcuts.map((item) => (
                    <ShortcutCard
                      key={item.to}
                      icon={item.icon}
                      label={item.label}
                      description={item.description}
                      loading={loading}
                      onClick={() => navigate(item.to)}
                    />
                  ))}
                </Box>
              </Box>

              <Box>
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                  sx={{ mb: 1.5 }}
                >
                  Pedidos recentes
                </Typography>

                {/* Troque este estado vazio pela lista real quando o endpoint de pedidos existir */}
                <Box
                  sx={{
                    py: 7,
                    px: 3,
                    textAlign: "center",
                    borderRadius: 3,
                    border: `1px dashed ${colors.borderStrong}`,
                    bgcolor: colors.surface,
                  }}
                >
                  <ReceiptIcon
                    sx={{ color: colors.textMuted, fontSize: 36, mb: 1 }}
                  />
                  <Typography fontWeight={600}>
                    Você ainda não fez nenhum pedido
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: colors.textMuted, mt: 0.5 }}
                  >
                    Quando você comprar, seus pedidos vão aparecer aqui.
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      {/* Feedback */}
      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {toast ? (
          <Alert
            onClose={() => setToast(null)}
            severity={toast.severity}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {toast.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
}

/* ---------- Subcomponentes ---------- */
function ShortcutCard({
  icon,
  label,
  description,
  loading,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  description: string;
  loading: boolean;
  onClick: () => void;
}) {
  if (loading) {
    return (
      <Skeleton
        variant="rounded"
        height={84}
        sx={{ bgcolor: colors.surface, borderRadius: 3 }}
      />
    );
  }

  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      sx={{
        cursor: "pointer",
        bgcolor: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: 3,
        p: 2.25,
        display: "flex",
        alignItems: "center",
        gap: 1.75,
        transition: "border-color 0.2s ease, transform 0.2s ease",
        "&:hover": {
          borderColor: colors.accent,
          transform: "translateY(-2px)",
        },
        "&:focus-visible": focusRing,
        [reducedMotion]: {
          transition: "none",
          "&:hover": { transform: "none" },
        },
      }}
    >
      <Box
        aria-hidden="true"
        sx={{
          width: 40,
          height: 40,
          flexShrink: 0,
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: colors.accentSoft,
          color: colors.accent,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography fontWeight={700} noWrap>
          {label}
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: colors.textMuted }}
          noWrap
          component="p"
        >
          {description}
        </Typography>
      </Box>
      <ChevronRightIcon sx={{ color: colors.textMuted }} />
    </Box>
  );
}

function InfoRow({
  icon,
  label,
  value,
  copyable = false,
}: {
  icon?: ReactNode;
  label: string;
  value: string;
  copyable?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard indisponível: ignora */
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        p: 1.5,
        borderRadius: 2.5,
        bgcolor: colors.surfaceRaised,
        border: `1px solid ${colors.border}`,
      }}
    >
      {icon && (
        <Box
          sx={{ color: colors.textMuted, display: "flex" }}
          aria-hidden="true"
        >
          {icon}
        </Box>
      )}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="caption"
          sx={{ color: colors.textMuted, display: "block" }}
        >
          {label}
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: colors.textSecondary, wordBreak: "break-all" }}
        >
          {value}
        </Typography>
      </Box>

      {copyable && (
        <Tooltip title={copied ? "Copiado!" : "Copiar"}>
          <IconButton
            size="small"
            onClick={handleCopy}
            aria-label={`Copiar ${label}`}
            sx={{
              color: copied ? colors.success : colors.textMuted,
              "&:focus-visible": focusRing,
            }}
          >
            {copied ? (
              <CheckIcon fontSize="small" />
            ) : (
              <ContentCopyIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}

function IdentitySkeleton() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1.5,
      }}
      role="status"
      aria-live="polite"
      aria-label="Carregando perfil"
    >
      <Skeleton
        variant="circular"
        width={112}
        height={112}
        sx={{ bgcolor: colors.surfaceRaised }}
      />
      <Skeleton width="60%" height={32} sx={{ bgcolor: colors.surfaceRaised }} />
      <Skeleton width="30%" height={24} sx={{ bgcolor: colors.surfaceRaised }} />
      <Skeleton
        variant="rounded"
        width="100%"
        height={60}
        sx={{ bgcolor: colors.surfaceRaised }}
      />
    </Box>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <Box
      role="alert"
      sx={{
        maxWidth: 480,
        mx: "auto",
        mt: 8,
        p: 4,
        textAlign: "center",
        bgcolor: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: 4,
      }}
    >
      <Typography fontWeight={700} sx={{ color: colors.danger, mb: 0.5 }}>
        {message}
      </Typography>
      <Typography variant="body2" sx={{ color: colors.textMuted, mb: 2.5 }}>
        Verifique sua conexão e tente de novo.
      </Typography>
      <Button
        onClick={onRetry}
        startIcon={<RefreshIcon />}
        variant="contained"
        disableElevation
        sx={{
          bgcolor: colors.accent,
          color: colors.onAccent,
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 2,
          "&:hover": { bgcolor: colors.accentHover },
          "&:focus-visible": focusRing,
        }}
      >
        Tentar novamente
      </Button>
    </Box>
  );
}