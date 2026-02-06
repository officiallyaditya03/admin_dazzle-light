import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Lightbulb, Mail, Lock, Eye, EyeOff, ArrowLeft, User, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function AdminRegister() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim() || !fullName.trim()) {
      toast({ variant: "destructive", title: "Please fill in all fields" });
      return;
    }

    if (password !== confirmPassword) {
      toast({ variant: "destructive", title: "Passwords do not match" });
      return;
    }

    if (password.length < 6) {
      toast({ variant: "destructive", title: "Password must be at least 6 characters" });
      return;
    }

    setIsLoading(true);

    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: window.location.origin,
        },
      });

      if (signUpError) {
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: signUpError.message,
        });
        return;
      }

      if (signUpData.user) {
        const { error: requestError } = await supabase.from("admin_requests").insert({
          user_id: signUpData.user.id,
          full_name: fullName,
          email,
          status: "pending",
        });

        if (requestError) {
          // eslint-disable-next-line no-console
          console.error("Error creating admin request:", requestError);
          toast({
            variant: "destructive",
            title: "Registration failed",
            description: "Could not submit admin request. Please try again.",
          });
          return;
        }
      }

      toast({
        title: "Request Submitted!",
        description: "Your admin access request is pending approval. You'll be notified once approved.",
      });

      await supabase.auth.signOut();
      navigate("/admin/login");
    } catch {
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: "Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Lightbulb className="w-10 h-10 text-primary" />
              <span className="text-2xl font-bold">
                Dazzle <span className="text-primary">Admin</span>
              </span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Request Admin Access</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Submit a request for admin access. An existing admin will review and approve your request.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="admin@dazzle.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Submitting request...
                </span>
              ) : (
                <>
                  <Clock className="w-4 h-4 mr-2" />
                  Request Admin Access
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <p className="text-sm text-amber-700 dark:text-amber-300">
              <strong>Note:</strong> After submitting, an existing admin will review your request. You'll receive access
              once approved.
            </p>
          </div>

          <div className="mt-6 space-y-3 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/admin/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to website
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}



