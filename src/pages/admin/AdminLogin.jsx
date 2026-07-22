import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, Loader2, KeyRound, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/admin", { replace: true });
      }
    };
    checkAuth();
  }, [navigate]);

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      toast({
        title: "Missing Fields",
        description: "Please fill in both the admin email and password.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Invalid Credentials",
        description: error.message || "Please verify your admin login email and password.",
        variant: "destructive",
      });
    } else if (data.session) {
      toast({
        title: "Access Granted",
        description: "Welcome back to the Obech Logistic Admin Portal.",
      });
      navigate("/admin", { replace: true });
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (!forgotEmail) {
      toast({
        title: "Email Required",
        description: "Please enter your admin email address.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Reset Request Failed",
        description: error.message || "Could not send reset password email.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Recovery Email Sent",
        description: "Please check your inbox (and spam folder) for the password recovery link.",
      });
      setIsForgot(false);
      setForgotEmail("");
    }
  };

  return (
    <div className="min-h-screen bg-navy-dark flex items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-navy-light rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="backdrop-blur-xl bg-navy-light/40 border border-white/10 rounded-2xl p-8 shadow-2xl relative">
          
          {!isForgot ? (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-orange/10 border border-orange/20 flex items-center justify-center mx-auto text-orange mb-4 shadow-lg shadow-orange/10">
                  <KeyRound size={28} />
                </div>
                <h1 className="text-2xl lg:text-3xl font-heading font-black text-white tracking-tight">
                  Obech Logistic Admin
                </h1>
                <p className="text-sm text-white/50 mt-2">
                  Secure portal for booking, tracking and dispatch control
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-white/60 mb-2">
                    Admin Email Address
                  </label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-3.5 text-white/30" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={set("email")}
                      placeholder="admin@obechflow.com"
                      className="w-full bg-navy/40 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange transition-all font-mono"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-semibold uppercase tracking-widest text-white/60">
                      Security Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsForgot(true)}
                      className="text-xs font-semibold text-orange hover:underline focus:outline-none"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-3.5 text-white/30" />
                    <input
                      type="password"
                      value={form.password}
                      onChange={set("password")}
                      placeholder="••••••••"
                      className="w-full bg-navy/40 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange transition-all font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-orange text-white py-4 rounded-xl font-bold uppercase tracking-wider hover:bg-orange-light active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-orange/20"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                  {loading ? "Verifying Credentials..." : "Authenticate"}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-orange/10 border border-orange/20 flex items-center justify-center mx-auto text-orange mb-4 shadow-lg shadow-orange/10">
                  <KeyRound size={28} />
                </div>
                <h1 className="text-2xl lg:text-3xl font-heading font-black text-white tracking-tight">
                  Recover Admin Password
                </h1>
                <p className="text-sm text-white/50 mt-2">
                  Enter your registered email below to receive a password reset link.
                </p>
              </div>

              <form onSubmit={handleForgotPassword} className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-white/60 mb-2">
                    Registered Email Address
                  </label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-3.5 text-white/30" />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="admin@obechflow.com"
                      className="w-full bg-navy/40 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange transition-all font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-orange text-white py-4 rounded-xl font-bold uppercase tracking-wider hover:bg-orange-light active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-orange/20"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                  {loading ? "Sending Recovery Link..." : "Send Reset Link"}
                </button>

                <button
                  type="button"
                  onClick={() => setIsForgot(false)}
                  className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-white/60 hover:text-white transition-all pt-2"
                >
                  <ArrowLeft size={14} /> Back to Sign In
                </button>
              </form>
            </>
          )}

        </div>
      </motion.div>
    </div>
  );
}