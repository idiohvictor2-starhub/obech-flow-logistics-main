import React, { useState } from "react";
import { Settings, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function AdminSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    siteName: "Obech Flow Logistics",
    contactPhone: "+233 24 000 0000",
  });

  const handleSave = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Settings Saved",
        description: "Your system settings have been updated successfully.",
      });
    }, 600);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-black text-navy">System Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure global system variables and contact details.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-steel p-6 space-y-6 shadow-sm">
        <div className="flex items-center gap-2 pb-4 border-b border-steel">
          <Settings size={20} className="text-orange" />
          <h3 className="text-lg font-heading font-bold text-navy">General Settings</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Business Display Name
            </label>
            <input
              type="text"
              value={config.siteName}
              onChange={(e) => setConfig({ ...config, siteName: e.target.value })}
              className="w-full border border-steel rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange text-navy"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Support Phone Number
            </label>
            <input
              type="text"
              value={config.contactPhone}
              onChange={(e) => setConfig({ ...config, contactPhone: e.target.value })}
              className="w-full border border-steel rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange text-navy"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-steel">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-orange text-white rounded-lg font-semibold uppercase tracking-wider hover:bg-orange-light flex items-center gap-2 disabled:opacity-50 transition-all text-xs"
          >
            <Save size={16} />
            {loading ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
