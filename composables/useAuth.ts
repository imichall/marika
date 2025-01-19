import { ref } from "vue";

export const useAuth = () => {
  const isAuthenticated = ref(false);

  const checkAuth = () => {
    if (process.client) {
      isAuthenticated.value = localStorage.getItem("isAdmin") === "true";
    }
  };

  const login = async (email: string, password: string) => {
    // Zde později implementujeme skutečnou autentizaci
    if (email === "admin@example.com" && password === "admin123") {
      localStorage.setItem("isAdmin", "true");
      isAuthenticated.value = true;
      return true;
    }
    return false;
  };

  const logout = () => {
    if (process.client) {
      localStorage.removeItem("isAdmin");
      isAuthenticated.value = false;
    }
  };

  // Kontrola při inicializaci
  if (process.client) {
    checkAuth();
  }

  return {
    isAuthenticated,
    login,
    logout,
    checkAuth,
  };
};