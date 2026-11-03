import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCartOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBackRounded";
import BadgeIcon from "@mui/icons-material/BadgeOutlined";
import CheckIcon from "@mui/icons-material/CheckRounded";
import CloudUploadIcon from "@mui/icons-material/CloudUploadOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopyRounded";
import DeleteIcon from "@mui/icons-material/DeleteOutlineRounded";
import EmailIcon from "@mui/icons-material/EmailOutlined";
import InventoryIcon from "@mui/icons-material/Inventory2Outlined";
import PaymentsIcon from "@mui/icons-material/PaymentsOutlined";
import RefreshIcon from "@mui/icons-material/RefreshRounded";
import StorefrontIcon from "@mui/icons-material/StorefrontOutlined";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Skeleton,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import type { ChangeEvent, ReactNode } from "react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import type { CreateProduct } from "../../../api/interfaces/prodsInterface/prodsInterface";
import type { GetUserInterface } from "../../../api/interfaces/userInterface/interfaceUser";
import { createProd, deleteProd } from "../../../api/products/prods";
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
  warning: "#f5b94a",
  warningSoft: "rgba(245,185,74,0.14)",
  danger: "#ff7a7a",
  dangerSoft: "rgba(255,122,122,0.14)",
  success: "#4ade80",
  successSoft: "rgba(74,222,128,0.12)",
};

const focusRing = { outline: `2px solid ${colors.accent}`, outlineOffset: 2 };
const reducedMotion = "@media (prefers-reduced-motion: reduce)";
const roleLabels: Record<string, string> = {
  seller: "Vendedor",
  admin: "Administrador",
  customer: "Cliente",
};

const LOW_STOCK_LIMIT = 5;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

type Product = NonNullable<GetUserInterface["products"]>[number];
type ProductId = Product["id"];

/* ---------- Helpers ---------- */
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

