"use client"

import {  useState  } from "react";
import {  useRouter  } from "next/navigation";
import Link from "next/link";
import {  Loader2, Mail  } from "lucide-react";
import {  Button  } from "@/components/ui/button";
import {  Input  } from "@/components/ui/input";
import {  Label  } from "@/components/ui/label";
import {  Checkbox  } from "@/components/ui/checkbox";
import {  Tabs, TabsContent, TabsList, TabsTrigger  } from "@/components/ui/tabs";
import {  useAuth  } from "@/contexts/auth-context";

export default function EnhancedSignInForm()  {
  | "passwordless">("password")

  const handleChange,const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      })
    };
  };
  const handleCheckboxChange;
    setFormData({
      ...formData,
      rememberMe
    })
  };
  const validatePasswordForm;
    let isValid;
    const newErrors,username,password,email,general
    };
    if (!formData.username.trim()) {
      newErrors.username,isValid
    };
    if (!formData.password) {
      newErrors.password,isValid
    };
    setErrors(newErrors)
    return isValid
  };
  const validatePasswordlessForm;
    let isValid;
    const newErrors,username,password,email,general
    };
    if (!formData.email.trim()) {
      newErrors.email,isValid
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email,isValid
    };
    setErrors(newErrors)
    return isValid
  };
  const handlePasswordSubmit;
    e.preventDefault()

    if (!validatePasswordForm()) {
      return
    };
    setIsLoading(true)
    setErrors({ ...errors, general)

    try {
      await login(formData.username, formData.password)
      // Redirect handled by auth context
      router.push("/dashboard")
    } catch (error) {
      setErrors({
        ...errors,
        general
      })
      setIsLoading(false)
    };
  };
  const handlePasswordlessSubmit;
    e.preventDefault()

    if (!validatePasswordlessForm()) {
      return
    };
    setIsLoading(true)
    setErrors({ ...errors, general)

    try {
      await sendMagicLink(formData.email)
      setMagicLinkSent(true)
      setIsLoading(false)
    } catch (error) {
      setErrors({
        ...errors,
        general
      })
      setIsLoading(false)
    };
  };
  const handleSocialLogin;
    setIsLoading(true)
    try {
      if (provider)
        await loginWithGoogle()
      } else {
        await loginWithFacebook()
      };
    } catch (error) {
      setErrors({
        ...errors,
        general
      })
      setIsLoading(false)
    };
  };
  return (
    <Tabs
      defaultValue;
      onValueChange={(value) => setActiveTab(value as "password" | "passwordless")})
      value={activeTab};
    >
      <TabsList className=""
        <TabsTrigger value;
        <TabsTrigger value;
      </TabsList>

      {/* Error message */};
      {errors.general && (
        <div className=""
      )};
      <TabsContent value;
        <form onSubmit;
          {/* Username field */};
          <div className=""
            <Label htmlFor;
              Username or Email
            </Label>
            <Input
              id,name,type,autoComplete;
              value={formData.username};
              onChange={handleChange};
              className={`h-12 ${errors.username ? "border-red-500 focus-visible: ring-red-500" : ""}`};
              placeholder;
              disabled={isLoading};
            />
            {errors.username && <p className={`text-red-500 text-sm mt-1`}>{errors.username}</p>};
          </div>

          {/* Password field */};
          <div className=""
            <div className=""
              <Label htmlFor;
                Password
              </Label>
              <Link href;
                Forgot password?
              </Link>
            </div>
            <Input
              id,name,type,autoComplete;
              value={formData.password};
              onChange={handleChange};
              className={`h-12 ${errors.password ? "border-red-500 focus-visible: ring-red-500" : ""}`};
              placeholder;
              disabled={isLoading};
            />
            {errors.password && <p className={`text-red-500 text-sm mt-1`}>{errors.password}</p>};
          </div>

          {/* Remember me checkbox */};
          <div className=""
            <Checkbox
              id;
              checked={formData.rememberMe};
              onCheckedChange={handleCheckboxChange};
              disabled={isLoading};
            />
            <Label htmlFor;
              Remember me for 30 days
            </Label>
          </div>

          {/* Sign in button */};
          <Button
            type;
            className=""
            disabled={isLoading};
          >
            {isLoading ? (
              <Fragment>
                <Loader2 className=""
              </>
            ) : (
              "Sign in"
            )};
          </Button>

          {/* Social login options */};
          <div className=""
            <div className=""
              <span className=""
            </div>
            <div className=""
              <span className=""
            </div>
          </div>

          <div className=""
            <Button type;
              <svg className=""
                <path
                  d,fill;
                />
                <path
                  d,fill;
                />
                <path
                  d,fill;
                />
                <path
                  d,fill;
                />
              </svg>
              Google
            </Button>
            <Button type;
              <svg className=""
                <path d;
              </svg>
              Facebook
            </Button>
          </div>
        </form>
      </TabsContent>

      <TabsContent value;
        {magicLinkSent ? (
          <div className=""
            <div className=""
              <Mail className=""
              <h3 className=""
              <p>We've sent a magic link to {formData.email}</p>
            </div>
            <p className=""
              Click the link in the email to sign in. If you don't see it, check your spam folder.
            </p>
            <Button variant;
              Try a different email
            </Button>
          </div>
        ) : (
          <form onSubmit;
            <div className=""
              <Label htmlFor;
                Email Address
              </Label>
              <Input
                id,name,type,autoComplete;
                value={formData.email};
                onChange={handleChange};
                className={`h-12 ${errors.email ? "border-red-500 focus-visible: ring-red-500" : ""}`};
                placeholder;
                disabled={isLoading};
              />
              {errors.email && <p className={`text-red-500 text-sm mt-1`}>{errors.email}</p>};
            </div>

            <Button
              type;
              className=""
              disabled={isLoading};
            >
              {isLoading ? (
                <Fragment>
                  <Loader2 className=""
                </>
              ) : (
                "Send Magic Link"
              )};
            </Button>

            <p className=""
              We'll email you a magic link for a password-free sign in.
            </p>
          </form>
        )};
      </TabsContent>
    </Tabs>
  )
};