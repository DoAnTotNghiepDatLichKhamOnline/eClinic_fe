import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { authService } from "@/services/identity/authService";
import { setAccessToken } from "@/utils/axiosClient";
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
  avatarUrl?: string;
  specialty?: string;
  degree?: string;
  clinic?: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  loginWithCredentials: (data: DangNhapRequest) => Promise<DangNhapResponse>;
  loginWithGoogle: (idToken: string) => Promise<DangNhapResponse>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "eclinic_user_session";

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

  // Tự động khôi phục access token khi ứng dụng khởi động lại nếu có cookie refresh token
  useEffect(() => {
    let isMounted = true;
    const restoreSession = async () => {
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
        }
      } catch {
        // Nếu không có cookie hoặc cookie hết hạn, giữ user hiện tại hoặc xóa nếu cần
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
