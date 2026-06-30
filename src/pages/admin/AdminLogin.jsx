import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      if (
        form.email === "admin@obechflow.com" &&
        form.password === "admin123"
      ) {
        localStorage.setItem("obech_admin_auth", "true");
        navigate("/admin");
      } else {
        toast({
          title: "Invalid admin login details.",
          variant: "destructive",
        });
      }

      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-2xl p-8 shadow-xl"
      >
        <h1 className="text-2xl font-heading font-black text-navy">
          Obech Flow Admin
        </h1>

        <p className="text-sm text-muted-foreground mt-2">
          Sign in to manage bookings, tracking, drivers and deliveries.
        </p>

        <div className="mt-8 space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Email
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-3.5 text-muted-foreground" />
              <input
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="admin@obechflow.com"
                className="w-full border border-steel rounded-lg pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Password
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-3.5 text-muted-foreground" />
              <input
                type="password"
                value={form.password}
                onChange={set("password")}
                placeholder="admin123"
                className="w-full border border-steel rounded-lg pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-8 flex items-center justify-center gap-2 bg-orange text-white py-4 rounded-lg font-semibold uppercase tracking-wider hover:bg-orange-light disabled:opacity-50"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : null}
          {loading ? "Signing In..." : "Login"}
        </button>

        <p className="text-xs text-muted-foreground mt-5">
          Demo login: admin@obechflow.com / admin123
        </p>
      </form>
    </div>
  );
}