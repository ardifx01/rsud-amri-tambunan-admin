import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

interface LoadingComponentProps {
  text?: string; // Teks loading (opsional)
  spinnerColor?: string; // Warna lingkaran loading (opsional)
  textColor?: string; // Warna teks (opsional)
}

const LoadingComponent: React.FC<LoadingComponentProps> = ({
  text = "Loading data...", // Default teks
  spinnerColor = "#0055ff", // Default warna lingkaran
  textColor = "#555", // Default warna teks
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "50vh", // Mengatur tinggi agar loading berada di tengah halaman
        gap: "16px", // Jarak antara elemen
      }}
    >
      {/* Animasi Loading */}
      <CircularProgress
        size={64} // Ukuran lingkaran loading
        thickness={4} // Ketebalan lingkaran
        sx={{
          color: spinnerColor, // Warna lingkaran
        }}
      />

      {/* Teks Loading */}
      <Typography
        variant="h6"
        sx={{
          fontSize: "1.2rem", // Ukuran font besar
          fontWeight: "bold", // Font tebal
          color: textColor, // Warna teks
          textAlign: "center", // Teks berada di tengah
        }}
      >
        {text}
      </Typography>
    </Box>
  );
};

export default LoadingComponent;