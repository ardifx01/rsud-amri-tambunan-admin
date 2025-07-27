import { getRequest, putRequest } from "@/utils/apiClient";
import { showErrorToast, showUpdateToast } from "@/utils/notif";
import axios from "axios";
import Head from "next/head";
import { useCallback, useEffect, useState } from "react";
import { Box, Button, Grid, Paper, TextField } from "@mui/material";
import { Business } from "@mui/icons-material";

interface Setting {
  id: any;
  name: string;
  address: string;
  email: any;
  phone: any;
  maps: any;
}

interface FormErrors {
  name: boolean;
  address: boolean;
  email: boolean;
  phone: boolean;
  maps: boolean;
}

const GeneralPage = () => {
  const [setting, setSetting] = useState<Setting>({
    id: null,
    name: "",
    address: "",
    email: "",
    phone: "",
    maps: "",
  });

  const [errors, setErrors] = useState<FormErrors>({
    name: false,
    email: false,
    address: false,
    phone: false,
    maps: false,
  });

  const fetchSetting = useCallback(async () => {
    try {
      const response = await getRequest("api/setting");
      if (response.status === "success" && response.data) {
        setSetting(response.data);
      } else {
        console.error("Invalid response format:", response);
        setSetting({
          id: null,
          name: "",
          address: "",
          email: "",
          phone: "",
          maps: "",
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      setSetting({
        id: null,
        name: "",
        address: "",
        email: "",
        phone: "",
        maps: "",
      });
    }
  }, []);

  useEffect(() => {
    fetchSetting();
  }, [fetchSetting]);

  // Handler untuk mengubah nilai input field
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSetting((prevSetting) => ({
      ...prevSetting,
      [name]: value,
    }));
  };

  const handleUpdateSetting = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    const newErrors: FormErrors = {
      name: !setting.name,
      email: !setting.email || !/\S+@\S+\.\S+/.test(setting.email),
      address: !setting.address,
      phone: !setting.phone,
      maps: !setting.maps,
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) {
      return;
    }
    try {
      const settingToUpdate = {
        id: setting.id,
        name: setting.name,
        address: setting.address,
        phone: setting.phone,
        email: setting.email,
        maps: setting.maps,
      };
      
      // Perbaikan endpoint API - sebelumnya menggunakan endpoint patients yang tidak sesuai
      const response = await putRequest(
        `/api/setting/${setting.id}`,
        settingToUpdate
      );

      if (response.status === "success") {
        showUpdateToast("Setting updated successfully");
        fetchSetting();
      } else {
        showErrorToast(response.message || "Failed to update setting");
      }
    } catch (error) {
      console.error("Error updating setting:", error);
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || "Error updating setting";
        showErrorToast(errorMessage);
      } else {
        showErrorToast("An unexpected error occurred while updating setting");
      }
    }
  };

  return (
    <>
      <Head>
        <title>General</title>
        <link rel="icon" href="/assets/images/icon/fanscosa-icon.png" />
      </Head>
      <div className="flex justify-start items-center gap-2 mb-4">
        <Business className="h-7 w-7 text-black" />
        <h2 className="text-xl font-semibold text-black">General</h2>
      </div>

      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleUpdateSetting} noValidate>
          <Grid container spacing={3}>
            {/* First row - Name and Address */}
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                id="name"
                label="Full Name"
                name="name"
                value={setting.name}
                onChange={handleInputChange}
                error={errors.name}
                helperText={errors.name ? "Name is required" : ""}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                id="address"
                label="Address"
                name="address"
                type="text"
                value={setting.address}
                onChange={handleInputChange}
                error={errors.address}
                helperText={errors.address ? "Valid address is required" : ""}
                variant="outlined"
              />
            </Grid>

            {/* Second row - Email and Phone */}
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                type="email"
                value={setting.email}
                onChange={handleInputChange}
                error={errors.email}
                helperText={errors.email ? "Valid email is required" : ""}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                id="phone"
                label="Phone Number"
                name="phone"
                type="tel"
                value={setting.phone}
                onChange={handleInputChange}
                error={errors.phone}
                helperText={errors.phone ? "Valid phone is required" : ""}
                variant="outlined"
              />
            </Grid>
            
            {/* Maps field */}
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="maps"
                label="Maps Location"
                name="maps"
                value={setting.maps}
                onChange={handleInputChange}
                error={errors.maps}
                helperText={errors.maps ? "Valid maps is required" : ""}
                variant="outlined"
              />
            </Grid>

            {/* Buttons */}
            <Grid
              item
              xs={12}
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
                mt: 2,
              }}
            >
              <Button type="submit" variant="contained" color="primary">
                Update Setting
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </>
  );
};

export default GeneralPage;