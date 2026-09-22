import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const changeHandler = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const submitHandler = async (event) => {
    event.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const data = await login(formData);

      if (!data.success) {
        toast.error(
          data.message || "Login failed"
        );
        return;
      }

      toast.success("Welcome back to FITFORGE");

      const redirectPath =
        location.state?.from?.pathname || "/";

      navigate(redirectPath, {
        replace: true,
      });
    } catch (error) {
      console.error("Login error:", error);

      toast.error(
        error.response?.data?.message ||
          "Unable to login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-gray-50">
      <motion.div
        initial={{
          opacity: 0,
          y: 25,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="w-full max-w-md bg-white p-8 md:p-10 shadow-sm border border-gray-200"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black tracking-[0.2em]">
            FITFORGE
          </h1>

          <p className="mt-3 text-gray-500">
            Sign in to your account
          </p>
        </div>

        <form
          onSubmit={submitHandler}
          className="space-y-5"
        >
          <div>
            <label className="block text-sm font-medium mb-2">
              Email
            </label>

            <div className="relative">
              <Mail
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={changeHandler}
                placeholder="Enter your email"
                autoComplete="email"
                className="w-full border border-gray-300 pl-10 pr-4 py-3 outline-none focus:border-black"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Password
            </label>

            <div className="relative">
              <Lock
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                value={formData.password}
                onChange={changeHandler}
                placeholder="Enter your password"
                autoComplete="current-password"
                className="w-full border border-gray-300 pl-10 pr-12 py-3 outline-none focus:border-black"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (previous) => !previous
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 font-semibold tracking-wide hover:bg-gray-800 transition disabled:opacity-50"
          >
            {loading
              ? "SIGNING IN..."
              : "SIGN IN"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-black font-semibold hover:underline"
          >
            Create account
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;