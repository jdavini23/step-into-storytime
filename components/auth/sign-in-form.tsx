'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { authenticateUser } from '@/lib/auth';

type FormData = {
  username: string;
  password: string;
  rememberMe: boolean;
};

type FormErrors = {
  username: string;
  password: string;
  general: string;
};

export default function SignInForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState<FormErrors>({
    username: '',
    password: '',
    general: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'username' || name === 'password') {
      setFormData({
        ...formData,
        [name]: value,
      });

      // Clear error when user starts typing
      if (errors[name]) {
        setErrors({
          ...errors,
          [name]: '',
        });
      }
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData({
      ...formData,
      rememberMe: checked,
    });
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      username: '',
      password: '',
      general: '',
    };

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({ ...errors, general: '' });

    try {
      const success = await authenticateUser(
        formData.username,
        formData.password
      );

      if (success) {
        // Redirect to dashboard on successful sign-in
        router.push('/dashboard');
      } else {
        setErrors({
          ...errors,
          general: 'Invalid username or password. Please try again.',
        });
      }
    } catch (error) {
      setErrors({
        ...errors,
        general: 'An error occurred. Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error message */}
      {errors.general && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
          {errors.general}
        </div>
      )}

      {/* Username field */}
      <div className="space-y-2">
        <Label htmlFor="username" className="text-slate-700">
          Username or Email
        </Label>
        <Input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          value={formData.username}
          onChange={handleChange}
          className={`h-12 ${
            errors.username ? 'border-red-500 focus-visible:ring-red-500' : ''
          }`}
          placeholder="Enter your username or email"
          disabled={isLoading}
        />
        {errors.username && (
          <p className="text-red-500 text-sm mt-1">{errors.username}</p>
        )}
      </div>

      {/* Password field */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-slate-700">
            Password
          </Label>
          <Link
            href="/forgot-password"
            className="text-sm text-violet-600 hover:text-violet-700"
          >
            Forgot password?
          </Link>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={formData.password}
          onChange={handleChange}
          className={`h-12 ${
            errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''
          }`}
          placeholder="Enter your password"
          disabled={isLoading}
        />
        {errors.password && (
          <p className="text-red-500 text-sm mt-1">{errors.password}</p>
        )}
      </div>

      {/* Remember me checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="remember-me"
          checked={formData.rememberMe}
          onCheckedChange={handleCheckboxChange}
          disabled={isLoading}
        />
        <Label
          htmlFor="remember-me"
          className="text-sm text-slate-600 font-normal cursor-pointer"
        >
          Remember me for 30 days
        </Label>
      </div>

      {/* Sign in button */}
      <Button
        type="submit"
        className="w-full h-12 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-medium"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...
          </>
        ) : (
          'Sign in'
        )}
      </Button>
    </form>
  );
}
