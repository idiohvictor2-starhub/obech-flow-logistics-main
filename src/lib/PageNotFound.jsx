import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, SearchX } from "lucide-react";

export default function PageNotFound() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-steel flex items-center justify-center px-4">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-lg border border-steel p-10 text-center">
        <div className="w-20 h-20 rounded-full bg-orange/10 flex items-center justify-center mx-auto">
          <SearchX className="text-orange" size={40} />
        </div>

        <h1 className="text-6xl font-heading font-black text-navy mt-6">
          404
        </h1>

        <h2 className="text-2xl font-heading font-bold text-navy mt-3">
          Page Not Found
        </h2>

        <p className="text-muted-foreground mt-4 leading-relaxed">
          The page
          <span className="font-semibold text-navy">
            {" "}
            {location.pathname}
          </span>{" "}
          does not exist or may have been moved.
        </p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-orange text-white rounded-lg font-semibold hover:bg-orange-light transition-colors"
        >
          <Home size={18} />
          Back to Home
        </Link>
      </div>
    </div>
  );
}