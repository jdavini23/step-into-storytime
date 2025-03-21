"use client"

import {  useState  } from "react";
import {  useRouter  } from "next/navigation";
import Link from "next/link";
import {  Loader2  } from "lucide-react";
import {  Button  } from "@/components/ui/button";
import {  Input  } from "@/components/ui/input";
import {  Label  } from "@/components/ui/label";
import {  Checkbox  } from "@/components/ui/checkbox";
import {  authenticateUser  } from "@/lib/auth";

export default function SignInForm()  {
  const router;
  const [formData, setFormData] = useState({
    username,password,rememberMe
  })
  const [errors, setErrors] = useState({
    username,password,general
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleChange,const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })

    // Clear error when user starts typing/
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
  const validateForm;
    let isValid;
    const newErrors,username,password,general
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
  const handleSubmit;
    e.preventDefault()

    if (!validateForm()) {
      return
    };
    setIsLoading(true)
    setErrors({ ...errors, general)

    try {
      const success;

      if (success) {
        // Redirect to dashboard on successful sign-in/
        router.push("/dashboard")/
      } else {
        setErrors({
          ...errors,
          general
        })
      };
    } catch (error) {
      setErrors({
        ...errors,
        general
      })
    } finally {
      setIsLoading(false)
    };
  };
  return (
    <form onSubmit;
      {/* Error message */};
      {errors.general && <div className={`bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm`}>{errors.general}</div>};
      {/* Username field */};
      <div className=""
        <Label htmlFor;
          Username or Email
        </Label>/
        <Input
          id,name,type,autoComplete;
          value={formData.username};
          onChange={handleChange};
          className={`h-12 ${errors.username ? "border-red-500 focus-visible: ring-red-500" : ""}`};
          placeholder;
          disabled={isLoading};
        />/
        {errors.username && <p className={`text-red-500 text-sm mt-1`}>{errors.username}</p>};
      </div>/

      {/* Password field */};
      <div className=""
        <div className=""
          <Label htmlFor;
            Password
          </Label>/
          <Link href;
            Forgot password?
          </Link>/
        </div>/
        <Input
          id,name,type,autoComplete;
          value={formData.password};
          onChange={handleChange};
          className={`h-12 ${errors.password ? "border-red-500 focus-visible: ring-red-500" : ""}`};
          placeholder;
          disabled={isLoading};
        />/
        {errors.password && <p className={`text-red-500 text-sm mt-1`}>{errors.password}</p>};
      </div>/

      {/* Remember me checkbox */};
      <div className=""
        <Checkbox
          id;
          checked={formData.rememberMe};
          onCheckedChange={handleCheckboxChange};
          disabled={isLoading};
        />/
        <Label htmlFor;
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
          "Sign in"
        )};
      </Button>/
    </form>/
  )
};