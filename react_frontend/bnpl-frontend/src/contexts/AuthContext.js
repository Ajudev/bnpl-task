import { createContext, useState, useContext, useEffect } from "react";
import api from "../api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        // Set default authorization header
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }

    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post("/api/auth/login/", {
        username: email,
        password: password,
      });

      const { access, refresh, user: userData } = response.data;

      // Store tokens and user data
      localStorage.setItem("token", access);
      localStorage.setItem("refreshToken", refresh);
      localStorage.setItem("user", JSON.stringify(userData));

      // Set authorization header
      api.defaults.headers.common["Authorization"] = `Bearer ${access}`;

      setUser(userData);

      return { success: true, user: userData };
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.error ||
        "Login failed. Please try again.";
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await api.post("/api/auth/logout/", {
        refresh_token: localStorage.getItem("refreshToken"),
      });
    } catch (error) {
      console.error("Login error:", error);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
  };

  const refreshToken = async () => {
    try {
      const refresh = localStorage.getItem("refreshToken");
      if (!refresh) {
        throw new Error("No refresh token available");
      }

      const response = await api.post("/api/token/refresh/", {
        refresh,
      });

      const { access } = response.data;
      localStorage.setItem("token", access);
      api.defaults.headers.common["Authorization"] = `Bearer ${access}`;

      return access;
    } catch (error) {
      console.error("Token refresh failed:", error);
      logout();
      throw error;
    }
  };

  // Axios interceptor for token refresh
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            await refreshToken();
            return api(originalRequest);
          } catch (refreshError) {
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, []);

  const isAuthenticated = () => {
    return !!user && !!localStorage.getItem("token");
  };

  const isMerchant = () => {
    return user?.user_type === "merchant";
  };

  const isCustomer = () => {
    return user?.user_type === "customer";
  };

  const value = {
    user,
    login,
    logout,
    refreshToken,
    isAuthenticated,
    isMerchant,
    isCustomer,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
