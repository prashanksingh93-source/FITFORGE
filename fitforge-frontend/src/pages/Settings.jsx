import { useState } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  ArrowLeft,
} from "lucide-react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:8000";

const Settings = () => {
  const navigate = useNavigate();

  const [formData, setFormData] =
    useState({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

  const [
    showCurrent,
    setShowCurrent,
  ] = useState(false);

  const [
    showNew,
    setShowNew,
  ] = useState(false);

  const [
    showConfirm,
    setShowConfirm,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  /* =====================================================
     HANDLE INPUT
  ====================================================== */

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setFormData(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );
  };

  /* =====================================================
     SUBMIT
  ====================================================== */

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = formData;

    /* ---------------------------------------------
       EMPTY CHECK
    --------------------------------------------- */

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      toast.error(
        "Please fill all fields"
      );

      return;
    }

    /* ---------------------------------------------
       PASSWORD LENGTH
    --------------------------------------------- */

    if (
      newPassword.length < 8
    ) {
      toast.error(
        "New password must be at least 8 characters"
      );

      return;
    }

    /* ---------------------------------------------
       PASSWORD MATCH
    --------------------------------------------- */

    if (
      newPassword !==
      confirmPassword
    ) {
      toast.error(
        "New passwords do not match"
      );

      return;
    }

    try {
      setLoading(true);

      const response =
        await axios.patch(
          `${API_URL}/api/auth/change-password`,
          {
            currentPassword,
            newPassword,
          },
          {
            withCredentials: true,
          }
        );

      if (
        response.data.success
      ) {
        toast.success(
          "Password changed successfully"
        );

        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });

        /*
          Backend clears the old token.
          User must login again.
        */

        setTimeout(() => {
          navigate("/login");
        }, 1200);
      }
    } catch (error) {
      console.error(
        "Change password error:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to change password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 sm:py-16">

      <div className="max-w-2xl mx-auto">

        {/* =================================================
            BACK
        ================================================== */}

        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black transition mb-8"
        >
          <ArrowLeft size={17} />

          Back to Home
        </Link>

        {/* =================================================
            HEADER
        ================================================== */}

        <div className="mb-8">

          <p className="text-[10px] font-black tracking-[0.35em] text-gray-500">
            FITFORGE
          </p>

          <h1 className="mt-2 text-4xl sm:text-5xl font-black tracking-tight">
            Settings
          </h1>

          <p className="mt-3 text-sm text-gray-500">
            Manage your account and security.
          </p>

        </div>

        {/* =================================================
            PASSWORD CARD
        ================================================== */}

        <div className="bg-white border border-gray-200 shadow-sm">

          {/* Card Header */}

          <div className="p-6 sm:p-8 border-b border-gray-200">

            <div className="flex items-center gap-4">

              <div className="w-11 h-11 bg-black text-white flex items-center justify-center">
                <Lock size={19} />
              </div>

              <div>

                <h2 className="text-lg font-black">
                  Change Password
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Update your admin account password
                </p>

              </div>

            </div>

          </div>

          {/* Form */}

          <form
            onSubmit={handleSubmit}
            className="p-6 sm:p-8"
          >

            {/* =========================================
                CURRENT PASSWORD
            ========================================== */}

            <div className="mb-6">

              <label
                htmlFor="currentPassword"
                className="block mb-2 text-xs font-black tracking-[0.15em]"
              >
                CURRENT PASSWORD
              </label>

              <div className="relative">

                <input
                  id="currentPassword"
                  type={
                    showCurrent
                      ? "text"
                      : "password"
                  }
                  name="currentPassword"
                  value={
                    formData.currentPassword
                  }
                  onChange={
                    handleChange
                  }
                  autoComplete="current-password"
                  placeholder="Enter current password"
                  className="w-full h-12 px-4 pr-12 border border-gray-300 bg-white outline-none focus:border-black transition"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowCurrent(
                      (previous) =>
                        !previous
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition"
                  aria-label="Toggle current password"
                >
                  {showCurrent ? (
                    <EyeOff
                      size={18}
                    />
                  ) : (
                    <Eye
                      size={18}
                    />
                  )}
                </button>

              </div>

            </div>

            {/* =========================================
                NEW PASSWORD
            ========================================== */}

            <div className="mb-6">

              <label
                htmlFor="newPassword"
                className="block mb-2 text-xs font-black tracking-[0.15em]"
              >
                NEW PASSWORD
              </label>

              <div className="relative">

                <input
                  id="newPassword"
                  type={
                    showNew
                      ? "text"
                      : "password"
                  }
                  name="newPassword"
                  value={
                    formData.newPassword
                  }
                  onChange={
                    handleChange
                  }
                  autoComplete="new-password"
                  placeholder="Enter new password"
                  className="w-full h-12 px-4 pr-12 border border-gray-300 bg-white outline-none focus:border-black transition"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowNew(
                      (previous) =>
                        !previous
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition"
                  aria-label="Toggle new password"
                >
                  {showNew ? (
                    <EyeOff
                      size={18}
                    />
                  ) : (
                    <Eye
                      size={18}
                    />
                  )}
                </button>

              </div>

              <p className="mt-2 text-xs text-gray-500">
                Password must contain at least 8 characters.
              </p>

            </div>

            {/* =========================================
                CONFIRM PASSWORD
            ========================================== */}

            <div className="mb-8">

              <label
                htmlFor="confirmPassword"
                className="block mb-2 text-xs font-black tracking-[0.15em]"
              >
                CONFIRM NEW PASSWORD
              </label>

              <div className="relative">

                <input
                  id="confirmPassword"
                  type={
                    showConfirm
                      ? "text"
                      : "password"
                  }
                  name="confirmPassword"
                  value={
                    formData.confirmPassword
                  }
                  onChange={
                    handleChange
                  }
                  autoComplete="new-password"
                  placeholder="Confirm new password"
                  className="w-full h-12 px-4 pr-12 border border-gray-300 bg-white outline-none focus:border-black transition"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirm(
                      (previous) =>
                        !previous
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition"
                  aria-label="Toggle confirm password"
                >
                  {showConfirm ? (
                    <EyeOff
                      size={18}
                    />
                  ) : (
                    <Eye
                      size={18}
                    />
                  )}
                </button>

              </div>

            </div>

            {/* =========================================
                SUBMIT
            ========================================== */}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-13 bg-black text-white text-xs font-black tracking-[0.2em] hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading
                ? "CHANGING PASSWORD..."
                : "CHANGE PASSWORD"}
            </button>

          </form>

        </div>

        {/* Security note */}

        <p className="mt-5 text-xs text-gray-500 text-center">
          After changing your password, you will
          need to sign in again.
        </p>

      </div>
    </div>
  );
};

export default Settings;