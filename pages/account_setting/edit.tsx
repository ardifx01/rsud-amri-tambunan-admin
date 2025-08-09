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
  Skeleton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { getRequest, putRequest } from "@/utils/apiClient";
import { showAddToast, showErrorToast } from "@/utils/notif";
import { useRouter, useSearchParams } from "next/navigation";

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

// interface User {
//   id: string;
//   name: string;
//   email: string;
//   role_id: string;
// }

const EditUserPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams ? searchParams.get("id") : null;

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
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userNotFound, setUserNotFound] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  // Fetch roles data
  const fetchRoles = useCallback(async () => {
    try {
      const response = await getRequest("api/roles");
      if (response.status === "success" && response.data) {
        setRoles(response.data);
      } else {
        console.error("Invalid response format:", response);
        setRoles([]);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      setRoles([]);
    }
  }, []);

  // Fetch user data for editing
  const fetchUserData = useCallback(async () => {
    if (!userId) {
      setUserNotFound(true);
      setLoading(false);
      return;
    }

    try {
      const response = await getRequest(`/api/users/${userId}`);
      if (response.status === "success" && response.data) {
        const userData = response.data.user;
        let userRole = "";
        if (
          Array.isArray(response.data.roles) &&
          response.data.roles.length > 0
        ) {
          userRole = String(response.data.roles[0].id);
        }

        setFormData({
          name: userData.name,
          email: userData.email,
          password: "", // Password field kosong untuk edit
          role_id: userRole,
        });
        setUserNotFound(false);
      } else {
        console.error("User not found:", response);
        setUserNotFound(true);
        showErrorToast("User not found");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUserNotFound(true);
      showErrorToast("Error loading user data");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchRoles();
    fetchUserData();
  }, [fetchRoles, fetchUserData]);

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

  const handleUpdateUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Validation - password is optional for edit
    const newErrors: FormErrors = {
      name: !formData.name,
      email: !formData.email || !/\S+@\S+\.\S+/.test(formData.email),
      password: formData.password !== "" && formData.password.length < 6, // Password optional, but if filled must be >= 6
      role_id: !formData.role_id,
    };

    setErrors(newErrors);

    // Jika ada error, hentikan proses
    if (Object.values(newErrors).some(Boolean)) {
      return;
    }

    try {
      // Prepare data - exclude password if empty
      const updateData: any = {
        name: formData.name,
        email: formData.email,
        role_id: formData.role_id,
      };

      // Only include password if it's filled
      if (formData.password.trim() !== "") {
        updateData.password = formData.password;
      }

      const response = await putRequest(
        `/api/users/detail_user/${userId}`,
        updateData
      );
      if (response.status === "success") {
        showAddToast("User updated successfully!");
        router.push(`/dashboard?menu=account_setting&search=`);
      } else {
        console.error("Failed to update user:", response);
        showErrorToast(
          response.message || "An error occurred while updating the user."
        );
      }
    } catch (error: any) {
      console.error("Error updating user:", error);
      showErrorToast(
        error.response?.data?.message ||
          "An error occurred. Please try again later."
      );
    }
  };

  const handleCancel = () => {
    router.push(`/dashboard?menu=account_setting&search=`);
  };

  // Show loading state
  if (loading) {
    return (
      <>
        <Head>
          <title>Edit User</title>
          <link rel="icon" href="/assets/images/icon/fanscosa-icon.png" />
        </Head>
        <div className="flex justify-start items-center gap-2 mb-4">
          <ManageAccountsOutlined className="h-7 w-7 text-black" />
          <h2 className="text-xl font-semibold text-black">Edit User</h2>
        </div>
        <Paper sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Skeleton variant="rectangular" height={56} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Skeleton variant="rectangular" height={56} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Skeleton variant="rectangular" height={56} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Skeleton variant="rectangular" height={56} />
            </Grid>
          </Grid>
        </Paper>
      </>
    );
  }

  // Show error state if user not found
  if (userNotFound) {
    return (
      <>
        <Head>
          <title>Edit User - User Not Found</title>
          <link rel="icon" href="/assets/images/icon/fanscosa-icon.png" />
        </Head>
        <div className="flex justify-start items-center gap-2 mb-4">
          <ManageAccountsOutlined className="h-7 w-7 text-black" />
          <h2 className="text-xl font-semibold text-black">Edit User</h2>
        </div>
        <Paper sx={{ p: 3 }}>
          <Box textAlign="center" py={4}>
            <h3>User not found</h3>
            <Button
              onClick={handleCancel}
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
            >
              Back to Users List
            </Button>
          </Box>
        </Paper>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Edit User</title>
        <link rel="icon" href="/assets/images/icon/fanscosa-icon.png" />
      </Head>
      <div className="flex justify-start items-center gap-2 mb-4">
        <ManageAccountsOutlined className="h-7 w-7 text-black" />
        <h2 className="text-xl font-semibold text-black">Edit User</h2>
      </div>
      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleUpdateUser} noValidate>
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
                fullWidth
                id="password"
                label="New Password (Optional)"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleTextChange}
                error={errors.password}
                helperText={
                  errors.password
                    ? "Password must be at least 6 characters"
                    : "Leave empty to keep current password"
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
                Update User
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </>
  );
};

export default EditUserPage;
