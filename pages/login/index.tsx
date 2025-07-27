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
} from "@mui/material";
import Cookies from "js-cookie";
import Image from "next/image";
import { FaEye, FaEyeSlash, FaSignInAlt } from "react-icons/fa";
import { showSuccessToast } from "@/utils/notif";
import { postRequest } from "@/utils/apiClient";

interface FormData {
  email: string;
  password: string;
}

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
          style: { background: "#FF6B6B", color: "white" },
        });
      } else {
        toast.error("An error occurred", {
          duration: 3000,
          position: "top-right",
          style: { background: "#FF6B6B", color: "white" },
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
        <title>Login</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="bg-white shadow-2xl rounded-xl border border-gray-200 px-8 pt-6 pb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-red-600 font-bold text-2xl">
                  Hi, Welcome Back
                </h1>
                <h6 className="text-black font-semibold">
                  Login to your account
                </h6>
              </div>
              <Image
                src="/assets/images/Fanscosaapp.png"
                alt="Logo"
                width={130}
                height={130}
              />
            </div>
            <form className="mt-5 space-y-6" onSubmit={handleSubmit}>
              <TextField
                id="email"
                name="email"
                label="Email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                margin="normal"
              />
              <TextField
                id="password"
                name="password"
                label="Password"
                type={passwordVisible ? "text" : "password"}
                required
                value={formData.password}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                margin="normal"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={togglePasswordVisibility} edge="end">
                        {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    sx={{
                      color: "#dc2626", // warna saat tidak dicentang
                      "&.Mui-checked": {
                        color: "#dc2626", // warna saat dicentang
                      },
                    }}
                  />
                }
                label="Remember Me"
                sx={{
                  color: "black", // warna teks label
                }}
              />

              <button
                type="submit"
                disabled={isLoading}
                className="group w-full flex justify-center py-2 px-4 border font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-all duration-300 h-16 items-center text-xl"
              >
                <FaSignInAlt className="mr-2" />
                {isLoading ? "Signing In..." : "Sign In"}
              </button>
              <Divider />
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