/* ---------- Página ---------- */
export function Profile() {
  const [user, setUser] = useState<GetUserInterface | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<ProductId | null>(null);
  const [openCreateProduct, setOpenCreateProduct] = useState(false);
  const [creatingProduct, setCreatingProduct] = useState(false);
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

  async function createProductBy(data: CreateProduct) {
    try {
      setCreatingProduct(true);
      await createProd(data);
      console.log(data)
      setToast({
        message: "Produto cadastrado com sucesso!",
        severity: "success",
      });
      setOpenCreateProduct(false);
      await loadUser();
    } catch (err) {
      console.error("Erro ao cadastrar produto:", err);
      setToast({
        message: "Não foi possível cadastrar o produto.",
        severity: "error",
      });
    } finally {
      setCreatingProduct(false);
    }
  }

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await updateAvatar(file);
      setUser((prev) => (prev ? { ...prev, avatar: data.avatar } : prev));
    } catch (err) {
      console.error("Erro ao atualizar avatar:", err);
      setToast({
        message: "Não foi possível atualizar a foto.",
        severity: "error",
      });
    } finally {
      event.target.value = "";
    }
  }

  async function confirmDelete() {
    if (!productToDelete) return;

    const { id, title } = productToDelete;
    if (!id) return;

    setProductToDelete(null);
    setDeletingId(id);

    try {
      await deleteProd(id);
      setUser((prev) =>
        prev
          ? {
            ...prev,
            products: (prev.products ?? []).filter((p) => p.id !== id),
          }
          : prev,
      );
      setToast({ message: `"${title}" foi excluído.`, severity: "success" });
    } catch {
      setToast({
        message: `Não foi possível excluir "${title}". Tente de novo.`,
        severity: "error",
      });
    } finally {
      setDeletingId(null);
    }
  }

  const products = useMemo(() => user?.products ?? [], [user]);

  const stats = useMemo(() => {
    const units = products.reduce(
      (sum, p) => sum + toNumber(p.stock_quantity),
      0,
    );
    const value = products.reduce(
      (sum, p) => sum + toNumber(p.price) * toNumber(p.stock_quantity),
      0,
    );
    return { units, value };
  }, [products]);

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

                    <Typography
                      variant="h5"
                      fontWeight={800}
                      letterSpacing="-0.02em"
                      sx={{ wordBreak: "break-word" }}
                    >
                      {user.name}
                    </Typography>

                    <Chip
                      icon={<StorefrontIcon />}
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
                      startIcon={<AddShoppingCartIcon />}
                      onClick={() => setOpenCreateProduct(true)}
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
                      Cadastrar produto
                    </Button>
                  </Box>
                </>
              )}
            </Box>

            {/* Coluna direita: métricas + produtos */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Box
                sx={{
                  display: "grid",
                  gap: 2,
                  gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
                }}
              >
                <StatCard
                  icon={<InventoryIcon />}
                  label="Produtos"
                  value={String(products.length)}
                  loading={loading}
                />
                <StatCard
                  icon={<StorefrontIcon />}
                  label="Unidades em estoque"
                  value={stats.units.toLocaleString("pt-BR")}
                  loading={loading}
                />
                <StatCard
                  icon={<PaymentsIcon />}
                  label="Valor em estoque"
                  value={formatPrice(stats.value)}
                  loading={loading}
                />
              </Box>

              <Box>
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                  sx={{ mb: 1.5 }}
                >
                  Meus produtos
                </Typography>

                {loading ? (
                  <ProductGrid>
                    {[0, 1, 2, 3].map((i) => (
                      <Skeleton
                        key={i}
                        variant="rounded"
                        height={250}
                        sx={{ bgcolor: colors.surface, borderRadius: 3 }}
                      />
                    ))}
                  </ProductGrid>
                ) : products.length === 0 ? (
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
                    <InventoryIcon
                      sx={{ color: colors.textMuted, fontSize: 36, mb: 1 }}
                    />
                    <Typography fontWeight={600}>
                      Nenhum produto cadastrado
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: colors.textMuted, mt: 0.5 }}
                    >
                      Os produtos que você cadastrar vão aparecer aqui.
                    </Typography>
                  </Box>
                ) : (
                  <ProductGrid>
                    {products.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        deleting={deletingId === product.id}
                        onDelete={setProductToDelete}
                      />
                    ))}
                  </ProductGrid>
                )}
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      {/* Cadastro de produto */}
      <CreateProductDialog
        open={openCreateProduct}
        loading={creatingProduct}
        onClose={() => setOpenCreateProduct(false)}
        onSubmit={createProductBy}
      />

      {/* Confirmação de exclusão */}
      <Dialog
        open={Boolean(productToDelete)}
        onClose={() => setProductToDelete(null)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        slotProps={{ paper: { sx: dialogPaperSx } }}
      >
        <DialogTitle id="delete-dialog-title" sx={{ fontWeight: 700 }}>
          Excluir produto?
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            id="delete-dialog-description"
            sx={{ color: colors.textSecondary }}
          >
            {productToDelete
              ? `"${productToDelete.title}" será removido do seu estoque. Essa ação não pode ser desfeita.`
              : ""}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={() => setProductToDelete(null)}
            sx={{
              color: colors.textSecondary,
              textTransform: "none",
              fontWeight: 600,
              "&:focus-visible": focusRing,
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={confirmDelete}
            variant="contained"
            disableElevation
            autoFocus
            sx={{
              bgcolor: colors.danger,
              color: "#1a0b0b",
              textTransform: "none",
              fontWeight: 700,
              borderRadius: 2,
              "&:hover": { bgcolor: "#ff6464" },
              "&:focus-visible": focusRing,
            }}
          >
            Excluir produto
          </Button>
        </DialogActions>
      </Dialog>

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

/* ---------- Dialog de cadastro ---------- */
const dialogPaperSx = {
  bgcolor: colors.surface,
  color: colors.text,
  border: `1px solid ${colors.border}`,
  borderRadius: 3,
  backgroundImage: "none",
};

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    color: colors.text,
    bgcolor: colors.surfaceRaised,
    borderRadius: 2,
    "& fieldset": { borderColor: colors.border },
    "&:hover fieldset": { borderColor: colors.borderStrong },
    "&.Mui-focused fieldset": { borderColor: colors.accent },
  },
  "& .MuiInputLabel-root": { color: colors.textMuted },
  "& .MuiInputLabel-root.Mui-focused": { color: colors.accent },
  "& .MuiFormHelperText-root": { color: colors.textMuted },
};

const initialForm = {
  title: "",
  slug: "",
  description: "",
  price: "",
  stock_quantity: "",
  sku: "",
  category_id: "",
  weight: "",
  height: "",
  width: "",
  length: "",
};

type FormState = typeof initialForm;

function optionalNumber(value: string) {
  return value.trim() === "" ? undefined : Number(value);
}

function CreateProductDialog({
  open,
  loading,
  onClose,
  onSubmit,
}: {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProduct) => void;
}) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const preview = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // limpa o formulário quando o dialog fecha
  useEffect(() => {
    if (!open) {
      setForm(initialForm);
      setFile(null);
      setFileError(null);
    }
  }, [open]);

  const setField =
    (key: keyof FormState) => (event: ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: event.target.value }));

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    event.target.value = "";
    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      setFileError("Escolha um arquivo de imagem.");
      return;
    }
    if (selected.size > MAX_IMAGE_SIZE) {
      setFileError("A imagem deve ter no máximo 5 MB.");
      return;
    }

    setFileError(null);
    setFile(selected);
  }

  const canSubmit =
    form.title.trim() !== "" &&
    form.description.trim() !== "" &&
    form.price !== "" &&
    Number(form.price) >= 0 &&
    form.stock_quantity !== "" &&
    Number.isInteger(Number(form.stock_quantity)) &&
    Number(form.stock_quantity) >= 0 &&
    file !== null;

  function handleSubmit() {
    if (!canSubmit || !file) return;

    onSubmit({
      title: form.title.trim(),
      slug: form.slug.trim() || undefined,
      description: form.description.trim(),
      price: Number(form.price),
      stock_quantity: Number(form.stock_quantity),
      sku: form.sku.trim() || undefined,
      category_id: form.category_id.trim() || undefined,
      weight: optionalNumber(form.weight),
      height: optionalNumber(form.height),
      width: optionalNumber(form.width),
      length: optionalNumber(form.length),
      image: file,
    });
  }

  function handleClose() {
    if (!loading) onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="create-dialog-title"
      slotProps={{ paper: { sx: dialogPaperSx } }}
    >
      <DialogTitle id="create-dialog-title" sx={{ fontWeight: 700 }}>
        Cadastrar produto
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {/* Upload da imagem */}
          <Box>
            <Box
              role="button"
              tabIndex={0}
              aria-label="Escolher imagem do produto"
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  inputRef.current?.click();
                }
              }}
              sx={{
                cursor: "pointer",
                borderRadius: 3,
                overflow: "hidden",
                border: `1px dashed ${fileError ? colors.danger : colors.borderStrong
                  }`,
                bgcolor: colors.surfaceRaised,
                minHeight: 160,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                color: colors.textMuted,
                "&:hover": { borderColor: colors.accent },
                "&:focus-visible": focusRing,
              }}
            >
              {preview ? (
                <Box
                  component="img"
                  src={preview}
                  alt="Pré-visualização da imagem"
                  sx={{
                    width: "100%",
                    maxHeight: 220,
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              ) : (
                <>
                  <CloudUploadIcon />
                  <Typography variant="body2">
                    Clique para enviar a imagem
                  </Typography>
                  <Typography variant="caption">
                    JPG, PNG ou WebP, até 5 MB
                  </Typography>
                </>
              )}
            </Box>
            {fileError && (
              <Typography
                variant="caption"
                role="alert"
                sx={{ color: colors.danger, mt: 0.5, display: "block" }}
              >
                {fileError}
              </Typography>
            )}
            {preview && (
              <Button
                size="small"
                onClick={() => inputRef.current?.click()}
                sx={{
                  mt: 0.5,
                  color: colors.accent,
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Trocar imagem
              </Button>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleFile}
            />
          </Box>

          <TextField
            label="Título"
            value={form.title}
            onChange={setField("title")}
            required
            fullWidth
            sx={fieldSx}
          />

          <TextField
            label="Descrição"
            value={form.description}
            onChange={setField("description")}
            required
            fullWidth
            multiline
            minRows={3}
            sx={fieldSx}
          />

          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: "1fr 1fr" }}>
            <TextField
              label="Preço (R$)"
              type="number"
              value={form.price}
              onChange={setField("price")}
              required
              slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
              sx={fieldSx}
            />
            <TextField
              label="Estoque"
              type="number"
              value={form.stock_quantity}
              onChange={setField("stock_quantity")}
              required
              slotProps={{ htmlInput: { min: 0, step: 1 } }}
              sx={fieldSx}
            />
            <TextField
              label="SKU"
              value={form.sku}
              onChange={setField("sku")}
              sx={fieldSx}
            />
            <TextField
              label="Slug"
              value={form.slug}
              onChange={setField("slug")}
              sx={fieldSx}
            />
          </Box>

          <TextField
            label="ID da categoria"
            value={form.category_id}
            onChange={setField("category_id")}
            required
            fullWidth
            helperText="UUID da categoria"
            sx={fieldSx}
          />

          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" },
            }}
          >
            <TextField
              label="Peso"
              type="number"
              value={form.weight}
              onChange={setField("weight")}
              slotProps={{ htmlInput: { min: 0, step: "any" } }}
              sx={fieldSx}
            />
            <TextField
              label="Altura"
              type="number"
              value={form.height}
              onChange={setField("height")}
              slotProps={{ htmlInput: { min: 0, step: "any" } }}
              sx={fieldSx}
            />
            <TextField
              label="Largura"
              type="number"
              value={form.width}
              onChange={setField("width")}
              slotProps={{ htmlInput: { min: 0, step: "any" } }}
              sx={fieldSx}
            />
            <TextField
              label="Compr."
              type="number"
              value={form.length}
              onChange={setField("length")}
              slotProps={{ htmlInput: { min: 0, step: "any" } }}
              sx={fieldSx}
            />
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          sx={{
            color: colors.textSecondary,
            textTransform: "none",
            fontWeight: 600,
            "&:focus-visible": focusRing,
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit || loading}
          variant="contained"
          disableElevation
          startIcon={
            loading ? <CircularProgress size={16} color="inherit" /> : undefined
          }
          sx={{
            bgcolor: colors.accent,
            color: colors.onAccent,
            textTransform: "none",
            fontWeight: 700,
            borderRadius: 2,
            "&:hover": { bgcolor: colors.accentHover },
            "&.Mui-disabled": {
              bgcolor: colors.surfaceRaised,
              color: colors.textMuted,
            },
            "&:focus-visible": focusRing,
          }}
        >
          {loading ? "Cadastrando..." : "Cadastrar produto"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* ---------- Subcomponentes ---------- */
function ProductGrid({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        display: "grid",
        gap: 2,
        gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
      }}
    >
      {children}
    </Box>
  );
}

function ProductCard({
  product,
  deleting,
  onDelete,
}: {
  product: Product;
  deleting: boolean;
  onDelete: (product: Product) => void;
}) {
  const stock = getStockStatus(toNumber(product.stock_quantity));

  return (
    <Box
      sx={{
        bgcolor: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: 3,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        opacity: deleting ? 0.55 : 1,
        transition:
          "border-color 0.2s ease, transform 0.2s ease, opacity 0.2s ease",
        "&:hover": {
          borderColor: colors.borderStrong,
          transform: "translateY(-2px)",
        },
        [reducedMotion]: {
          transition: "none",
          "&:hover": { transform: "none" },
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          aspectRatio: "4 / 3",
          bgcolor: colors.surfaceRaised,
          overflow: "hidden",
        }}
      >
        {product.image ? (
          <Box
            component="img"
            src={product.image}
            alt={product.title}
            loading="lazy"
            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: colors.textMuted,
            }}
          >
            <InventoryIcon />
          </Box>
        )}

        <Tooltip title="Excluir produto">
          <span>
            <IconButton
              aria-label={`Excluir ${product.title}`}
              onClick={() => onDelete(product)}
              disabled={deleting}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                zIndex: 2,
                width: 32,
                height: 32,
                color: colors.text,
                bgcolor: "rgba(8,10,17,0.72)",
                backdropFilter: "blur(8px)",
                border: `1px solid ${colors.border}`,
                transition:
                  "background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease",
                "&:hover": {
                  color: colors.danger,
                  bgcolor: colors.dangerSoft,
                  borderColor: colors.danger,
                },
                "&.Mui-disabled": { color: colors.textMuted },
                "&:focus-visible": focusRing,
                [reducedMotion]: { transition: "none" },
              }}
            >
              {deleting ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <DeleteIcon fontSize="small" />
              )}
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      <Box sx={{ p: 1.75, display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography
          variant="body2"
          fontWeight={600}
          noWrap
          title={product.title}
        >
          {product.title}
        </Typography>

        <Typography
          fontWeight={800}
          fontSize={18}
          letterSpacing="-0.01em"
          sx={{ color: colors.text }}
        >
          {formatPrice(product.price)}
        </Typography>

        <Chip
          label={stock.label}
          size="small"
          sx={{
            alignSelf: "flex-start",
            height: 22,
            fontSize: 12,
            fontWeight: 600,
            bgcolor: stock.bg,
            color: stock.color,
          }}
        />
      </Box>
    </Box>
  );
}

