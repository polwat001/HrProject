import { useEffect, useState } from "react";
import { useRouter } from "next/router";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Protected Route Wrapper - บังคับให้เข้าสู่ระบบก่อน
 * ถ้าไม่มี token จะ redirect ไปหน้า login
 */
export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      // ไม่มี token ส่งไปหน้า login
      router.push("/login");
    } else {
      // มี token ให้เข้าได้
      setIsAuthenticated(true);
    }

    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-muted-foreground">กำลังตรวจสอบสิทธิ์...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
