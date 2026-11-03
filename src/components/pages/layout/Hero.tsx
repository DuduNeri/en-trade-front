import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import InventoryIcon from "@mui/icons-material/Inventory2Outlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCartOutlined";
import {
  Box,
  Button,
  Chip,
  Container,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Skeleton,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { Product } from "../../../api/interfaces/prodsInterface/prodsInterface";
import { addFavorite, getAllProds, removeToFavorites } from "../../../api/products/prods";

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
  warning: "#f5b94a",
  warningSoft: "rgba(245,185,74,0.14)",
  danger: "#ff7a7a",
  dangerSoft: "rgba(255,122,122,0.14)",
  success: "#4ade80",
  successSoft: "rgba(74,222,128,0.12)",
  // Específicos do Hero
  imageTile: "#eef0f6", // claro, para o multiply apagar o fundo branco das fotos
  ink: "#1b1d26",
  favorite: "#e5484d",
};

const LOW_STOCK_LIMIT = 5;
const INSTALLMENTS = 10;
const SKELETON_COUNT = 8;

/* ---------- Helpers (mesmos do Profile) ---------- */
function toNumber(value: string | number | null | undefined) {
  const n = typeof value === "string" ? parseFloat(value) : Number(value);
  return Number.isNaN(n) ? 0 : n;
}

function formatPrice(value: string | number) {
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(n)) return "—";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function getStockStatus(quantity: number) {
  if (quantity <= 0) {
    return { label: "Esgotado", color: colors.danger, bg: colors.dangerSoft };
  }
  if (quantity <= LOW_STOCK_LIMIT) {
    return {
      label: `Restam ${quantity}`,
      color: colors.warning,
      bg: colors.warningSoft,
    };
  }
  return {
    label: `${quantity} em estoque`,
    color: colors.success,
    bg: colors.successSoft,
  };
}

/* ---------- Estilos compartilhados ---------- */
const gridSx = {
  display: "grid",
  gap: 2.5,
  gridTemplateColumns: {
    xs: "1fr",
    sm: "repeat(2, 1fr)",
    md: "repeat(3, 1fr)",
    lg: "repeat(4, 1fr)",
  },
};

const focusRing = {
  "&:focus-visible": {
    outline: `2px solid ${colors.accent}`,
    outlineOffset: 2,
  },
};

const fieldSx = {
  bgcolor: colors.surface,
  color: colors.text,
  borderRadius: 3,
  "& fieldset": { borderColor: colors.border },
  "&:hover fieldset": { borderColor: colors.borderStrong },
  "&.Mui-focused fieldset": { borderColor: colors.accent, borderWidth: 1 },
};

type SortKey = "relevance" | "price-asc" | "price-desc";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "relevance", label: "Mais relevantes" },
  { value: "price-asc", label: "Menor preço" },
  { value: "price-desc", label: "Maior preço" },
];

type Status = "loading" | "success" | "error";

/* ---------- Card de produto ---------- */
type ProductCardProps = {
  prod: Product;
  favorite: boolean;
  onToggleFavorite: (id: Product["id"]) => void;
  onToggleRemove: (id: Product["id"]) => void;
  onAddToCart?: (prod: Product) => void;
};

function ProductCard({
  prod,
  favorite,
  onToggleFavorite,
  onToggleRemove,
  onAddToCart,
}: ProductCardProps) {
  const stock = getStockStatus(toNumber(prod.stock_quantity));
  const soldOut = toNumber(prod.stock_quantity) <= 0;

  return (
    <Box
      component="article"
      sx={{
        bgcolor: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: 3,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
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
            opacity: soldOut ? 0.5 : 1,
            transition: "transform .4s ease",
            "@media (prefers-reduced-motion: reduce)": { transition: "none" },
          }}
        />

        <Chip
          label={stock.label}
          size="small"
          sx={{
            position: "absolute",
            top: 12,
            left: 12,
            height: 24,
            fontSize: 12,
            fontWeight: 700,
            bgcolor: colors.surface,
            color: stock.color,
            border: `1px solid ${stock.color}55`,
          }}
        />

        <IconButton
          size="small"
          aria-label={
            favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"
          }
          aria-pressed={favorite}
          onClick={() =>
            favorite ? onToggleRemove(prod.id) : onToggleFavorite(prod.id)
          }
          sx={{
            position: "absolute",
            top: 10,
            right: 10,
            bgcolor: "#ffffff",
            color: favorite ? colors.favorite : colors.ink,
            "&:hover": { bgcolor: "#ffffff" },
            ...focusRing,
          }}
        >
          {favorite ? (
            <FavoriteIcon fontSize="small" />
          ) : (
            <FavoriteBorderIcon fontSize="small" />
          )}
        </IconButton>
      </Box>

      {/* Conteúdo */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          gap: 0.5,
          p: 2,
        }}
      >
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
            color: colors.text,
            mt: 0.5,
          }}
        >
          {formatPrice(prod.price)}
        </Typography>

        <Typography sx={{ fontSize: 13, color: colors.textMuted }}>
          ou {INSTALLMENTS}x de {formatPrice(toNumber(prod.price) / INSTALLMENTS)}{" "}
          sem juros
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            color: colors.success,
          }}
        >
          <LocalShippingOutlinedIcon sx={{ fontSize: 16 }} />
          <Typography sx={{ fontSize: 12, fontWeight: 600 }}>
            Frete grátis
          </Typography>
        </Box>

        <Button
          variant="contained"
          fullWidth
          disableElevation
          disabled={soldOut}
          startIcon={<ShoppingCartIcon />}
          onClick={() => onAddToCart?.(prod)}
          sx={{
            mt: 2,
            py: 1.1,
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 700,
            bgcolor: colors.accent,
            color: "#ffffff",
            "&:hover": { bgcolor: colors.accentHover },
            "&.Mui-disabled": {
              bgcolor: colors.surfaceRaised,
              color: colors.textMuted,
            },
            ...focusRing,
          }}
        >
          {soldOut ? "Indisponível" : "Adicionar ao carrinho"}
        </Button>
      </Box>
    </Box>
  );
}

