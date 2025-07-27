import { useState } from "react";
import {
  Button,
  LinearProgress,
  Typography,
  Box,
  TextField,
  Paper,
  Divider,
  Alert,
  Snackbar,
  InputAdornment,
} from "@mui/material";
import Head from "next/head";
import { Android, WhatsApp, Send } from "@mui/icons-material";

export default function BuildApk() {
  const [loading, setLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [message, setMessage] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [buildCompleted, setBuildCompleted] = useState<boolean>(false);
  const [whatsappNumber, setWhatsappNumber] = useState<string>("");
  const [apkDownloadUrl, setApkDownloadUrl] = useState<string>("");
  const [isValidNumber, setIsValidNumber] = useState<boolean>(true);

  // State untuk konfigurasi server
  const [serverConfig, setServerConfig] = useState({
    serverIp: "192.168.1.1",
    serverPort: "5000",
    isProduction: false,
    phoneNumber: "",
  });

  // Handler untuk perubahan konfigurasi server
  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    setServerConfig((prev) => ({
      ...prev,
      [name]: name === "isProduction" ? checked : value,
    }));
  };

  // Handler untuk perubahan nomor WhatsApp
  const handleWhatsappNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setWhatsappNumber(value);
    setIsValidNumber(/^\d{9,15}$/.test(value) || value === "");
  };

  // Handler untuk memulai proses build APK
  const handleBuild = async () => {
    setLoading(true);
    setProgress(10); // Mulai progress bar dari 10%
    setBuildCompleted(false);
    setMessage("");
    setSuccess(false);

    try {
      let fakeProgress = 10;

      // Simulasi progress bar
      const interval = setInterval(() => {
        fakeProgress += 15;
        if (fakeProgress >= 90) fakeProgress = 90; // Tetap di 90% sampai API selesai
        setProgress(fakeProgress);
      }, 1000);

      // Kirim request ke API untuk build APK
      const response = await fetch("/api/build-apk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(serverConfig),
      });

      const data = await response.json();

      // Hentikan simulasi progress bar
      clearInterval(interval);

      // Set progress bar ke 100% setelah selesai
      setProgress(100);

      setTimeout(() => {
        setMessage(data.message || "Build APK berhasil!");
        setSuccess(data.success !== undefined ? data.success : true);
        setBuildCompleted(true);
        setApkDownloadUrl(data.outputPath || "/api/download-apk");
        setOpenSnackbar(true);
        setLoading(false);
      }, 500); // Delay singkat agar progress bar terlihat mencapai 100%
    } catch (error) {
      console.error(error);
      setMessage("Terjadi kesalahan saat build APK.");
      setSuccess(false);
      setLoading(false);
    }
  };

  // Handler untuk mengirim tautan APK via WhatsApp
  const handleSendToWhatsapp = () => {
    let formattedNumber = whatsappNumber;

    // Format nomor WhatsApp (pastikan dimulai dengan kode negara)
    if (!formattedNumber.startsWith("+")) {
      if (formattedNumber.startsWith("0")) {
        formattedNumber = "62" + formattedNumber.substring(1);
      } else if (!formattedNumber.startsWith("62")) {
        formattedNumber = "62" + formattedNumber;
      }
    }

    // Buat pesan WhatsApp
    const downloadLink = apkDownloadUrl || "/api/download-apk";
    const message = encodeURIComponent(
      `COSA APP APK Download Link: ${downloadLink}\nServer Config: ${
        serverConfig.isProduction
          ? "https://api.cosaapp.com"
          : `http://${serverConfig.serverIp}:${serverConfig.serverPort}`
      }`
    );

    // Buka tautan WhatsApp
    const whatsappUrl = `https://wa.me/${formattedNumber.replace(/\+/g, "")}?text=${message}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <>
      <Head>
        <title>Build APK</title>
      </Head>
      <div className="mb-6">
        {/* Header */}
        <div className="flex justify-start items-center gap-2 mb-4">
          <Android className="h-7 w-7 text-black" />
          <h2 className="text-xl font-semibold text-black">Build APK</h2>
        </div>

        {/* Form Konfigurasi Server */}
        <Paper elevation={2} className="p-4 mb-4">
          <Typography variant="h6" className="mb-4">
            Konfigurasi Server
          </Typography>
          <div className="flex justify-between items-center space-x-4 mt-3">
            <TextField
              fullWidth
              label="IP Address Server"
              name="serverIp"
              value={serverConfig.serverIp}
              onChange={handleConfigChange}
              variant="outlined"
              size="small"
              disabled={loading}
              helperText="Contoh: 192.168.1.100"
            />
            <TextField
              fullWidth
              label="Port Server"
              name="serverPort"
              value={serverConfig.serverPort}
              onChange={handleConfigChange}
              variant="outlined"
              size="small"
              disabled={loading}
              helperText="Contoh: 5000"
            />
          </div>
        </Paper>

        {/* Form Kirim APK via WhatsApp */}
        {buildCompleted && success && (
          <Paper elevation={2} className="p-4 mb-4">
            <Typography variant="h6" className="mb-4">
              Kirim APK via WhatsApp
            </Typography>
            <div className="flex items-center space-x-2">
              <TextField
                fullWidth
                label="Nomor WhatsApp"
                placeholder="Contoh: 082285012386"
                value={whatsappNumber}
                onChange={handleWhatsappNumberChange}
                variant="outlined"
                size="small"
                error={!isValidNumber && whatsappNumber !== ""}
                helperText={
                  !isValidNumber && whatsappNumber !== ""
                    ? "Masukkan nomor yang valid (min. 11 digit)"
                    : ""
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <WhatsApp color="success" />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="contained"
                color="success"
                startIcon={<Send />}
                onClick={handleSendToWhatsapp}
                disabled={!whatsappNumber || !isValidNumber}
              >
                Kirim
              </Button>
            </div>
          </Paper>
        )}

        {/* Progress Bar */}
        <Divider className="mb-5" />
        <div className="flex justify-between items-center space-x-4 mb-4">
          {progress > 0 && !buildCompleted && (
            <Box sx={{ width: "100%", my: 2 }}>
              <LinearProgress
                variant="determinate"
                value={progress}
                color={progress === 100 ? "success" : "primary"}
              />
              <Typography variant="body2" align="center">
                {progress}%
              </Typography>
            </Box>
          )}
        </div>

        {/* Tombol Build APK */}
        <div className="flex justify-between items-center">
          <Button
            variant="contained"
            color="primary"
            onClick={handleBuild}
            disabled={loading}
            size="large"
            startIcon={<Android />}
          >
            {loading ? "Building APK..." : "Build APK"}
          </Button>
          {message && buildCompleted && (
            <Alert severity={success ? "success" : "error"} className="ml-4">
              {message}
            </Alert>
          )}
        </div>
      </div>

      {/* Snackbar Notifikasi */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="success" sx={{ width: "100%" }}>
          Build sukses! APK telah dibuat dengan konfigurasi:
          <br />
          Server:{" "}
          {serverConfig.isProduction
            ? "https://api.cosaapp.com"
            : `http://${serverConfig.serverIp}:${serverConfig.serverPort}`}
        </Alert>
      </Snackbar>
    </>
  );
}