import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const getMe = async () => {
    try {
      const response = await api.get("/auth/me");

      if (response.data.success) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMe();
  }, []);

  const register = async (userData) => {
    const response = await api.post(
      "/auth/register",
      userData
    );

    if (response.data.success) {
      /*
       * Save JWT token if backend returns one.
       */
      const token =
        response.data.token ||
        response.data.accessToken;

      if (token) {
        localStorage.setItem(
          "fitforge-token",
          token
        );
      }

      setUser(response.data.user);
    }

    return response.data;
  };

  const login = async (userData) => {
    const response = await api.post(
      "/auth/login",
      userData
    );

    if (response.data.success) {
      /*
       * Get token from backend response.
       *
       * Your api.js expects this exact localStorage key:
       * "fitforge-token"
       */
      const token =
        response.data.token ||
        response.data.accessToken;

      if (token) {
        localStorage.setItem(
          "fitforge-token",
          token
        );
      }

      setUser(response.data.user);
    }

    return response.data;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      /*
       * Remove the same token used by api.js.
       */
      localStorage.removeItem(
        "fitforge-token"
      );

      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        getMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};

export default AuthContext;

