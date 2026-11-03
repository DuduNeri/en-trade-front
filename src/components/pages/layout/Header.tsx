import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import { Badge, Box, IconButton, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';

const NAV_LINKS = ["Início", "Vitrine", "Categorias", "Ofertas"];

export function Header() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/profile");
  };

  return (
    <Box
      component="header"
      sx={{
        width: "100%",
        height: "76px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 3,
        px: 3,
        boxSizing: "border-box",
        position: "relative",
        background:
          "linear-gradient(180deg, rgba(16,20,38,0.72) 0%, rgba(8,10,20,0.82) 100%)",
        backdropFilter: "blur(14px) saturate(140%)",

        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "fixed",
          top: 0,
          left: "-20%",
          width: "40%",
          height: "1px",
          background:
            "linear-gradient(90deg, transparent, #00fff2, transparent)",
          animation: "scan 6s linear infinite",
        },
        "@keyframes scan": {
          "0%": { left: "-40%" },
          "100%": { left: "100%" },
        },
      }}
    >
      {/* LOGO */}
      <Typography
        component="a"
        href="#"
        sx={{
          fontWeight: 600,
          fontSize: "1.25rem",
          letterSpacing: "-0.01em",
          color: "#f2f5ff",
          textDecoration: "none",
          whiteSpace: "nowrap",
          display: "flex",
          alignItems: "baseline",
          gap: "2px",
        }}
      >
        en
        <Box
          component="span"
          sx={{
            color: "#00fff2",
            fontSize: "0.95em",
          }}
        >
          /trade
        </Box>
      </Typography>

      {/* NAV */}
      <Box
        component="nav"
        sx={{
          display: { xs: "none", md: "flex" },
          alignItems: "center",
          gap: 4,
        }}
      >
        {NAV_LINKS.map((label) => (
          <Typography
            key={label}
            component="a"
            href="#"
            sx={{
              fontSize: "0.9rem",
              fontWeight: 500,
              color: "#8b93b8",
              textDecoration: "none",
              position: "relative",
              transition: "color 0.2s ease",
              "&:hover": { color: "#f2f5ff" },
              "&:hover::after": { width: "100%" },
              "&::after": {
                content: '""',
                position: "absolute",
                left: 0,
                bottom: -6,
                width: 0,
                height: "1.5px",
                background: "#00fff2",
                boxShadow: "0 0 6px rgba(0,255,242,0.8)",
                transition: "width 0.25s ease",
              },
            }}
          >
            {label}
          </Typography>
        ))}
      </Box>

      {/* AÇÕES: busca, conta, carrinho */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <IconButton
          sx={{
            color: "#8b93b8",
            transition: "color 0.2s ease",
            "&:hover": { color: "#00fff2" },
          }}
          onClick={() => handleClick()}
        >
          <PersonOutlineRoundedIcon fontSize="small" />
        </IconButton>

        <IconButton
          sx={{
            color: "#8b93b8",
            transition: "color 0.2s ease",
            "&:hover": { color: "#ff2ec4" },
          }}
        >
          <Badge
            badgeContent={3}
            sx={{
              "& .MuiBadge-badge": {
                bgcolor: "#ff2ec4",
                color: "#0a0d18",
                fontWeight: 700,
                fontSize: "0.65rem",
                minWidth: 16,
                height: 16,
              },
            }}
          >
            <ShoppingBagOutlinedIcon fontSize="small" />
          </Badge>
        </IconButton>
        <IconButton
          sx={{
            color: "#8b93b8",
            transition: "color 0.2s ease",
            "&:hover": { color: "#ff2ec4" },
          }}
        >
          <Badge
            badgeContent={3}
            sx={{
              "& .MuiBadge-badge": {
                bgcolor: "#ff2ec4",
                color: "#0a0d18",
                fontWeight: 700,
                fontSize: "0.65rem",
                minWidth: 16,
                height: 16,
              },
            }}
          >
            <SettingsSuggestIcon fontSize="small" />
          </Badge>
        </IconButton>
        
      </Box>
    </Box>
  );
}
