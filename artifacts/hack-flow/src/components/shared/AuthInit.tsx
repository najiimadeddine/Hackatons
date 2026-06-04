import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useGetMe } from "@workspace/api-client-react";

export function AuthInit() {
  const { setAuth, clearAuth } = useAuthStore();
  const token = localStorage.getItem('access_token');
  
  const { data: user, isError } = useGetMe({
    query: {
      enabled: !!token,
      retry: false,
    } as any,
  });

  useEffect(() => {
    if (user && token) {
      setAuth(user, token);
    }
    if (isError) {
      clearAuth();
    }
  }, [user, token, isError, setAuth, clearAuth]);

  return null;
}
