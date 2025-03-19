import { Suspense } from "react"
import Link from "next/link"
import { BookOpen } from "lucide-react"
import EnhancedSignInForm from "@/components/auth/enhanced-sign-in-form"
import Loading from "@/components/loading"

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-violet-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and branding */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center mb-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 flex items-center justify-center mr-3 shadow-md">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900">Step Into Storytime</span>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome back</h1>
          <p className="text-slate-600">Sign in to continue your storytelling journey</p>
        </div>

        {/* Enhanced sign-in form with loading state */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <Suspense fallback={<Loading />}>
            <EnhancedSignInForm />
          </Suspense>
        </div>

        {/* Sign up link */}
        <div className="text-center">
          <p className="text-slate-600">
            Don't have an account?{" "}
            <Link href="/sign-up" className="text-violet-600 hover:text-violet-700 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

