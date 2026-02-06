import { useState } from "react";
import { User, Key, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export default function AdminSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({ variant: "destructive", title: "Passwords do not match" });
      return;
    }

    if (newPassword.length < 6) {
      toast({ variant: "destructive", title: "Password must be at least 6 characters" });
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      toast({ title: "Password updated successfully" });
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to update password",
        description: error.message,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your admin account settings</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Profile</CardTitle>
                <CardDescription>Your account information</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Email</label>
              <Input value={user?.email || ""} disabled className="mt-1" />
              <p className="text-xs text-muted-foreground mt-1">Email cannot be changed from here</p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Account ID</label>
              <Input value={user?.id || ""} disabled className="mt-1 font-mono text-xs" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Key className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <CardTitle className="text-lg">Change Password</CardTitle>
                <CardDescription>Update your admin password</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">New Password</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Confirm New Password</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="mt-1"
                  required
                />
              </div>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Shield className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <CardTitle className="text-lg">Security</CardTitle>
                <CardDescription>Account security information</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Role</span>
                <span className="text-sm font-medium text-foreground">Administrator</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Last Sign In</span>
                <span className="text-sm font-medium text-foreground">
                  {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : "Unknown"}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Account Created</span>
                <span className="text-sm font-medium text-foreground">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "Unknown"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}



