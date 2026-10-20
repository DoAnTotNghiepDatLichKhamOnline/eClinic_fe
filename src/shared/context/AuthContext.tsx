import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { authService } from "@/services/identity/authService";
import { setAccessToken, getAccessToken } from "@/utils/axiosClient";
import { applyAccountLanguage } from "@/utils/languagePreference";
import type {
  DangNhapRequest,
  DangNhapResponse,
  VaiTro,
} from "@/types/auth.type";

export interface User {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  role: "patient" | "doctor" | "admin";
  vaiTro?: "patient" | "doctor" | "admin" | "BENH_NHAN" | "BAC_SI" | "QUAN_TRI_VIEN";
  avatarUrl?: string;
  specialty?: string;
  degree?: string;
  clinic?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoadingSession: boolean;
  login: (userData: User) => void;
  loginWithCredentials: (data: DangNhapRequest) => Promise<DangNhapResponse>;
  loginWithGoogle: (idToken: string) => Promise<DangNhapResponse>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "eclinic_user_session";

function isTokenValid(token: string | null): boolean {
  if (!token) return false;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(jsonPayload);
    if (!payload.exp) return true;
    return payload.exp * 1000 > Date.now() + 30000;
  } catch {
    return false;
  }
}

function mapVaiTroToRole(vaiTro: VaiTro): "patient" | "doctor" | "admin" {
  switch (vaiTro) {
    case "BAC_SI":
      return "doctor";
    case "QUAN_TRI_VIEN":
      return "admin";
    case "BENH_NHAN":
    default:
      return "patient";
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  // Tự động khôi phục access token khi ứng dụng khởi động lại nếu có cookie refresh token
  useEffect(() => {
    let isMounted = true;
    const restoreSession = async () => {
      const currentToken = getAccessToken();
      const savedUserStr = localStorage.getItem(STORAGE_KEY);
      const hasSavedUser = Boolean(savedUserStr);

      // 1. Chưa đăng nhập (khách vãng lai): không gọi refresh-token tránh lỗi 401
      if (!hasSavedUser && !currentToken) {
        if (isMounted) {
          setIsLoadingSession(false);
        }
        return;
      }

      // 2. Đã có user và access token vẫn còn hạn sử dụng: giữ nguyên session
      if (hasSavedUser && isTokenValid(currentToken)) {
        if (isMounted) {
          setIsLoadingSession(false);
        }
        return;
      }

      // 3. Có user nhưng token hết hạn hoặc chưa nạp: dùng refresh-token để khôi phục
      try {
        const response = await authService.lamMoiToken();
        if (response.thanhCong && response.duLieu && isMounted) {
          setAccessToken(response.duLieu.accessToken);
          const tk = response.duLieu.taiKhoan;
          applyAccountLanguage(tk.ngonNgu);
          setUser({
            id: String(tk.id),
            name: tk.hoTen,
            email: tk.email,
            phone: tk.soDienThoai || undefined,
            role: mapVaiTroToRole(tk.vaiTro),
          });
        } else if (isMounted) {
          setAccessToken(null);
          setUser(null);
        }
      } catch {
        if (isMounted) {
          setAccessToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoadingSession(false);
        }
      }
    };

    restoreSession();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const login = (userData: User) => {
    setUser(userData);
  };

  const loginWithCredentials = async (
    data: DangNhapRequest,
  ): Promise<DangNhapResponse> => {
    const response = await authService.dangNhap(data);
    if (!response.thanhCong || !response.duLieu) {
      throw new Error(response.thongDiep || "Đăng nhập không thành công");
    }

    const { accessToken, taiKhoan } = response.duLieu;
    applyAccountLanguage(taiKhoan.ngonNgu);
    setAccessToken(accessToken);

    const mappedUser: User = {
      id: String(taiKhoan.id),
      name: taiKhoan.hoTen,
      email: taiKhoan.email,
      phone: taiKhoan.soDienThoai || undefined,
      role: mapVaiTroToRole(taiKhoan.vaiTro),
    };

    setUser(mappedUser);
    return response.duLieu;
  };

  const loginWithGoogle = async (
    idToken: string,
  ): Promise<DangNhapResponse> => {
    const response = await authService.dangNhapGoogle({ idToken });
    if (!response.thanhCong || !response.duLieu) {
      throw new Error(response.thongDiep || "Đăng nhập Google không thành công");
    }

    const { accessToken, taiKhoan } = response.duLieu;
    applyAccountLanguage(taiKhoan.ngonNgu);
    setAccessToken(accessToken);

    const mappedUser: User = {
      id: String(taiKhoan.id),
      name: taiKhoan.hoTen,
      email: taiKhoan.email,
      phone: taiKhoan.soDienThoai || undefined,
      role: mapVaiTroToRole(taiKhoan.vaiTro),
    };

    setUser(mappedUser);
    return response.duLieu;
  };

  const logout = async () => {
    try {
      await authService.dangXuat();
    } catch {
      // Bỏ qua lỗi mạng khi logout
    } finally {
      setAccessToken(null);
      setUser(null);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoadingSession,
        login,
        loginWithCredentials,
        loginWithGoogle,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
