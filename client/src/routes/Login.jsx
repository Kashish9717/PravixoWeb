import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useAuth } from "@/components/auth/AuthProvider";

export default function Login() {
  const navigate = useNavigate();
  const { user, profile, login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Login — Pravixo";
  }, []);

  useEffect(() => {
    if (user || profile) {
      const role = profile?.role || user?.role;

      navigate(
        role === "creator"
          ? "/dashboard/influencer"
          : "/dashboard/customer",
        { replace: true }
      );
    }
  }, [user, profile, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter email and password.");
      return;
    }

    setLoading(true);

    try {
      const data = await login(email, password);

      toast.success("Login successful!");

      const role =
        data?.profile?.role ||
        data?.user?.role ||
        data?.data?.profile?.role ||
        data?.data?.user?.role;

      navigate(
        role === "creator"
          ? "/dashboard/influencer"
          : "/dashboard/customer",
        { replace: true }
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative grid min-h-[calc(100vh-64px)] place-items-center px-4 py-12">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-20 right-1/4 h-80 w-80 rounded-full gradient-warm opacity-20 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full gradient-pink opacity-20 blur-3xl" />
      </div>

      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-elevated">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl gradient-sunset shadow-glow">
            <Sparkles className="h-6 w-6 text-white" />
          </div>

          <h1 className="font-display text-2xl font-bold">
            Welcome back
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to your Pravixo account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <Label htmlFor="email">Email</Label>

            <div className="relative mt-1.5">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="pl-10"
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>

              <Link
                to="/reset-password"
                className="text-xs text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <div className="relative mt-1.5">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="pl-10 pr-10"
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-full gradient-sunset border-0 text-white shadow-glow"
          >
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-primary hover:underline"
          >
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}