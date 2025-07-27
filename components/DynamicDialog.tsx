import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { FiX, FiAlertTriangle } from "react-icons/fi";

interface DynamicDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string; // Judul dialog
  message?: string; // Pesan dialog
  confirmButtonText?: string; // Teks tombol konfirmasi
  cancelButtonText?: string; // Teks tombol batal
  iconNotif?: React.ReactNode; // Ikon utama di header
  confirmButtonColor?: "primary" | "error" | "success" | "warning"; // Warna tombol konfirmasi
  iconButton?: React.ReactNode;
}

const DynamicDialog: React.FC<DynamicDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title = "Confirmation",
  message = "Are you sure you want to proceed?",
  confirmButtonText = "Confirm",
  cancelButtonText = "Cancel",
  iconNotif = "",
  iconButton = "",
  confirmButtonColor = "primary",
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        // Pastikan dialog hanya ditutup jika bukan karena "backdropClick"
        if (reason !== "backdropClick") {
          onClose();
        }
      }}
      disableEscapeKeyDown // Opsional: Menonaktifkan penutupan dengan tombol Escape
      PaperProps={{
        style: {
          borderRadius: "16px",
          maxWidth: "500px",
          width: "100%",
          boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.15)",
        },
      }}
    >
      <div className="relative p-6 w-full">
        {/* Header */}
        <DialogTitle className="p-0 text-center mb-4">
          <div className="flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mb-4 shadow-md">
              {iconNotif}
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          </div>
        </DialogTitle>

        {/* Content */}
        <DialogContent className="p-0 mt-3" sx={{ justifyContent: "center" }}>
          <div className="text-center items-center justify-center">
            <div className="bg-orange-100 rounded-lg p-4 mb-4 shadow-sm">
              <div className="flex items-center gap-2 text-gray-700 justify-center">
                <FiAlertTriangle className="w-7 h-7 animate-pulse text-orange-700" />
                <p className="font-medium text-base ml-3">{message}</p>
              </div>
            </div>
          </div>
        </DialogContent>

        {/* Actions */}
        <DialogActions className="p-0 mt-6 flex flex-col items-center gap-4">
          <div className="flex gap-4">
            <Button
              onClick={onClose}
              variant="outlined"
              color="inherit"
              sx={{
                borderRadius: 25,
                px: 3,
                py: 1,
              }}
              className="py-2 px-6 rounded-full text-gray-700 border-gray-300 hover:bg-gray-100 transition-all duration-300 ease-in-out flex items-center gap-2 shadow-sm"
            >
              <FiX className="w-7 h-7" /> {cancelButtonText}
            </Button>

            <Button
              onClick={handleConfirm}
              variant="contained"
              color={confirmButtonColor}
              sx={{
                borderRadius: 25,
                px: 3,
                py: 1,
              }}
              className="py-2 px-6 rounded-full hover:bg-opacity-90 transition-all duration-300 ease-in-out flex items-center gap-2 shadow-md"
            >
              {/* Perbaikan untuk error cloneElement */}
              {React.isValidElement(iconButton)
                ? React.cloneElement(iconButton as React.ReactElement<any>, {
                    className: "w-7 h-7",
                  })
                : null}
              {confirmButtonText}
            </Button>
          </div>
        </DialogActions>
      </div>
    </Dialog>
  );
};

export default DynamicDialog;