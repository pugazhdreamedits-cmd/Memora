import React from "react";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center p-6 text-center">
      <div className="font-mono text-8xl font-black gradient-text mb-4">404</div>
      <h1 className="text-2xl font-bold text-text-primary mb-2">Page not found</h1>
      <p className="text-text-secondary mb-8">This memory has been forgotten.</p>
      <Link to="/" className="btn-primary flex items-center gap-2">
        <Home className="w-4 h-4" /> Return Home
      </Link>
    </div>
  );
}
