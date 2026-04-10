import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/client";
import { Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { isDemoMode, BRAND } from "../config/brand";

const DEMO_CREDENTIALS = [
  {
    label: "Client View",
    email: "demo.client1@propertypulse.com.au",
    password: "Demo@1234",
  },
  {
    label: "Client View 2",
    email: "demo.client2@propertypulse.com.au",
    password: "Demo@1234",
  },
  {
    label: "Admin View",
    email: "demo.admin@propertypulse.com.au",
    password: "Demo@1234",
  },
];

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (cred) => {
    setEmail(cred.email);
    setPassword(cred.password);
    setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy text-white p-6">
      <div className="w-full max-w-md space-y-4">
        <div className="p-8 bg-[#24355A] rounded-xl border border-teal shadow-2xl backdrop-blur-sm" style={{ borderColor: BRAND.primary + '4D' }}>
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-1 tracking-tight" style={{ color: BRAND.primary }}>
              {BRAND.name}
            </h1>
            <p className="font-medium uppercase tracking-widest text-sm" style={{ color: BRAND.accent }}>
              {BRAND.tagline}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 transition-colors" style={{}}>
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-navy border border-white/10 rounded-lg py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:border-teal transition-all placeholder:text-gray-600"
                  style={{ '--tw-ring-color': BRAND.primary + '80' }}
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-navy border border-white/10 rounded-lg py-3 pl-11 pr-12 focus:outline-none focus:ring-2 focus:border-teal transition-all placeholder:text-gray-600"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-teal transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full font-bold py-3 rounded-lg transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              style={{
                background: BRAND.primary,
                color: BRAND.dark,
                boxShadow: `0 4px 20px ${BRAND.primary}33`,
              }}
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Login"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-xs text-gray-500">
              Secure Access • Powered by {BRAND.name}
            </p>
          </div>
        </div>

        {isDemoMode && (
          <div className="p-5 bg-[#24355A]/80 rounded-xl border backdrop-blur-sm" style={{ borderColor: BRAND.accent + '4D' }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: BRAND.accent }}>
              Demo Credentials
            </p>
            <div className="space-y-2">
              {DEMO_CREDENTIALS.map((cred) => (
                <button
                  key={cred.email}
                  type="button"
                  onClick={() => fillCredentials(cred)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all text-left group"
                  style={{ cursor: 'pointer' }}
                >
                  <div>
                    <p className="text-xs font-bold text-white group-hover:text-white/90">
                      {cred.label}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5 font-mono">
                      {cred.email}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md" style={{ color: BRAND.primary, background: BRAND.primary + '1A' }}>
                    Use
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
