import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import Head from "next/head";
import { Toaster, toast } from "react-hot-toast";
import {
  Checkbox,
  Divider,
  IconButton,
  InputAdornment,
  TextField,
  FormControlLabel,
  Paper,
  Box,
  Typography,
  Fade,
  Slide,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import Cookies from "js-cookie";
import Image from "next/image";
import { FaEye, FaEyeSlash, FaSignInAlt, FaUser, FaLock } from "react-icons/fa";
import { showSuccessToast } from "@/utils/notif";
import { postRequest } from "@/utils/apiClient";

interface FormData {
  email: string;
  password: string;
}

// Styled components dengan tema merah-putih
const StyledContainer = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 25%, #991b1b 50%, #7f1d1d 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(2),
  position: "relative",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><defs><pattern id=\"grain\" width=\"100\" height=\"100\" patternUnits=\"userSpaceOnUse\"><circle cx=\"50\" cy=\"50\" r=\"1\" fill=\"%23ffffff\" opacity=\"0.08\"/></pattern></defs><rect width=\"100\" height=\"100\" fill=\"url(%23grain)\"/></svg>') repeat",
    zIndex: -1,
  },
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  width: "100%",
  maxWidth: 440,
  borderRadius: 20,
  background: "rgba(255, 255, 255, 0.98)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(220, 38, 38, 0.2)",
  boxShadow: "0 25px 50px rgba(220, 38, 38, 0.25)",
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: "linear-gradient(90deg, #dc2626, #ef4444, #f87171)",
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: 12,
    backgroundColor: "rgba(254, 242, 242, 0.8)",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: "rgba(254, 242, 242, 1)",
      transform: "translateY(-1px)",
    },
    "&.Mui-focused": {
      backgroundColor: "rgba(255, 255, 255, 1)",
      transform: "translateY(-2px)",
      boxShadow: "0 8px 25px rgba(220, 38, 38, 0.15)",
    },
    "& fieldset": {
      borderColor: "rgba(220, 38, 38, 0.3)",
    },
    "&:hover fieldset": {
      borderColor: "rgba(220, 38, 38, 0.5)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#dc2626",
      borderWidth: 2,
    },
  },
  "& .MuiInputLabel-root": {
    color: "#64748b",
    "&.Mui-focused": {
      color: "#dc2626",
    },
  },
}));

const StyledButton = styled("button")(({ theme }) => ({
  width: "100%",
  height: 56,
  borderRadius: 14,
  border: "none",
  background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%)",
  color: "white",
  fontSize: 16,
  fontWeight: 600,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  transition: "all 0.3s ease",
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: "-100%",
    width: "100%",
    height: "100%",
    background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)",
    transition: "left 0.5s ease",
  },
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 15px 35px rgba(220, 38, 38, 0.4)",
    "&::before": {
      left: "100%",
    },
  },
  "&:active": {
    transform: "translateY(0px)",
  },
  "&:disabled": {
    opacity: 0.7,
    cursor: "not-allowed",
    transform: "none",
    "&:hover": {
      transform: "none",
      boxShadow: "none",
    },
  },
}));

const FloatingIcon = styled(Box)(({ theme }) => ({
  position: "absolute",
  width: 60,
  height: 60,
  borderRadius: "50%",
  background: "linear-gradient(135deg, rgba(220, 38, 38, 0.15), rgba(185, 28, 28, 0.1))",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 24,
  color: "#dc2626",
  animation: "float 6s ease-in-out infinite",
  "@keyframes float": {
    "0%, 100%": { transform: "translateY(0px)" },
    "50%": { transform: "translateY(-10px)" },
  },
}));

