'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/auth-context';
import { toast } from '@/components/ui/use-toast';

interface FormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface FormErrors {
  email: string;
  password: string;
  general: string;
}

export default function EnhancedSignInForm() {
  const router = useRouter();
  const { login, loginWithGoogle, loginWithFacebook, sendMagicLink } =
    useAuth();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState<FormErrors>({
    email: '',
    password: '',
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
    if (errors[name as keyof FormErrors]) {
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
      email: '',
      password: '',
      general: '',
    };

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
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
      email: '',
      password: '',
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

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validatePasswordForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({ ...errors, general: '' });

    try {
      // Add delay to ensure state updates are processed
      await new Promise((resolve) => setTimeout(resolve, 100));

      console.log('[DEBUG] Form data before submission:', {
        email: formData.email,
        password: formData.password ? '********' : 'not set',
        rememberMe: formData.rememberMe,
      });

      console.log('[DEBUG] Attempting login with email:', formData.email);

      await login(formData.email, formData.password);

      // Show success toast
      toast({
        title: 'Success!',
        description: 'Logging you in...',
        variant: 'default',
        duration: 3000,
      });

      // Add delay before completing to ensure state updates are processed
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error: unknown) {
      console.error('[DEBUG] Login error details:', {
        type: error instanceof Error ? 'Error' : typeof error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred';

      // Handle specific error cases
      if (errorMessage.includes('verify your email')) {
        setErrors({
          ...errors,
          general:
            'Please check your email and verify your account before logging in.',
        });
      } else if (errorMessage.includes('Invalid email or password')) {
        setErrors({
          ...errors,
          general: 'Invalid email or password. Please try again.',
        });
      } else if (errorMessage.includes('connect to authentication')) {
        setErrors({
          ...errors,
          general:
            'Connection error. Please check your internet and try again.',
        });
      } else {
        setErrors({
          ...errors,
          general:
            errorMessage ||
            'An error occurred while logging in. Please try again.',
        });
      }

      toast({
        title: 'Error',
        description: errorMessage || 'Failed to log in. Please try again.',
        variant: 'destructive',
        duration: 5000,
      });

      // Add delay to ensure error state updates are processed
      await new Promise((resolve) => setTimeout(resolve, 100));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordlessSubmit = async (e: FormEvent) => {
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
    } catch (error) {
      setErrors({
        ...errors,
        general:
          (error as Error).message ||
          'Failed to send magic link. Please try again.',
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
    } catch (error) {
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
          {/* Email field */}
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
                errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''
              }`}
              placeholder="Enter your email address"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
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
