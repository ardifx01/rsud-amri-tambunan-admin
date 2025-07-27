import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  Chip,
  Avatar,
  Paper,
  Button,
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
  Security as SecurityIcon,
  AssignmentTurnedIn as PermissionIcon,
} from "@mui/icons-material";
import { getRequest } from "@/utils/apiClient";
import LoadingComponent from "@/components/LoadingComponent";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import Head from "next/head";
import { useRouter } from "next/router";
import { FiArrowLeft } from "react-icons/fi";

interface UserDetails {
  id: number;
  name: string;
  email: string;
}

interface Role {
  id: number;
  name: string;
  description: string;
}

interface Permission {
  id: number;
  name: string;
  description: string;
}

interface UserDetailsData {
  user: UserDetails;
  roles: Role[];
  permissions: Permission[];
}

interface UserDetailProps {
  userID: string;
}

const UserDetailsPage = ({ userID }: UserDetailProps) => {
  const [userDetail, setUserDetail] = useState<UserDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  // Mock data from the API response (replace with actual data in real implementation)
  const fetchUserDetail = async (userID: string) => {
    console.log("Fetching user detail for ID:", userID);
    try {
      const result = await getRequest(`/api/users/${userID}`);
      console.log("API Response:", result);
      setUserDetail(result.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user detail:", error);
      setLoading(false);
    }
  };
  const router = useRouter();

  useEffect(() => {
    if (userID) {
      fetchUserDetail(userID);
    }
  }, [userID]);

  if (loading) {
    return (
      <LoadingComponent
        text="Loading Data User Details..."
        spinnerColor="#1e2dfa"
        textColor="#333"
      />
    );
  }

  const handleBackClick = () => {
    router.push("/dashboard?menu=account_setting&page=1&limit=10&search="); // Kembali ke halaman daftar pasien
  };
  return (
    <>
      <Head>
        <title>User Details</title>
        <link rel="icon" href="/assets/images/icon/fanscosa-icon.png" />
      </Head>
      <div className="flex justify-between items-center mb-2">
        <div className="flex justify-start items-center gap-2">
          <AccountCircleOutlinedIcon className="h-5 w-5 text-black" />
          <h2 className="text-xl font-semibold text-black">User Detail Information</h2>
        </div>
        <Button
          onClick={handleBackClick}
          variant="outlined"
          startIcon={<FiArrowLeft />}
          sx={{ color: "#1976d2", fontWeight: "bold" }}
        >
          Back
        </Button>
      </div>

      <div className="flex justify-between items-center mb-2">
        <Grid container spacing={4}>
          {/* User Profile Section */}
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ borderRadius: 2 }}>
              <Card variant="outlined" sx={{ border: "none" }}>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 120,
                        height: 120,
                        mb: 2,
                        bgcolor: "primary.main",
                      }}
                    >
                      <PersonIcon sx={{ fontSize: 80 }} />
                    </Avatar>

                    <Typography variant="h5" component="div" gutterBottom>
                      {userDetail?.user.name}
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <EmailIcon sx={{ mr: 1, color: "text.secondary" }} />
                      <Typography variant="body1" color="text.secondary">
                        {userDetail?.user.email}
                      </Typography>
                    </Box>

                    <Chip
                      icon={<PermissionIcon />}
                      label={`User ID: ${userDetail?.user.id}`}
                      variant="outlined"
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Paper>
          </Grid>

          {/* Roles and Permissions Section */}
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ borderRadius: 2 }}>
              <Card variant="outlined" sx={{ border: "none" }}>
                <CardContent>
                  {/* Roles Section */}
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        borderBottom: 1,
                        borderColor: "divider",
                        pb: 1,
                      }}
                    >
                      <SecurityIcon sx={{ mr: 2 }} />
                      Roles
                    </Typography>

                    <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                      {userDetail?.roles.map((role) => (
                        <Chip
                          key={role.id}
                          label={role.name}
                          color="primary"
                          variant="filled"
                          icon={<BadgeIcon />}
                        />
                      ))}
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Permissions Section */}
                  <Box>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        borderBottom: 1,
                        borderColor: "divider",
                        pb: 1,
                      }}
                    >
                      <PermissionIcon sx={{ mr: 2 }} />
                      Permissions
                    </Typography>

                    <Grid container spacing={1} sx={{ mt: 2 }}>
                      {userDetail?.permissions.map((permission) => (
                        <Grid item xs={12} sm={6} md={4} key={permission.id}>
                          <Chip
                            label={permission.name}
                            variant="outlined"
                            color="secondary"
                            icon={<SecurityIcon />}
                            sx={{ width: "100%", justifyContent: "start" }}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </CardContent>
              </Card>
            </Paper>
          </Grid>
        </Grid>
      </div>
    </>
  );
};

export default UserDetailsPage;
