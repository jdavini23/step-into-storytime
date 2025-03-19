"use client"

import { useRouter } from "next/navigation"
import { Sparkles, Users, BookOpen, Wand2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CtaSection() {
  const router = useRouter()

  return (
    <section
      className="py-20 md:py-28 bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
      aria-labelledby="cta-heading"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
          <div>
            <h2 id="cta-heading" className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Begin the Magic?
            </h2>
            <p className="text-xl text-indigo-100 mb-8">
              Join thousands of families creating unforgettable bedtime stories. Start your magical journey today!
            </p>
            <Button
              size="lg"
              className="bg-white text-indigo-600 hover:bg-indigo-50 rounded-lg px-8 py-6 text-lg font-medium shadow-lg transition-all hover:shadow-xl"
              onClick={() => router.push("/create")}
            >
              Start Creating Stories <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
            </Button>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-white/20 rounded-2xl blur-xl" aria-hidden="true"></div>
            <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <Sparkles className="h-6 w-6 text-amber-300 mb-2" aria-hidden="true" />
                  <h3 className="text-lg font-semibold mb-1">10,000+</h3>
                  <p className="text-sm text-indigo-100">Stories Created</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <Users className="h-6 w-6 text-sky-300 mb-2" aria-hidden="true" />
                  <h3 className="text-lg font-semibold mb-1">5,000+</h3>
                  <p className="text-sm text-indigo-100">Happy Families</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <BookOpen className="h-6 w-6 text-violet-300 mb-2" aria-hidden="true" />
                  <h3 className="text-lg font-semibold mb-1">50+</h3>
                  <p className="text-sm text-indigo-100">Unique Themes</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <Wand2 className="h-6 w-6 text-indigo-300 mb-2" aria-hidden="true" />
                  <h3 className="text-lg font-semibold mb-1">Unlimited</h3>
                  <p className="text-sm text-indigo-100">Possibilities</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

