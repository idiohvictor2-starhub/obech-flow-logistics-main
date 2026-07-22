import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Loader2, KeyRound } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

export default function AdminResetPassword() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Supabase automatically parses recovery token from the URL hash and signs
    // the user in temporarily. Verify they are authenticated before resetting.
    const verifySession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Expired Reset Link",
          description: "Your password recovery link is expired or invalid. Please request a new link.",
          variant: "destructive",
        });
        navigate("/admin/login", { replace: true });
      }
    };
    verifySession();
  }, [navigate, toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords Mismatch",
        description: "The two passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      toast({
        title: "Update Failed",
        description: error.message || "Could not update your password.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully. Please log in with your new password.",
      });
      await supabase.auth.signOut(); // Log out from recovery session
      navigate("/admin/login", { replace: true });
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
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-orange/10 border border-orange/20 flex items-center justify-center mx-auto text-orange mb-4 shadow-lg shadow-orange/10">
              <KeyRound size={28} />
            </div>
            <h1 className="text-2xl lg:text-3xl font-heading font-black text-white tracking-tight">
              Create New Password
            </h1>
            <p className="text-sm text-white/50 mt-2">
              Setup a new secure password for your administrator account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-white/60 mb-2">
                New Admin Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-3.5 text-white/30" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-navy/40 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-white/60 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-3.5 text-white/30" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? "Updating Account Password..." : "Save New Password"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
