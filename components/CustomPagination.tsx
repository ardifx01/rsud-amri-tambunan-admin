import React from "react";
import { Box, Typography } from "@mui/material";
import { TablePagination } from "@mui/material";

interface CustomPaginationProps {
  count: number; // Total jumlah data
  page: number; // Halaman saat ini (0-based index)
  rowsPerPage: number; // Jumlah baris per halaman
  onPageChange: (newPage: number) => void; // Handler untuk mengubah halaman
  onRowsPerPageChange: (newRowsPerPage: number) => void; // Handler untuk mengubah jumlah baris per halaman
}

const CustomPagination: React.FC<CustomPaginationProps> = ({
  count,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between", // Menyusun elemen di kiri dan kanan
        alignItems: "center", // Memastikan elemen vertikal rata tengah
        padding: "16px", // Padding untuk memberikan ruang
        borderTop: "1px solid #ddd", // Garis pemisah antara tabel dan pagination
        backgroundColor: "#fafafa", // Latar belakang abu-abu muda
      }}
    >
      {/* Informasi Jumlah Data */}
      <Typography
        variant="body2"
        sx={{
          color: "#555", // Warna teks abu-abu gelap
          fontWeight: "bold", // Font tebal
        }}
      >
        Showing {page * rowsPerPage + 1} -{" "}
        {Math.min((page + 1) * rowsPerPage, count)} of {count} results
      </Typography>

      {/* Pagination */}
      <TablePagination
        count={count}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(_e, newPage) => onPageChange(newPage)}
        onRowsPerPageChange={(e) => {
          const newRowsPerPage = Number(e.target.value);
          onRowsPerPageChange(newRowsPerPage);
        }}
        rowsPerPageOptions={[5, 10, 25, 50]} // Opsi jumlah baris per halaman
        labelRowsPerPage={
          <Typography
            variant="body2"
            sx={{
              color: "#555", // Warna teks abu-abu gelap
              fontWeight: "bold", // Font tebal
            }}
          >
            Rows per page:
          </Typography>
        }
        sx={{
          "& .MuiTablePagination-toolbar": {
            minHeight: "48px", // Mengatur tinggi toolbar
            padding: "0 16px", // Padding di dalam toolbar
          },
          "& .MuiTablePagination-selectLabel": {
            color: "#555", // Warna teks abu-abu gelap
            fontWeight: "bold", // Font tebal
          },
          "& .MuiTablePagination-select": {
            color: "#333", // Warna teks hitam pekat
            fontWeight: "bold", // Font tebal
          },
          "& .MuiTablePagination-actions button": {
            color: "#0055ff", // Warna ikon pagination biru
            "&:hover": {
              backgroundColor: "rgba(0, 136, 255, 0.1)", // Efek hover lembut
            },
          },
        }}
      />
    </Box>
  );
};

export default CustomPagination;