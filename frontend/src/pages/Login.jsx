import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api/client';
import { Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/client/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (type) => {
    if (type === 'admin') {
      navigate('/admin/login');
    } else {
      setEmail('saabohari@gmail.com');
      // They can now enter the password for this user
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy text-white p-6">
      <div className="p-8 bg-[#24355A] rounded-xl border border-teal shadow-2xl w-full max-w-md backdrop-blur-sm">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-teal mb-1 tracking-tight">Buyers Match</h1>
          <p className="text-gold font-medium uppercase tracking-widest text-sm">Portal Login</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Email Address</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-teal transition-colors">
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-navy border border-white/10 rounded-lg py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-teal/50 focus:border-teal transition-all placeholder:text-gray-600"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-teal transition-colors">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-navy border border-white/10 rounded-lg py-3 pl-11 pr-12 focus:outline-none focus:ring-2 focus:ring-teal/50 focus:border-teal transition-all placeholder:text-gray-600"
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

          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal hover:bg-teal/90 text-navy font-bold py-3 rounded-lg transition-all shadow-lg shadow-teal/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                'Login'
              )}
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleDemoLogin('client')}
                className="w-full bg-navy border border-teal text-teal hover:bg-teal hover:text-navy font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-xs"
              >
                Demo Client
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleDemoLogin('admin')}
                className="w-full bg-navy border border-gold text-gold hover:bg-gold hover:text-navy font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-xs"
              >
                Demo Admin
              </button>
            </div>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center space-y-2">
          <Link to="/admin/login" className="text-xs text-gray-500 hover:text-gold transition-colors">
            Admin? Login here →
          </Link>
          <p className="text-xs text-gray-600">Secure Access • Powered by Buyers Match</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