/* ---------- Skeleton ---------- */
function ProductSkeleton() {
  const bar = { bgcolor: colors.surfaceRaised };
  return (
    <Box
      sx={{
        bgcolor: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: 3,
        overflow: "hidden",
      }}
    >
      <Skeleton
        variant="rectangular"
        sx={{ ...bar, width: "100%", height: "auto", aspectRatio: "1 / 1" }}
      />
      <Box sx={{ p: 2 }}>
        <Skeleton sx={bar} width="90%" />
        <Skeleton sx={bar} width="60%" />
        <Skeleton sx={{ ...bar, mt: 1 }} width="45%" height={32} />
        <Skeleton variant="rounded" sx={{ ...bar, mt: 2 }} height={40} />
      </Box>
    </Box>
  );
}

/* ---------- Estados vazio / erro ---------- */
type StateMessageProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

function StateMessage({ title, description, action }: StateMessageProps) {
  return (
    <Box
      role="status"
      sx={{
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
      }}
    >
      <InventoryIcon sx={{ color: colors.textMuted, fontSize: 36 }} />
      <Typography sx={{ fontSize: 18, fontWeight: 700, color: colors.text }}>
        {title}
      </Typography>
      <Typography
        sx={{ fontSize: 14, color: colors.textMuted, maxWidth: 420 }}
      >
        {description}
      </Typography>
      {action && <Box sx={{ mt: 1.5 }}>{action}</Box>}
    </Box>
  );
}

/* ---------- Hero ---------- */
type HeroProps = {
  onAddToCart?: (prod: Product) => void;
};

