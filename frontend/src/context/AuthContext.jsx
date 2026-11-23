import { createContext, useContext, useState } from "react";
import { authApi } from "../api/services";
import { AUTH_STORAGE_KEY } from "../api/axiosClient";

// AuthContext shares the login state with every component.
const AuthContext = createContext(null);

function loadSavedAuth() {
  try {
    const saved = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY));
    if (saved?.token && new Date(saved.expiresAtUtc) > new Date()) {
      return saved;
    }
  } catch {
    // ignore broken data
  }
  localStorage.removeItem(AUTH_STORAGE_KEY);
  return null;
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(loadSavedAuth);

  const login = async (username, password) => {
    const data = await authApi.login(username, password);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
    setAuth(data);
  };

  // JWT logout = simply forget the token on the client.
  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuth(null);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated: !!auth, username: auth?.username, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
