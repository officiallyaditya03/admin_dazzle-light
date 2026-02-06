import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  Lightbulb,
  ChevronRight,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Inquiries", href: "/admin/inquiries", icon: MessageSquare },
  { name: "Approvals", href: "/admin/approvals", icon: UserCheck },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const fetchPendingCount = async () => {
      const { count } = await supabase
        .from("admin_requests")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");
      setPendingCount(count || 0);
    };

    fetchPendingCount();

    const channel = supabase
      .channel("admin_requests_count")
      .on("postgres_changes", { event: "*", schema: "public", table: "admin_requests" }, () =>
        fetchPendingCount()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border transform transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b border-border">
            <Link to="/admin" className="flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-primary" />
              <span className="font-bold text-lg">
                Dazzle <span className="text-primary">Admin</span>
              </span>
            </Link>
            <button
              className="lg:hidden text-muted-foreground hover:text-foreground"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              const showBadge = item.name === "Approvals" && pendingCount > 0;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                  {showBadge && (
                    <Badge className="ml-auto bg-amber-500 text-white text-xs h-5 min-w-5 flex items-center justify-center">
                      {pendingCount}
                    </Badge>
                  )}
                  {isActive && !showBadge && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary font-semibold">{user?.email?.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.email}</p>
                <p className="text-xs text-muted-foreground">Administrator</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      <div className="lg:ml-64">
        <header className="sticky top-0 z-30 flex items-center h-16 px-4 bg-card border-b border-border">
          <button className="lg:hidden p-2 text-muted-foreground hover:text-foreground" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="ml-auto flex items-center gap-4">
            <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              View Website →
            </Link>
          </div>
        </header>

        <main className="p-4 md:p-6 lg:p-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}



