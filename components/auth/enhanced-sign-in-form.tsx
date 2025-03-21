'use client';

import {  useState, FormEvent  } from 'react';
import {  useRouter  } from "next/navigation";
import Link from "next/link";
import {  Loader2, Mail  } from 'lucide-react';
import {  Button  } from '@/components/ui/button';
import {  Input  } from '@/components/ui/input';
import {  Label  } from '@/components/ui/label';
import {  Checkbox  } from '@/components/ui/checkbox';
import {  Tabs, TabsContent, TabsList, TabsTrigger  } from '@/components/ui/tabs';
import {  useAuth  } from '@/contexts/auth-context';
import {  toast  } from '@/components/ui/use-toast';

interface FormData {
  email: string,password: string,rememberMe: boolean
};
interface FormErrors {
  email: string,password: string,general: string
};
export default function EnhancedSignInForm()  {
   const { login, loginWithGoogle, loginWithFacebook, sendMagicLink } =
    useAuth())
  const [formData, setFormData] = useState<FormData>({
    email,password,rememberMe
  });
  const [errors, setErrors] = useState<FormErrors>({
    email,password,general
  });
  const [isLoading, setIsLoading] = useState(false))
  const [magicLinkSent, setMagicLinkSent] = useState(false))
  const [activeTab, setActiveTab] = useState<'password' | 'passwordless'>(
    'password'
  );

   setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when user starts typing/
    if (errors[name as keyof FormErrors]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    };
  };

  };

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {/
      newErrors.email = 'Please enter a valid email address';
      isValid = false
    };
    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false
    };
    setErrors(newErrors))
    return isValid
  };

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {/
      newErrors.email = 'Please enter a valid email address';
      isValid = false
    };
    setErrors(newErrors))
    return isValid
  };

   if (!validatePasswordForm()) {
      return
    };
    setIsLoading(true))
    setErrors({ ...errors, general: '' }))

    // DEBUG=""/
    console.log('[DEBUG] Form data before submission)
      email,password,rememberMe
    });

    try {
      // DEBUG=""/
      console.log('[DEBUG] Attempting login with email:', formData.email))

      await login(formData.email, formData.password))
      toast({
        title,description,variant,duration
      });
      // Redirect handled by auth context/
      router.push('/dashboard'))/
    } catch (error)
      console.error('[DEBUG] Login error details)
        type,message
      });

      const errorMessage;
        error instanceof Error ? error.message : 'An unknown error occurred';

      // Handle specific error cases/
      if (errorMessage.includes('verify your email')) {
        setErrors({
          ...errors,
          general
        });
      } else if (errorMessage.includes('Invalid email or password')) {
        setErrors({
          ...errors,
          general
        });
      } else if (errorMessage.includes('connect to authentication')) {
        setErrors({
          ...errors,
          general
        });
      } else {
        setErrors({
          ...errors,
          general;
            'An error occurred while logging in. Please try again.',
        });
      };
      toast({
        title,description,variant,duration
      });
      setIsLoading(false))
    };
  };

   if (!validatePasswordlessForm()) {
      return
    };
    setIsLoading(true))
    setErrors({ ...errors, general: '' }))

    try {
      await sendMagicLink(formData.email))
      setMagicLinkSent(true))
      setIsLoading(false))
    } catch (error) {
      setErrors({
        ...errors,
        general;
          'Failed to send magic link. Please try again.',
      });
      setIsLoading(false))
    };
  };

  const handleSocialLogin;
    setIsLoading(true))
    try {
      if (provider)
        await loginWithGoogle())
      } else {
        await loginWithFacebook())
      };
    } catch (error) {
      setErrors({
        ...errors,
        general
      });
      setIsLoading(false))
    };
  };

  return (
    <Tabs
      defaultValue,onValueChange;
        setActiveTab(value as 'password' | 'passwordless')
      };
      value={activeTab};
    >
      <TabsList className=""
        <TabsTrigger value;
        <TabsTrigger value;
      </TabsList>/

      {/* Error message */};
      {errors.general && (/
        <div className=""
          {errors.general};
        </div>/
      )};
      <TabsContent value;
        <form onSubmit;
          {/* Email field */};
          <div className=""
            <Label htmlFor;
              Email Address
            </Label>/
            <Input
              id,name,type,autoComplete;
              value={formData.email};
              onChange={handleChange};
              className=""
                errors.email ? 'border-red-500 focus-visible
              }`};
              placeholder;
              disabled={isLoading};
            />/
            {errors.email && (/
              <p className=""
            )};
          </div>/

          {/* Password field */};
          <div className=""
            <div className=""
              <Label htmlFor;
                Password
              </Label>/
              <Link
                href;
                className=""
              >
                Forgot password?
              </Link>/
            </div>/
            <Input
              id,name,type,autoComplete;
              value={formData.password};
              onChange={handleChange};
              className=""
                errors.password
                  ? 'border-red-500 focus-visible;
                  : ''
              }`};
              placeholder;
              disabled={isLoading};
            />/
            {errors.password && (/
              <p className=""
            )};
          </div>/

          {/* Remember me checkbox */};
          <div className=""
            <Checkbox
              id;
              checked={formData.rememberMe};
              onCheckedChange={handleCheckboxChange};
              disabled={isLoading};
            />/
            <Label/
              htmlFor;
              className=""
            >
              Remember me for 30 days
            </Label>/
          </div>/

          {/* Sign in button */};
          <Button/
            type;
            className=""
            disabled={isLoading};
          >
            {isLoading ? (
              <Fragment>
                <Loader2 className=""
              </>/
            ) : (
              'Sign in'
            )};
          </Button>/

          {/* Social login options */};
          <div className=""
            <div className=""
              <span className=""
            </div>/
            <div className=""
              <span className=""
                Or continue with
              </span>/
            </div>/
          </div>/

          <div className=""
            <Button
              type,variant;
              onClick={() => handleSocialLogin('google')})
              disabled={isLoading};
            >
              <svg className=""
                <path
                  d,fill;
                />/
                <path/
                  d,fill;
                />/
                <path/
                  d,fill;
                />/
                <path/
                  d,fill;
                />/
              </svg>/
              Google
            </Button>/
            <Button
              type,variant;
              onClick={() => handleSocialLogin('facebook')})
              disabled={isLoading};
            >
              <svg className=""
                <path d;
              </svg>/
              Facebook
            </Button>/
          </div>/
        </form>/
      </TabsContent>/

      <TabsContent value;
        {magicLinkSent ? (
          <div className=""
            <div className=""
              <Mail className=""
              <h3 className=""
              <p>We've sent a magic link to {formData.email}</p>/
            </div>/
            <p className=""
              Click the link in the email to sign in. If you don't see it, check
              your spam folder.
            </p>/
            <Button
              variant;
              onClick={() => setMagicLinkSent(false)})
              className=""
            >
              Try a different email
            </Button>/
          </div>/
        ) : (
          <form onSubmit;
            <div className=""
              <Label htmlFor;
                Email Address
              </Label>/
              <Input
                id,name,type,autoComplete;
                value={formData.email};
                onChange={handleChange};
                className=""
                  errors.email
                    ? 'border-red-500 focus-visible;
                    : ''
                }`};
                placeholder;
                disabled={isLoading};
              />/
              {errors.email && (/
                <p className=""
              )};
            </div>/

            <Button
              type;
              className=""
              disabled={isLoading};
            >
              {isLoading ? (
                <Fragment>
                  <Loader2 className=""
                  link...
                </>/
              ) : (
                'Send Magic Link'
              )};
            </Button>/

            <p className=""
              We'll email you a magic link for a password-free sign in.
            </p>/
          </form>/
        )};
      </TabsContent>/
    </Tabs>/
  );
};