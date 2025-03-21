import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Eye, EyeOff, Loader } from 'lucide-react';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const validateUsername = () => {
    if (!username.trim()) {
      toast.error("Username is required");
    }
  };

  const validatePassword = () => {
    if (!password) {
      toast.error("Password is required");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast.error("Username is required");
      return;
    }
    if (!password) {
      toast.error("Password is required");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.login(username, password);

      if (response.errors) {
        if (response.errors.username) {
          toast.error(response.errors.username);
        }
        if (response.errors.password) {
          toast.error(response.errors.password);
        }
      } else if (response.message === 'Login successful!') {
        sessionStorage.setItem('userId', response.user_id);
        sessionStorage.setItem('authToken', response.api_key);  // Saving auth token in session storage
        login(response.username, response.api_key, 'password');
        navigate('/AI section');
      } else {
        toast.error(response.message);
      }
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        toast.error("Invalid username or password");
      } else {
        toast.error("Login failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-14 shadow-sm">
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-12 w-12 text-gray-800"
            >
              <path d="M15 5.5A2.5 2.5 0 0 0 12.5 3h-1.76a2.74 2.74 0 0 0-2.74 2.74v1.68a2.74 2.74 0 0 0 2.74 2.74h1.76A2.5 2.5 0 0 0 15 7.66" />
              <path d="M14 9.5a2.5 2.5 0 0 0-2.5 2.5v.76a2.74 2.74 0 0 1-2.74 2.74h-1.68A2.74 2.74 0 0 1 4.34 12.76v-1.76A2.5 2.5 0 0 1 6.84 8.5" />
              <path d="m7 15 4.5 4.5" />
              <path d="M19.5 4.5 15 9" />
              <path d="m15 4.5 3.5 3.5" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Welcome</h1>
          <p className="mt-2 text-center text-gray-600">Log in to Code Sense AI</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="username" className="text-sm font-medium text-gray-700">
              Username<span className="text-purple-600">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="username"
                type="text"
                placeholder="Your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onBlur={validateUsername}
                className="w-full pl-10 rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                required
              />
            </div>
          </div>
          <div className="space-y-1">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password<span className="text-purple-600">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={validatePassword}
                className="w-full pl-10 rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <div className="text-right">
            <Link to="/forgot-password" className="text-sm font-medium text-purple-600 hover:text-purple-500">
              Forgot password?
            </Link>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-purple-600 py-2.5 text-center text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Loader size={20} className="animate-spin mr-2" />
                Logging in...
              </div>
            ) : (
              'Continue'
            )}
          </button>
          <div className="mt-4 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-purple-600 hover:text-purple-500">
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
