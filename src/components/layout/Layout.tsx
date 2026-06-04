import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import AdminHeader from "./AdminHeader";
import Footer from "./Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admin");
  const isAuthPage = location.pathname === "/admin/login" || location.pathname === "/admin/forgot-password" || location.pathname === "/auth";

  return (
    <div className="min-h-screen flex flex-col">
      {isAdminPath && !isAuthPage ? <AdminHeader /> : <Header />}
      <main className="flex-1">{children}</main>
      <Footer />
      {!isAdminPath && <WhatsAppButton />}
    </div>
  );
}
