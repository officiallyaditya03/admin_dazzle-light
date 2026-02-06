import { Navigate, Route, Routes } from "react-router-dom";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminLogin from "@/pages/admin/Login";
import AdminRegister from "@/pages/admin/Register";
import AdminProducts from "@/pages/admin/Products";
import AdminInquiries from "@/pages/admin/Inquiries";
import AdminApprovals from "@/pages/admin/AdminApprovals";
import AdminSettings from "@/pages/admin/Settings";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin" replace />} />

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/register" element={<AdminRegister />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/products"
        element={
          <ProtectedRoute requireAdmin>
            <AdminProducts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/inquiries"
        element={
          <ProtectedRoute requireAdmin>
            <AdminInquiries />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/approvals"
        element={
          <ProtectedRoute requireAdmin>
            <AdminApprovals />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute requireAdmin>
            <AdminSettings />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}



