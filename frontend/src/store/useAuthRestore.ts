import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useStore } from "../store/useStore";
import { refreshToken } from "../api";

const publicRoutes = ["/login", "/register", "/forgot-password"];

export const useAuthRestore = () => {
  const location = useLocation();
  const { setAuth, setInitialized, startTokenRefreshLoop, logout } = useStore();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const isPublic = publicRoutes.some(
      (route) =>
        location.pathname === route ||
        location.pathname.startsWith(route + "/"),
    );

    if (isPublic) {
      setInitialized(true);
      return;
    }

    const restore = async () => {
      try {
        const res = await refreshToken();

        // 🔥 normalize role
        const role = res.data.role?.toLowerCase().trim();

        console.log("🔄 RESTORED TOKEN:", res.data.token);
        console.log("🔄 RESTORED ROLE:", role);

        setAuth(res.data.token, role);
        startTokenRefreshLoop();
      } catch (err: any) {
        if (err.response?.status === 401) {
          logout();
        }
      } finally {
        setInitialized(true);
      }
    };

    restore();
  }, [
    location.pathname,
    setAuth,
    setInitialized,
    startTokenRefreshLoop,
    logout,
  ]);
};
