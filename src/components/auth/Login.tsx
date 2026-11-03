import {
  ArrowForward,
  EmailOutlined,
  LockOutlined,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Checkbox,
  Divider,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../api/auth/auth";
import github from "../../assets/github (1).png";
import google from "../../assets/pesquisa.png";

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function loggin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await login({
        email,
        password,
      });

      console.log("Token:", response.data.token);
      console.log("Usuário:", response.data.user);

      navigate("/feed");
    } catch (error) {
      console.log("Erro ao logar:", error);
      alert("E-mail ou senha incorretos!");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at 10% 10%, rgba(0,255,255,.18), transparent 30%), radial-gradient(circle at 90% 90%, rgba(123,104,238,.22), transparent 30%), #07091d",
        p: 2,
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 960,
          height: "min(650px, 92vh)",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          border: "1px solid rgba(0,255,255,.25)",
          borderRadius: 5,
          overflow: "hidden",
          background: "rgba(10, 14, 42, .75)",
          backdropFilter: "blur(20px)",
          boxShadow:
            "0 0 60px rgba(0,255,255,.06), 0 0 60px rgba(123,104,238,.06)",
        }}
      >
        {/* LADO ESQUERDO */}
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            flexDirection: "column",
            justifyContent: "center",
            p: 6,
            background:
              "linear-gradient(145deg, rgba(0,255,255,.08), rgba(123,104,238,.12))",
          }}
        >
          <Typography
            variant="h3"
            sx={{ fontWeight: 800, color: "#fff", mb: 2 }}
          >
            En
            <Box
              component="span"
              sx={{
                background: "linear-gradient(90deg, #00FFFF, #7B68EE)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Trade
            </Box>
          </Typography>

          <Typography
            variant="h5"
            sx={{
              color: "#fff",
              fontWeight: 700,
              maxWidth: 380,
              mb: 1.5,
              lineHeight: 1.3,
            }}
          >
            Compre, venda e{" "}
            <Box component="span" sx={{ color: "#00FFFF" }}>
              conecte pessoas.
            </Box>
          </Typography>

          <Typography
            sx={{
              color: "rgba(255,255,255,.6)",
              fontSize: 15,
              lineHeight: 1.6,
              maxWidth: 340,
            }}
          >
            O marketplace que transforma o jeito de negociar.
          </Typography>

          <Box
            sx={{
              width: 130,
              height: 130,
              mt: 5,
              transform: "rotate(15deg)",
              border: "2px solid #00FFFF",
              borderRadius: 4,
              boxShadow:
                "0 0 25px rgba(0,255,255,.3), inset 0 0 25px rgba(0,255,255,.08)",
              position: "relative",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                width: 108,
                height: 108,
                top: 32,
                left: 44,
                border: "2px solid #7B68EE",
                borderRadius: 4,
                background: "rgba(123,104,238,.12)",
                boxShadow: "0 0 25px rgba(123,104,238,.25)",
              }}
            />
          </Box>
        </Box>

        {/* LOGIN */}
        <Box
          component="form"
          onSubmit={loggin}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: { xs: 3, md: 5 },
            overflowY: "auto",
          }}
        >
          <Box sx={{ width: "100%", maxWidth: 400 }}>
            <Typography
              variant="h4"
              sx={{ color: "#fff", fontWeight: 800, mb: 0.5 }}
            >
              Bem-vindo
              <Box component="span" sx={{ color: "#00FFFF" }}>
                (a)!
              </Box>
            </Typography>
            <Typography
              sx={{ color: "rgba(255,255,255,.55)", mb: 3, fontSize: 14 }}
            >
              Faça login para continuar
            </Typography>
            {/* EMAIL */}
            <Typography
              sx={{ color: "#fff", fontWeight: 600, mb: 0.75, fontSize: 14 }}
            >
              E-mail
            </Typography>
            <TextField
              fullWidth
              size="small"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              variant="outlined"
              required
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  color: "#fff",
                  borderRadius: 2.5,
                  "& fieldset": { borderColor: "rgba(123,104,238,.5)" },
                  "&:hover fieldset": { borderColor: "#00FFFF" },
                  "&.Mui-focused fieldset": { borderColor: "#00FFFF" },
                },
                "& input::placeholder": { color: "rgba(255,255,255,.4)" },
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlined sx={{ color: "#00FFFF", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
            {/* SENHA */}
            <Typography
              sx={{ color: "#fff", fontWeight: 600, mb: 0.75, fontSize: 14 }}
            >
              Senha
            </Typography>
            <TextField
              fullWidth
              size="small"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              variant="outlined"
              required
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "#fff",
                  borderRadius: 2.5,
                  "& fieldset": { borderColor: "rgba(123,104,238,.5)" },
                  "&:hover fieldset": { borderColor: "#00FFFF" },
                  "&.Mui-focused fieldset": { borderColor: "#00FFFF" },
                },
                "& input::placeholder": { color: "rgba(255,255,255,.4)" },
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined sx={{ color: "#00FFFF", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setShowPassword(!showPassword)}
                        sx={{ color: "#7B68EE" }}
                      >
                        {showPassword ? (
                          <VisibilityOff fontSize="small" />
                        ) : (
                          <Visibility fontSize="small" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            {/* OPÇÕES */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: 1,
                mb: 2.5,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Checkbox
                  size="small"
                  sx={{
                    color: "#7B68EE",
                    p: 0.5,
                    mr: 0.5,
                    "&.Mui-checked": { color: "#00FFFF" },
                  }}
                />
                <Typography
                  sx={{ color: "rgba(255,255,255,.65)", fontSize: 13 }}
                >
                  Lembrar de mim
                </Typography>
              </Box>

              <Typography
                sx={{ color: "#00FFFF", fontSize: 13, cursor: "pointer" }}
              >
                Esqueceu a senha?
              </Typography>
            </Box>
            {/* BOTÃO */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              endIcon={<ArrowForward />}
              sx={{
                height: 48,
                borderRadius: 2.5,
                fontSize: 15,
                fontWeight: 700,
                color: "#050716",
                background: "linear-gradient(90deg, #00FFFF, #7B68EE)",
                boxShadow: "0 0 20px rgba(0,255,255,.18)",
                "&:hover": {
                  background: "linear-gradient(90deg, #00FFFF, #7B68EE)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 0 28px rgba(0,255,255,.3)",
                },
                "&.Mui-disabled": {
                  background: "linear-gradient(90deg, #00FFFF, #7B68EE)",
                  opacity: 0.6,
                  color: "#050716",
                },
              }}
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
            {/* DIVISOR */}
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 2, my: 2.5 }}
            >
              <Divider sx={{ flex: 1, borderColor: "rgba(255,255,255,.15)" }} />
              <Typography sx={{ color: "rgba(255,255,255,.45)", fontSize: 13 }}>
                ou
              </Typography>
              <Divider sx={{ flex: 1, borderColor: "rgba(255,255,255,.15)" }} />
            </Box>
            {/* GOOGLE */}
            <Button
              fullWidth
              variant="outlined"
              sx={{
                height: 46,
                mb: 1.5,
                borderRadius: 2.5,
                color: "#fff",
                borderColor: "rgba(255,255,255,.2)",
                textTransform: "none",
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1.5,
                "&:hover": {
                  borderColor: "#00FFFF",
                  background: "rgba(0,255,255,.05)",
                },
              }}
            >
              Continuar com o Google
              <img
                src={google}
                alt="Google"
                style={{
                  width: 20,
                  height: 20,
                  objectFit: "contain",
                }}
              />
            </Button>
            {/* GITHUB */}
            <Button
              fullWidth
              variant="outlined"
              sx={{
                height: 46,
                mb: 1.5,
                borderRadius: 2.5,
                color: "#fff",
                borderColor: "rgba(255,255,255,.2)",
                textTransform: "none",
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1.5,
                "&:hover": {
                  borderColor: "#7B68EE",
                  background: "rgba(0,255,255,.05)",
                },
              }}
            >
              Continuar com o Github
              <img
                src={github}
                alt="Google"
                style={{
                  width: 20,
                  height: 20,
                  objectFit: "contain",
                }}
              />
            </Button>
            {/* CADASTRO */}
            <Typography
              onClick={() => navigate("/register")}
              sx={{
                textAlign: "center",
                color: "rgba(255,255,255,.5)",
                mt: 3,
                fontSize: 13,
              }}
            >
              Não tem uma conta?{" "}
              <Box
                component="span"
                sx={{ color: "#00FFFF", cursor: "pointer", fontWeight: 600 }}
              >
                Cadastre-se
              </Box>
            </Typography>

            <Typography
              onClick={() => navigate("/register-seller")}
              sx={{
                textAlign: "center",
                color: "rgba(255,255,255,.5)",
                mt: 3,
                fontSize: 13,
              }}
            >
              Crie a sua conta comercial!{" "}
              <Box
                component="span"
                sx={{ color: "#00FFFF", cursor: "pointer", fontWeight: 600 }}
              >
                Criar conta
              </Box>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default LoginPage;
