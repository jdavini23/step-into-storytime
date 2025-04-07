'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { BookOpen, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/auth-context';
import { toast } from '@/components/ui/use-toast';

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
}

interface FormErrors {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeTerms: string;
  general: string;
}

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signup } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });
  const [errors, setErrors] = useState<FormErrors>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: '',
    general: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  // Check if there's a plan parameter in the URL
  const plan = searchParams.get('plan');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      agreeTerms: checked,
    }));

    if (errors.agreeTerms) {
      setErrors((prev) => ({
        ...prev,
        agreeTerms: '',
      }));
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeTerms: '',
      general: '',
    };

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

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
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
      isValid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms =
        'You must agree to the Terms of Service and Privacy Policy';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({ ...errors, general: '' });

    try {
      // Add a loading toast
      const loadingToast = toast({
        title: 'Creating your account...',
        description: 'Please wait while we set up your account.',
        duration: 10000, // 10 seconds
      });

      await signup(formData.email, formData.password, formData.name);

      // Clear the loading toast
      loadingToast.dismiss();

      // Show success toast
      toast({
        title: 'Account created!',
        description: 'Welcome to Step Into Storytime!',
        duration: 5000,
      });

      // If there was a plan parameter, redirect to subscription page
      if (plan) {
        router.push(`/subscription?plan=${plan}`);
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      let errorMessage = 'An error occurred while creating your account.';

      if (error instanceof Error) {
        if (
          error.message.includes('Failed to fetch') ||
          error.message.includes('network')
        ) {
          errorMessage =
            'Unable to connect to our servers. Please check your internet connection and try again.';
        } else if (error.message.includes('already exists')) {
          errorMessage =
            'An account with this email already exists. Please try signing in instead.';
        } else {
          errorMessage = error.message;
        }
      }

      setErrors({
        ...errors,
        general: errorMessage,
      });

      // Show error toast
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
        duration: 5000,
      });

      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-violet-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and branding */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center mb-4"
          >
            <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 flex items-center justify-center mr-3 shadow-md">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900">
              Step Into Storytime
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Create an account
          </h1>
          <p className="text-slate-600">
            Start your storytelling journey today
          </p>

          {plan && (
            <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-violet-100 text-violet-800 text-sm font-medium">
              Selected plan:{' '}
              {plan === 'free'
                ? 'Free'
                : plan === 'unlimited'
                ? 'Unlimited Adventures'
                : 'Family Plan'}
            </div>
          )}
        </div>

        {/* Sign-up form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          {errors.general && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm mb-6">
              {errors.general}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-700">
                Full name
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                className={`h-12 ${
                  errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''
                }`}
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700">
                Email address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className={`h-12 ${
                  errors.email
                    ? 'border-red-500 focus-visible:ring-red-500'
                    : ''
                }`}
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                className={`h-12 ${
                  errors.password
                    ? 'border-red-500 focus-visible:ring-red-500'
                    : ''
                }`}
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
              {errors.password ? (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              ) : (
                <p className="text-xs text-slate-500">
                  Must be at least 8 characters long
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-700">
                Confirm password
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                className={`h-12 ${
                  errors.confirmPassword
                    ? 'border-red-500 focus-visible:ring-red-500'
                    : ''
                }`}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                className={`mt-1 ${errors.agreeTerms ? 'border-red-500' : ''}`}
                checked={formData.agreeTerms}
                onCheckedChange={handleCheckboxChange}
                disabled={isLoading}
              />
              <Label
                htmlFor="terms"
                className="text-sm text-slate-600 font-normal cursor-pointer"
              >
                I agree to the{' '}
                <Link
                  href="/terms"
                  className="text-violet-600 hover:text-violet-700"
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  href="/privacy"
                  className="text-violet-600 hover:text-violet-700"
                >
                  Privacy Policy
                </Link>
              </Label>
            </div>
            {errors.agreeTerms && (
              <p className="text-red-500 text-sm mt-1">{errors.agreeTerms}</p>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating
                  account...
                </>
              ) : (
                'Create account'
              )}
            </Button>
          </form>
        </div>

        {/* Sign in link */}
        <div className="text-center">
          <p className="text-slate-600">
            Already have an account?{' '}
            <Link
              href="/sign-in"
              className="text-violet-600 hover:text-violet-700 font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
