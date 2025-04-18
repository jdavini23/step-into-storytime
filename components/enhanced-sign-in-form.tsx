'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/auth-context';

interface FormData {
  username: string;
  password: string;
  rememberMe: boolean;
  email: string;
}

interface FormErrors {
  username: string;
  password: string;
  email: string;
  general: string;
}

export default function EnhancedSignInForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
    rememberMe: false,
    email: '',
  });
  const [errors, setErrors] = useState<FormErrors>({
    username: '',
    password: '',
    email: '',
    general: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [activeTab, setActiveTab] = useState<'password' | 'passwordless'>(
    'password'
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when user starts typing
    if (name in errors) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData({
      ...formData,
      rememberMe: checked,
    });
  };

  const validatePasswordForm = () => {
    let isValid = true;
    const newErrors = {
      username: '',
      password: '',
      email: '',
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

  const validatePasswordlessForm = () => {
    let isValid = true;
    const newErrors = {
      username: '',
      password: '',
      email: '',
      general: '',
    };

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Ensure isLoading is reset in all cases
  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validatePasswordForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({ ...errors, general: '' });

    try {
      await login(formData.username, formData.password);
      router.push('/dashboard');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Invalid username or password. Please try again.';
      setErrors({
        ...errors,
        general: errorMessage,
      });
    } finally {
      setIsLoading(false); // Ensure loading state is reset
    }
  };

  const handlePasswordlessSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!validatePasswordlessForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({ ...errors, general: '' });

    try {
      await sendMagicLink(formData.email);
      setMagicLinkSent(true);
      setIsLoading(false);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to send magic link. Please try again.';
      setErrors({
        ...errors,
        general: errorMessage,
      });
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setIsLoading(true);
    try {
      if (provider === 'google') {
        await loginWithGoogle();
      } else {
        await loginWithFacebook();
      }
    } catch (error: unknown) {
      setErrors({
        ...errors,
        general: 'Social login failed. Please try again.',
      });
      setIsLoading(false);
    }
  };

  return (
    <Tabs
      defaultValue="password"
      onValueChange={(value) =>
        setActiveTab(value as 'password' | 'passwordless')
      }
      value={activeTab}
    >
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="passwordless">Passwordless</TabsTrigger>
      </TabsList>

      {/* Error message */}
      {errors.general && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
          {errors.general}
        </div>
      )}

      <TabsContent value="password" key="password-tab">
        <form onSubmit={handlePasswordSubmit} className="space-y-6">
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
                errors.username
                  ? 'border-red-500 focus-visible:ring-red-500'
                  : ''
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
                errors.password
                  ? 'border-red-500 focus-visible:ring-red-500'
                  : ''
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

          {/* Social login options */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSocialLogin('google')}
              disabled={isLoading}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSocialLogin('facebook')}
              disabled={isLoading}
            >
              <svg className="mr-2 h-4 w-4" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M9.19795 21.5H13.198V13.4901H16.8021L17.198 9.50977H13.198V7.5C13.198 6.94772 13.6457 6.5 14.198 6.5H17.198V2.5H14.198C11.4365 2.5 9.19795 4.73858 9.19795 7.5V9.50977H7.19795L6.80206 13.4901H9.19795V21.5Z" />
              </svg>
              Facebook
            </Button>
          </div>
        </form>
      </TabsContent>

      <TabsContent value="passwordless" key="passwordless-tab">
        {magicLinkSent ? (
          <div className="text-center py-6">
            <div className="bg-violet-100 text-violet-800 p-4 rounded-lg mb-4">
              <Mail className="h-12 w-12 mx-auto mb-2" />
              <h3 className="text-lg font-semibold mb-1">Check your email</h3>
              <p>We've sent a magic link to {formData.email}</p>
            </div>
            <p className="text-slate-600 mb-4">
              Click the link in the email to sign in. If you don't see it, check
              your spam folder.
            </p>
            <Button
              variant="outline"
              onClick={() => setMagicLinkSent(false)}
              className="w-full"
            >
              Try a different email
            </Button>
          </div>
        ) : (
          <form onSubmit={handlePasswordlessSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                className={`h-12 ${
                  errors.email
                    ? 'border-red-500 focus-visible:ring-red-500'
                    : ''
                }`}
                placeholder="Enter your email address"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending
                  link...
                </>
              ) : (
                'Send Magic Link'
              )}
            </Button>

            <p className="text-sm text-slate-500 text-center">
              We'll email you a magic link for a password-free sign in.
            </p>
          </form>
        )}
      </TabsContent>
    </Tabs>
  );
}
function sendMagicLink(email: string) {
  throw new Error('Function not implemented.');
}
function loginWithGoogle() {
  throw new Error('Function not implemented.');
}

function loginWithFacebook() {
  throw new Error('Function not implemented.');
}
