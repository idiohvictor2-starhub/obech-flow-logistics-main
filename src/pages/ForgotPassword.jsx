import React from "react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  return (
    <div className="min-h-screen bg-steel flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 text-center">
        <h1 className="text-2xl font-heading font-black text-navy">
          Password Reset Disabled
        </h1>
        <p className="text-muted-foreground mt-3">
          Admin login is currently running locally. Password reset will be added when backend authentication is connected.
        </p>
        <Link
          to="/admin/login"
          className="inline-flex mt-6 px-6 py-3 bg-orange text-white rounded-lg font-semibold"
        >
          Back to Admin Login
        </Link>
      </div>
    </div>
  );
}