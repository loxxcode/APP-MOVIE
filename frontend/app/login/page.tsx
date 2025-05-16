'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import './page.css';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        formData
      );

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (error) {
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

 return (
  <div className="login-container">
    <div className="login-card">
      {/* Decorative border elements */}
      <div className="decorative-corner top-left"></div>
      <div className="decorative-corner top-right"></div>
      <div className="decorative-corner bottom-left"></div>
      <div className="decorative-corner bottom-right"></div>
      
      <div className="login-header">
        <div className="icon-container">
          <svg className="user-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h1 className="login-title">Welcome Back</h1>
        <p className="login-subtitle">Sign in to your account</p>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label className="form-label" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Enter your email"
            required
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Enter your password"
            required
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`submit-button ${isLoading ? 'loading' : ''}`}
        >
          {isLoading ? (
            <span className="button-loading">
              <svg className="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="spinner-circle" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="spinner-path" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </span>
          ) : 'Sign In'}
        </button>
      </form>

      <div className="login-footer">
        <p className="footer-text">
          Don't have an account?{' '}
          <Link href="/register" className="footer-link">
            Sign up
          </Link>
        </p>
        <Link href="/forgot-password" className="forgot-password">
          Forgot password?
        </Link>
      </div>
    </div>
  </div>
)
}