export function Hero({ onAddToCart }: HeroProps) {
  const [prods, setProds] = useState<Product[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [attempt, setAttempt] = useState(0);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("relevance");
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [favorites, setFavorites] = useState<Set<Product["id"]>>(new Set());
  // const [remove, setRemove] = useState<Set<Product["id"]>>(new Set());

  useEffect(() => {
    let active = true;
    setStatus("loading");

    getAllProds()
      .then((response) => {
        if (!active) return;
        setProds(response);
        setStatus("success");
      })
      .catch((error) => {
        console.error("Erro ao buscar produtos:", error);
        if (active) setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [attempt]);

  // const toggleFavorite = (productId: string) => {
  //   setFavorites((prev) => {
  //     const next = addFavorite(productId)

  //     if (next(productId)) next(productId);
  //     else next.add(productId);
  //     return next;
  //   });
  // };

  const handleAddFavorite = async (productId: string) => {
    try {
      const res = await addFavorite(productId)
      setFavorites((prev) => {
        const next = new Set(prev);
        next.add(productId);
        return next;
      });
      console.log(res)
      return res;
    } catch (error: any) {
      console.log("Erro ao adicionar aos favoritos")
    }
  }

  const handleRemove = async (productId: string) => {
    try {
      const res = await removeToFavorites(productId)
      setFavorites((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
      console.log(res)
      return res;
    } catch (error: any) {
      console.log("Erro ao adicionar aos favoritos")
    }
  }


  const visibleProds = useMemo(() => {
    const term = query.trim().toLowerCase();

    let list = prods;
    if (term) list = list.filter((p) => p.title.toLowerCase().includes(term));
    if (onlyInStock) list = list.filter((p) => toNumber(p.stock_quantity) > 0);

    if (sort === "relevance") return list;

    const direction = sort === "price-asc" ? 1 : -1;
    return [...list].sort(
      (a, b) => (toNumber(a.price) - toNumber(b.price)) * direction,
    );
  }, [prods, query, sort, onlyInStock]);

  const hasFilters = query.trim() !== "" || onlyInStock;

  return (
    <Box
      component="section"
      aria-label="Produtos"
      sx={{
        bgcolor: colors.bg,
        backgroundImage:
          "radial-gradient(rgba(255,255,255,0.045) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
        color: colors.text,
      }}
    >
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        {/* Cabeçalho */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: 32, md: 48 },
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            Produtos
          </Typography>
          <Typography sx={{ fontSize: 16, color: colors.textMuted, mt: 1.5 }}>
            Frete grátis e parcelamento em até {INSTALLMENTS}x sem juros em
            todos os itens.
          </Typography>
        </Box>

        {/* Busca, filtro e ordenação */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 2,
            mb: 3,
          }}
        >
          <TextField
            size="small"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar produto"
            inputProps={{ "aria-label": "Buscar produto" }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: colors.textMuted }} />
                </InputAdornment>
              ),
            }}
            sx={{
              flexGrow: 1,
              maxWidth: { sm: 380 },
              "& .MuiOutlinedInput-root": fieldSx,
              "& input::placeholder": { color: colors.textMuted, opacity: 1 },
            }}
          />

          <Chip
            label="Só em estoque"
            clickable
            onClick={() => setOnlyInStock((v) => !v)}
            aria-pressed={onlyInStock}
            sx={{
              height: 40,
              px: 0.5,
              borderRadius: 3,
              fontWeight: 600,
              bgcolor: onlyInStock ? colors.accentSoft : colors.surface,
              color: onlyInStock ? colors.accent : colors.textSecondary,
              border: `1px solid ${onlyInStock ? colors.accent : colors.border}`,
              "&:hover": {
                bgcolor: onlyInStock ? colors.accentSoft : colors.surfaceRaised,
              },
              ...focusRing,
            }}
          />

          <Select
            size="small"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            SelectDisplayProps={{ "aria-label": "Ordenar produtos" }}
            MenuProps={{
              PaperProps: {
                sx: {
                  bgcolor: colors.surfaceRaised,
                  color: colors.text,
                  border: `1px solid ${colors.border}`,
                },
              },
            }}
            sx={{
              ...fieldSx,
              ml: { sm: "auto" },
              minWidth: 180,
              "& .MuiSelect-icon": { color: colors.textMuted },
            }}
          >
            {SORT_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </Box>

        {status === "success" && visibleProds.length > 0 && (
          <Typography
            aria-live="polite"
            sx={{ fontSize: 13, color: colors.textMuted, mb: 2 }}
          >
            {visibleProds.length}{" "}
            {visibleProds.length === 1 ? "produto" : "produtos"}
          </Typography>
        )}

        {/* Conteúdo */}
        {status === "loading" && (
          <Box sx={gridSx} aria-busy="true" aria-label="Carregando produtos">
            {Array.from({ length: SKELETON_COUNT }, (_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </Box>
        )}

        {status === "error" && (
          <StateMessage
            title="Não foi possível carregar os produtos"
            description="Verifique sua conexão e tente de novo."
            action={
              <Button
                variant="contained"
                disableElevation
                onClick={() => setAttempt((n) => n + 1)}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  bgcolor: colors.accent,
                  "&:hover": { bgcolor: colors.accentHover },
                  ...focusRing,
                }}
              >
                Tentar novamente
              </Button>
            }
          />
        )}

        {status === "success" && visibleProds.length === 0 && (
          <StateMessage
            title="Nenhum produto encontrado"
            description={
              query.trim()
                ? `Não achamos resultados para “${query}”. Tente outro termo.`
                : onlyInStock
                  ? "Nenhum produto está em estoque agora."
                  : "Ainda não há produtos disponíveis."
            }
            action={
              hasFilters ? (
                <Button
                  onClick={() => {
                    setQuery("");
                    setOnlyInStock(false);
                  }}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    color: colors.accent,
                    ...focusRing,
                  }}
                >
                  Limpar filtros
                </Button>
              ) : undefined
            }
          />
        )}

        {status === "success" && visibleProds.length > 0 && (
          <Box sx={gridSx}>
            {visibleProds.map((prod) => (
              <ProductCard
                key={prod.id}
                prod={prod}
                favorite={favorites.has(prod.id)}
                onToggleFavorite={handleAddFavorite}
                onToggleRemove={handleRemove}
                onAddToCart={onAddToCart}
              />
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
}