import { useCallback, useEffect, useState } from "react";
import Head from "next/head";
import { ManageAccountsOutlined } from "@mui/icons-material";
import {
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Grid,
  FormHelperText,
  SelectChangeEvent,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { getRequest, postRequest } from "@/utils/apiClient";
import { showAddToast, showErrorToast } from "@/utils/notif";
import { useRouter } from "next/navigation";

// Define types for our form data and errors
interface FormData {
  name: string;
  email: string;
  password: string;
  role_id: string;
}

interface FormErrors {
  name: boolean;
  email: boolean;
  password: boolean;
  role_id: boolean;
}

const CreateUserPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    role_id: "",
  });

  const [errors, setErrors] = useState<FormErrors>({
    name: false,
    email: false,
    password: false,
    role_id: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };
  const [roles, setRoles] = useState([]);
  const fetchRoles = useCallback(async () => {
    try {
      const response = await getRequest("api/roles");
      if (response.status === "success" && response.data) {
        setRoles(response.data); // Simpan data roles ke state
      } else {
        console.error("Invalid response format:", response);
        setRoles([]);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      setRoles([]);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // Handle text field changes
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error when user types
    if (errors[name as keyof FormErrors]) {
      setErrors({ ...errors, [name]: false });
    }
  };

  // Handle select field changes
  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error when user selects
    if (errors[name as keyof FormErrors]) {
      setErrors({ ...errors, [name]: false });
    }
  };

  const handleCreateUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Simple validation
    const newErrors: FormErrors = {
      name: !formData.name,
      email: !formData.email || !/\S+@\S+\.\S+/.test(formData.email),
      password: !formData.password || formData.password.length < 6,
      role_id: !formData.role_id,
    };

    setErrors(newErrors);

    // Jika ada error, hentikan proses
    if (Object.values(newErrors).some(Boolean)) {
      return;
    }

    try {
      const response = await postRequest("/auth/register", formData);
      if (response.status === "success") {
        showAddToast("Add Users Successfull!");
        // Reset form setelah sukses
        setFormData({ name: "", email: "", password: "", role_id: "" });
      } else {
        console.error("Gagal membuat user:", response);
        showErrorToast(
          response.message || "An error occurred while creating the user."
        );
      }
    } catch (error: any) {
      console.error("Error saat mengirim data:", error);
      showErrorToast(
        error.response?.data?.message ||
          "TAn error occurred. Please try again later."
      );
    }
  };

  const handleCancel = () => {
    router.push(`/dashboard?menu=account_setting&search=`);
  };

  return (
    <>
      <Head>
        <title>Add New User</title>
        <link rel="icon" href="/assets/images/icon/fanscosa-icon.png" />
      </Head>
      <div className="flex justify-start items-center gap-2 mb-4">
        <ManageAccountsOutlined className="h-7 w-7 text-black" />
        <h2 className="text-xl font-semibold text-black">Add New User</h2>
      </div>
      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleCreateUser} noValidate>
          <Grid container spacing={3}>
            {/* First row - Name and Email */}
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                id="name"
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleTextChange}
                error={errors.name}
                helperText={errors.name ? "Name is required" : ""}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleTextChange}
                error={errors.email}
                helperText={errors.email ? "Valid email is required" : ""}
                variant="outlined"
              />
            </Grid>

            {/* Second row - Password and Role */}
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                id="password"
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleTextChange}
                error={errors.password}
                helperText={
                  errors.password
                    ? "Password must be at least 8 characters"
                    : ""
                }
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={togglePasswordVisibility} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl required fullWidth error={errors.role_id}>
                <InputLabel id="role-select-label">User Role</InputLabel>
                <Select
                  labelId="role-select-label"
                  id="role_id"
                  name="role_id"
                  value={formData.role_id}
                  label="User Role"
                  onChange={handleSelectChange}
                >
                  {roles.map((role: any) => (
                    <MenuItem key={role.id} value={role.id.toString()}>
                      {role.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.role_id && (
                  <FormHelperText>Please select a role</FormHelperText>
                )}
              </FormControl>
            </Grid>

            {/* Buttons remain at full width */}
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
              <Button
                onClick={handleCancel}
                variant="outlined"
                color="secondary"
              >
                Cancel
              </Button>
              <Button type="submit" variant="contained" color="primary">
                Create User
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </>
  );
};

export default CreateUserPage;