const Login: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const savedEmail = localStorage.getItem("savedEmail");
    const savedPassword = localStorage.getItem("savedPassword");
    const savedRemember = localStorage.getItem("rememberMe");

    if (savedRemember === "true" && savedEmail && savedPassword) {
      setFormData({ email: savedEmail, password: savedPassword });
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await postRequest("/auth/login", formData);
      if (response?.status === "success") {
        const { token } = response.data;
        Cookies.set("authToken", token, {
          expires: rememberMe ? 7 : 1,
          secure: process.env.NODE_ENV === "production",
          sameSite: "Strict",
          path: "/",
        });

        if (rememberMe) {
          localStorage.setItem("savedEmail", formData.email);
          localStorage.setItem("savedPassword", formData.password);
          localStorage.setItem("rememberMe", "true");
        } else {
          localStorage.removeItem("savedEmail");
          localStorage.removeItem("savedPassword");
          localStorage.removeItem("rememberMe");
        }

        showSuccessToast("Login Successful!");
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      } else {
        throw new Error("Login failed");
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response.data?.message || "Login Failed", {
          duration: 3000,
          position: "top-right",
          style: { 
            background: "linear-gradient(135deg, #dc2626, #b91c1c)",
            color: "white",
            borderRadius: "12px",
          },
        });
      } else {
        toast.error("An error occurred", {
          duration: 3000,
          position: "top-right",
          style: { 
            background: "linear-gradient(135deg, #dc2626, #b91c1c)",
            color: "white",
            borderRadius: "12px",
          },
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (): void => {
    setPasswordVisible((prev) => !prev);
  };

  return (
    <>
      <Toaster />
      <Head>
        <title>Login - Welcome Back</title>
        <meta name="description" content="Login to your account" />
      </Head>
      
      <StyledContainer>
        {/* Floating decorative elements */}
        <FloatingIcon sx={{ top: '10%', left: '10%', animationDelay: '0s' }}>
          <FaUser />
        </FloatingIcon>
        <FloatingIcon sx={{ top: '20%', right: '15%', animationDelay: '2s' }}>
          <FaLock />
        </FloatingIcon>
        <FloatingIcon sx={{ bottom: '15%', left: '15%', animationDelay: '4s' }}>
          <FaSignInAlt />
        </FloatingIcon>

        <Fade in timeout={800}>
          <StyledPaper elevation={0}>
            <Slide direction="down" in timeout={600}>
              <Box>
                {/* Header Section */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Box>
                    <Typography 
                      variant="h4" 
                      fontWeight="700" 
                      sx={{ 
                        background: "linear-gradient(135deg, #dc2626, #b91c1c)",
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        mb: 0.5
                      }}
                    >
                      Welcome Back
                    </Typography>
                    <Typography 
                      variant="body1" 
                      color="text.secondary"
                      fontWeight="500"
                    >
                      Sign in to continue your journey
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      background: "linear-gradient(135deg, rgba(220, 38, 38, 0.1), rgba(185, 28, 28, 0.1))",
                    }}
                  >
                    <Image
                      src="/assets/images/Fanscosaapp.png"
                      alt="Logo"
                      width={80}
                      height={80}
                      style={{ borderRadius: 8 }}
                    />
                  </Box>
                </Box>

                {/* Form Section */}
                <form onSubmit={handleSubmit} style={{ marginTop: 32 }}>
                  <Box mb={3}>
                    <StyledTextField
                      id="email"
                      name="email"
                      label="Email Address"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      variant="outlined"
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <FaUser style={{ color: '#dc2626', fontSize: 16 }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>

                  <Box mb={2}>
                    <StyledTextField
                      id="password"
                      name="password"
                      label="Password"
                      type={passwordVisible ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      variant="outlined"
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <FaLock style={{ color: '#dc2626', fontSize: 16 }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton 
                              onClick={togglePasswordVisibility} 
                              edge="end"
                              sx={{ 
                                color: '#dc2626',
                                '&:hover': { backgroundColor: 'rgba(220, 38, 38, 0.1)' }
                              }}
                            >
                              {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>

                  <Box mb={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          sx={{
                            color: "rgba(220, 38, 38, 0.6)",
                            "&.Mui-checked": {
                              color: "#dc2626",
                            },
                          }}
                        />
                      }
                      label={
                        <Typography variant="body2" color="text.secondary">
                          Remember me for 7 days
                        </Typography>
                      }
                    />
                  </Box>

                  <StyledButton type="submit" disabled={isLoading}>
                    <FaSignInAlt />
                    {isLoading ? "Signing In..." : "Sign In"}
                  </StyledButton>
                </form>

                {/* Divider */}
                <Box my={3}>
                  <Divider sx={{ 
                    '&::before, &::after': {
                      borderColor: 'rgba(220, 38, 38, 0.2)',
                    }
                  }} />
                </Box>

                {/* Footer */}
                <Box textAlign="center">
                  <Typography variant="body2" color="text.secondary">
                    Don't have an account?{' '}
                    <Typography 
                      component="span" 
                      sx={{ 
                        color: '#dc2626',
                        cursor: 'pointer',
                        fontWeight: 600,
                        '&:hover': { textDecoration: 'underline' }
                      }}
                    >
                      Sign up here
                    </Typography>
                  </Typography>
                </Box>
              </Box>
            </Slide>
          </StyledPaper>
        </Fade>
      </StyledContainer>
    </>
  );
};

export default Login;