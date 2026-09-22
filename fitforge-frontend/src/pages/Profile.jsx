import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  User,
  LogOut,
  Package,
  MapPin,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);

      await logout();

      toast.success("Logged out successfully");

      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Unable to logout");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-[80vh] bg-gray-50 px-4 py-12 md:py-16">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs tracking-[0.3em] text-gray-500 font-semibold mb-3">
            FITFORGE ACCOUNT
          </p>

          <h1 className="text-4xl md:text-5xl font-black">
            MY PROFILE
          </h1>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-6">

          {/* Sidebar */}
          <motion.div
            initial={{
              opacity: 0,
              x: -20,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            className="bg-black text-white p-7"
          >
            <div className="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center mb-5">
              <User size={36} />
            </div>

            <h2 className="text-xl font-bold">
              {user.fullName}
            </h2>

            <p className="text-gray-400 text-sm mt-1 break-all">
              {user.email}
            </p>

            <div className="mt-8 space-y-2">

              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="w-full flex items-center gap-3 px-4 py-3 bg-white text-black text-sm font-semibold text-left"
              >
                <User size={17} />
                Profile
              </button>

              <button
                type="button"
                onClick={() => navigate("/orders")}
                className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/10 text-sm font-semibold text-left transition"
              >
                <Package size={17} />
                My Orders
              </button>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loading}
                className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/10 text-sm font-semibold text-left transition disabled:opacity-50"
              >
                <LogOut size={17} />

                {loading
                  ? "Logging out..."
                  : "Logout"}
              </button>

            </div>
          </motion.div>

          {/* Profile Information */}
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="bg-white border border-gray-200 p-7 md:p-10"
          >
            <div className="flex items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold">
                  Account Information
                </h2>

                <p className="text-gray-500 text-sm mt-1">
                  Your FITFORGE account details
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">

              {/* Name */}
              <div className="border border-gray-200 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <User
                    size={19}
                    className="text-gray-500"
                  />

                  <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                    Full Name
                  </span>
                </div>

                <p className="font-semibold">
                  {user.fullName}
                </p>
              </div>

              {/* Email */}
              <div className="border border-gray-200 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <Mail
                    size={19}
                    className="text-gray-500"
                  />

                  <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                    Email
                  </span>
                </div>

                <p className="font-semibold break-all">
                  {user.email}
                </p>
              </div>

              {/* Phone */}
              <div className="border border-gray-200 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <Phone
                    size={19}
                    className="text-gray-500"
                  />

                  <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                    Phone
                  </span>
                </div>

                <p className="font-semibold">
                  {user.phone || "Not provided"}
                </p>
              </div>

              {/* Role */}
              <div className="border border-gray-200 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <MapPin
                    size={19}
                    className="text-gray-500"
                  />

                  <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                    Account Type
                  </span>
                </div>

                <p className="font-semibold capitalize">
                  {user.role}
                </p>
              </div>

            </div>

            {/* Orders Button */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate("/orders")}
                className="inline-flex items-center gap-3 bg-black text-white px-7 py-3 text-sm font-semibold tracking-wide hover:bg-gray-800 transition"
              >
                <Package size={18} />
                VIEW MY ORDERS
              </button>
            </div>
          </motion.div>

        </div>
      </div>
    </main>
  );
};

export default Profile;