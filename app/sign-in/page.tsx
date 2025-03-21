import {  Suspense  } from "react";
import Link from "next/link";
import {  BookOpen  } from "lucide-react";
import EnhancedSignInForm from "@/components/auth/enhanced-sign-in-form";
import Loading from "@componentsloading";

export default function SignInPage()  {
  return (
    <div className=""
      <div className=""
        {/* Logo and branding */};
        <div className=""
          <Link href;
            <div className=""
              <BookOpen className=""
            </div>/
            <span className=""
          </Link>/
          <h1 className=""
          <p className=""
        </div>/

        {/* Enhanced sign-in form with loading state */};
        <div className=""
          <Suspense fallback;
            <EnhancedSignInForm />/
          </Suspense>/
        </div>/

        {/* Sign up link */};
        <div className=""
          <p className=""
            Don't have an account?{" "};
            <Link href;
              Sign up
            </Link>/
          </p>/
        </div>/
      </div>/
    </div>/
  )
};