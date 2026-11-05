import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import {
  Box,
  Button,
  Container,
  IconButton,
  Skeleton,
  Typography,
  type SxProps,
  type Theme,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Product } from "../../../api/interfaces/prodsInterface/prodsInterface";
import { getFavorites, removeToFavorites } from "../../../api/products/prods";

const colors = {
  bg: "#090b12",
  surface: "#11141f",
  surfaceRaised: "#171b29",
  border: "rgba(255,255,255,0.08)",
  borderStrong: "rgba(255,255,255,0.16)",
  text: "#f5f6fa",
  textSecondary: "#b4bacb",
  textMuted: "#7d849a",
  accent: "#5b8cff",
  accentHover: "#4a7aeb",
  accentSoft: "rgba(91,140,255,0.14)",
  favorite: "#e5484d",
  favoriteSoft: "rgba(229,72,77,0.14)",
  imageTile: "#eef0f6",
  ink: "#1b1d26",
};

const INSTALLMENTS = 10;

type Status = "loading" | "success" | "error";

const formatPrice = (value: string | number) => {
  const n = Number(value);
  if (Number.isNaN(n)) return "—";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

const focusRing: SxProps<Theme> = {
  "&:focus-visible": {
    outline: `2px solid ${colors.accent}`,
    outlineOffset: 2,
  },
};

function ProductsFav() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setStatus("loading");

    getFavorites()
      .then((response) => {
        if (!active) return;
        setFavorites(response);
        setStatus("success");
      })
      .catch(() => {
        if (active) setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [attempt]);

  const handleRemove = async (productId: string) => {
    try {
      await removeToFavorites(productId);
      setFavorites((prev) => prev.filter((p) => p.id !== productId));
    } catch (error) {
      console.error("Erro ao remover dos favoritos:", error);
    }
  };

  // Volta uma página; se abriu direto na URL, vai para o feed
  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/feed");
  };

  return (
    <Box
      component="section"
      aria-label="Favoritos"
      sx={{
        bgcolor: colors.bg,
        backgroundImage:
          "radial-gradient(rgba(255,255,255,0.045) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
        color: colors.text,
        minHeight: "100vh",
      }}
    >
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        {/* Voltar */}
        <Button
          onClick={handleBack}
          startIcon={<ArrowBackIcon />}
          sx={{
            mb: 3,
            px: 1.5,
            py: 0.75,
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            color: colors.textSecondary,
            border: `1px solid ${colors.border}`,
            bgcolor: colors.surface,
            transition: "all .2s ease",
            "&:hover": {
              bgcolor: colors.surfaceRaised,
              borderColor: colors.borderStrong,
              color: colors.text,
            },
            ...focusRing,
          }}
        >
          Voltar
        </Button>

        {/* Cabeçalho */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 3,
              display: "grid",
              placeItems: "center",
              bgcolor: colors.favoriteSoft,
              border: `1px solid ${colors.favorite}55`,
              flexShrink: 0,
            }}
          >
            <FavoriteIcon sx={{ color: colors.favorite, fontSize: 28 }} />
          </Box>

          <Box>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: 28, md: 40 },
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
              }}
            >
              Favoritos
            </Typography>
            <Typography
              aria-live="polite"
              sx={{ fontSize: 14, color: colors.textMuted, mt: 0.5 }}
            >
              {status === "success" && favorites.length > 0
                ? `${favorites.length} ${
                    favorites.length === 1 ? "produto salvo" : "produtos salvos"
                  }`
                : "Seus produtos salvos em um só lugar"}
            </Typography>
          </Box>
        </Box>

        {/* Loading */}
        {status === "loading" && (
          <Box sx={gridSx} aria-busy="true" aria-label="Carregando favoritos">
            {Array.from({ length: 4 }, (_, i) => (
              <Box key={i} sx={cardSx}>
                <Skeleton
                  variant="rectangular"
                  sx={{
                    bgcolor: colors.surfaceRaised,
                    width: "100%",
                    height: "auto",
                    aspectRatio: "1 / 1",
                  }}
                />
                <Box sx={{ p: 2 }}>
                  <Skeleton sx={{ bgcolor: colors.surfaceRaised }} width="85%" />
                  <Skeleton
                    sx={{ bgcolor: colors.surfaceRaised, mt: 1 }}
                    width="50%"
                    height={32}
                  />
                </Box>
              </Box>
            ))}
          </Box>
        )}

        {/* Erro */}
        {status === "error" && (
          <Box role="status" sx={emptyBoxSx}>
            <Typography sx={{ fontSize: 18, fontWeight: 700 }}>
              Não foi possível carregar seus favoritos
            </Typography>
            <Typography sx={{ fontSize: 14, color: colors.textMuted }}>
              Verifique sua conexão e tente de novo.
            </Typography>
            <Button
              variant="contained"
              disableElevation
              onClick={() => setAttempt((n) => n + 1)}
              sx={{ ...buttonSx, mt: 1 }}
            >
              Tentar novamente
            </Button>
          </Box>
        )}

        {/* Vazio */}
        {status === "success" && favorites.length === 0 && (
          <Box role="status" sx={emptyBoxSx}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                bgcolor: colors.surfaceRaised,
              }}
            >
              <FavoriteBorderIcon
                sx={{ fontSize: 32, color: colors.textMuted }}
              />
            </Box>
            <Typography sx={{ fontSize: 18, fontWeight: 700 }}>
              Nenhum favorito ainda
            </Typography>
            <Typography
              sx={{ fontSize: 14, color: colors.textMuted, maxWidth: 360 }}
            >
              Toque no coração de um produto para salvá-lo aqui.
            </Typography>
            <Button
              variant="contained"
              disableElevation
              onClick={() => navigate("/feed")}
              sx={{ ...buttonSx, mt: 1 }}
            >
              Explorar produtos
            </Button>
          </Box>
        )}

        {/* Lista */}
        {status === "success" && favorites.length > 0 && (
          <Box sx={gridSx}>
            {favorites.map((prod) => (
              <Box
                key={prod.id}
                component="article"
                sx={{
                  ...cardSx,
                  transition: "border-color .2s ease, transform .2s ease",
                  "&:hover": {
                    borderColor: colors.borderStrong,
                    transform: "translateY(-2px)",
                    "& img": { transform: "scale(1.04)" },
                  },
                  "@media (prefers-reduced-motion: reduce)": {
                    transition: "none",
                    "&:hover": {
                      transform: "none",
                      "& img": { transform: "none" },
                    },
                  },
                }}
              >
                {/* Imagem */}
                <Box
                  sx={{
                    position: "relative",
                    aspectRatio: "1 / 1",
                    bgcolor: colors.imageTile,
                    overflow: "hidden",
                  }}
                >
                  <Box
                    component="img"
                    src={prod.image}
                    alt={prod.title}
                    loading="lazy"
                    sx={{
                      display: "block",
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      p: 3,
                      mixBlendMode: "multiply",
                      transition: "transform .4s ease",
                      "@media (prefers-reduced-motion: reduce)": {
                        transition: "none",
                      },
                    }}
                  />

                  <IconButton
                    size="small"
                    aria-label="Remover dos favoritos"
                    onClick={() => handleRemove(prod.id)}
                    sx={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      bgcolor: "#ffffff",
                      color: colors.favorite,
                      "&:hover": { bgcolor: "#ffffff", color: colors.ink },
                      ...focusRing,
                    }}
                  >
                    <FavoriteIcon fontSize="small" />
                  </IconButton>
                </Box>

                {/* Conteúdo */}
                <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 0.5 }}>
                  <Typography
                    component="h2"
                    sx={{
                      fontSize: 14,
                      fontWeight: 600,
                      lineHeight: 1.4,
                      color: colors.textSecondary,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      minHeight: "2.8em",
                    }}
                  >
                    {prod.title}
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: 24,
                      fontWeight: 800,
                      letterSpacing: "-0.02em",
                      fontVariantNumeric: "tabular-nums",
                      mt: 0.5,
                    }}
                  >
                    {formatPrice(prod.price)}
                  </Typography>

                  <Typography sx={{ fontSize: 13, color: colors.textMuted }}>
                    ou {INSTALLMENTS}x de{" "}
                    {formatPrice(Number(prod.price) / INSTALLMENTS)} sem juros
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
}

const gridSx: SxProps<Theme> = {
  display: "grid",
  gap: 2.5,
  gridTemplateColumns: {
    xs: "1fr",
    sm: "repeat(2, 1fr)",
    md: "repeat(3, 1fr)",
    lg: "repeat(4, 1fr)",
  },
};

const cardSx: SxProps<Theme> = {
  bgcolor: colors.surface,
  border: `1px solid ${colors.border}`,
  borderRadius: 3,
  overflow: "hidden",
};

const emptyBoxSx: SxProps<Theme> = {
  py: 8,
  px: 3,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 1,
  textAlign: "center",
  borderRadius: 3,
  border: `1px dashed ${colors.borderStrong}`,
  bgcolor: colors.surface,
};

const buttonSx: SxProps<Theme> = {
  borderRadius: 2,
  textTransform: "none",
  fontWeight: 600,
  bgcolor: colors.accent,
  "&:hover": { bgcolor: colors.accentHover },
  ...focusRing,
};

export default ProductsFav;