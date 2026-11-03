import { Box } from "@mui/material";
import { Header } from "./layout/Header";
import { Hero } from "./layout/Hero";

export function FeedPage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        p: 2,
        boxSizing: "border-box",
        bgcolor: "#070911",
      }}
    >
      <Header />
      <Hero/>
    </Box>
  );
}