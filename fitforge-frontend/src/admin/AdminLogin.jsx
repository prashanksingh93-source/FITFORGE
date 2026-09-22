import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { LockKeyhole } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "../context/AuthContext";

const AdminLogin = () => {
  const navigate = useNavigate();

  const { user, login } = useAuth();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  if (user?.role === "admin") {
    return (
      <Navigate
        to="/admin"
        replace
      />
    );
  }

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error(
        "Email and password are required"
      );
      return;
    }

    try {
      setLoading(true);

      const data = await login({
        email,
        password,
      });

      if (data.success) {
        if (data.user.role !== "admin") {
          toast.error(
            "You do not have admin access"
          );

          return;
        }

        toast.success(
          "Admin login successful"
        );

        navigate("/admin");
      }
    } catch (error) {
      console.error(
        "Admin login error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <p className="text-sm font-bold tracking-[0.4em] text-gray-400">
            FITFORGE
          </p>

          <h1 className="text-4xl font-black mt-3">
            ADMIN
          </h1>
        </div>

        <form
          onSubmit={submitHandler}
          className="bg-white text-black rounded-2xl p-7 md:p-9"
        >
          <div className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-6">
            <LockKeyhole className="w-6 h-6" />
          </div>

          <h2 className="text-2xl font-black text-center">
            ADMIN LOGIN
          </h2>

          <p className="text-sm text-gray-500 text-center mt-2 mb-7">
            Sign in to manage FITFORGE.
          </p>

          <div className="mb-5">
            <label className="block text-sm font-bold mb-2">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="admin@fitforge.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div className="mb-7">
            <label className="block text-sm font-bold mb-2">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Enter password"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3.5 font-black hover:bg-gray-800 transition disabled:opacity-50"
          >
            {loading
              ? "SIGNING IN..."
              : "SIGN IN"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;