function StatCard({
  icon,
  label,
  value,
  loading,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  loading: boolean;
}) {
  return (
    <Box
      sx={{
        bgcolor: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: 3,
        p: 2.25,
        display: "flex",
        flexDirection: "column",
        gap: 1.25,
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: colors.accentSoft,
          color: colors.accent,
        }}
        aria-hidden="true"
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="caption" sx={{ color: colors.textMuted }}>
          {label}
        </Typography>
        {loading ? (
          <Skeleton
            width="60%"
            height={32}
            sx={{ bgcolor: colors.surfaceRaised }}
          />
        ) : (
          <Typography
            fontWeight={800}
            fontSize={22}
            letterSpacing="-0.02em"
            noWrap
          >
            {value}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

function InfoRow({
  icon,
  label,
  value,
  mono = false,
  copyable = false,
}: {
  icon?: ReactNode;
  label: string;
  value: string;
  mono?: boolean;
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
          sx={{
            color: colors.textSecondary,
            fontFamily: mono ? "monospace" : "inherit",
            fontSize: mono ? 12 : 14,
            wordBreak: "break-all",
          }}
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
      <Skeleton
        width="60%"
        height={32}
        sx={{ bgcolor: colors.surfaceRaised }}
      />
      <Skeleton
        width="30%"
        height={24}
        sx={{ bgcolor: colors.surfaceRaised }}
      />
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