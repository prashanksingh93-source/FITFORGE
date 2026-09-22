import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();

  const { register } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
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

    if (
      !formData.fullName ||
      !formData.email ||
      !formData.password
    ) {
      toast.error(
        "Please fill all required fields"
      );
      return;
    }

    if (formData.password.length < 6) {
      toast.error(
        "Password must be at least 6 characters"
      );
      return;
    }

    try {
      setLoading(true);

      const data = await register(formData);

      if (!data.success) {
        toast.error(
          data.message || "Registration failed"
        );
        return;
      }

      toast.success(
        "Account created successfully"
      );

      navigate("/");
    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Unable to create account"
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
            Create your account
          </p>
        </div>

        <form
          onSubmit={submitHandler}
          className="space-y-5"
        >
          <div>
            <label className="block text-sm font-medium mb-2">
              Full Name
            </label>

            <div className="relative">
              <User
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={changeHandler}
                placeholder="Enter your full name"
                autoComplete="name"
                className="w-full border border-gray-300 pl-10 pr-4 py-3 outline-none focus:border-black"
              />
            </div>
          </div>

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
              Phone
            </label>

            <div className="relative">
              <Phone
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={changeHandler}
                placeholder="Enter your phone number"
                autoComplete="tel"
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
                placeholder="Create a password"
                autoComplete="new-password"
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
              ? "CREATING ACCOUNT..."
              : "CREATE ACCOUNT"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-black font-semibold hover:underline"
          >
            Sign in
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;