import React, { useState } from "react";
import { Settings, Shield, Bell, Save, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function AdminSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    siteName: "Obech Flow Logistics",
    contactEmail: "info@obechflow.com",
    contactPhone: "+233 24 000 0000",
    enableTracking: true,
    smsAlerts: false,
    autoAssign: true,
  });

  const handleToggle = (field) => {
    setConfig((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Settings Saved",
        description: "Your system preferences have been updated successfully.",
      });
    }, 600);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-black text-navy">System Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure global system variables, alerts and operation rules.
        </p>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side fields */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-steel p-6 space-y-6 shadow-sm">
          <div className="flex items-center gap-2 pb-4 border-b border-steel">
            <Settings size={20} className="text-orange" />
            <h3 className="text-lg font-heading font-bold text-navy">General Settings</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                Corporate Support Email
              </label>
              <input
                type="email"
                value={config.contactEmail}
                onChange={(e) => setConfig({ ...config, contactEmail: e.target.value })}
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
        </div>

        {/* Right Side preferences */}
        <div className="bg-white rounded-2xl border border-steel p-6 space-y-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-steel">
              <Bell size={20} className="text-orange" />
              <h3 className="text-lg font-heading font-bold text-navy">Preferences</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-navy">Live Tracking</div>
                  <div className="text-xs text-muted-foreground">Allows users to see live transit map</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle("enableTracking")}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    config.enableTracking ? "bg-orange" : "bg-steel"
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                      config.enableTracking ? "right-1" : "left-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-navy">SMS Status Updates</div>
                  <div className="text-xs text-muted-foreground">Notify client on dispatch and arrival</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle("smsAlerts")}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    config.smsAlerts ? "bg-orange" : "bg-steel"
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                      config.smsAlerts ? "right-1" : "left-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-navy">Auto-Assign Drivers</div>
                  <div className="text-xs text-muted-foreground">Assign closest riders automatically</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle("autoAssign")}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    config.autoAssign ? "bg-orange" : "bg-steel"
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                      config.autoAssign ? "right-1" : "left-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-orange text-white py-3.5 rounded-lg font-semibold uppercase tracking-wider hover:bg-orange-light flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save size={16} />
            {loading ? "Saving..." : "Save Preferences"}
          </button>
        </div>
      </form>
    </div>
  );
}
