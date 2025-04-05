"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChevronRight, BookOpen } from "lucide-react";

export default function HeroSection() {
  const router = useRouter();

  return (
    <section className="relative overflow-hidden py-12 md:py-20">
      <div className="absolute inset-0 z-0">
        {/* Modern gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-indigo-50 to-sky-50"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div className="text-center lg:text-left max-w-2xl mx-auto lg:mx-0">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-violet-100 text-violet-800 text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4 mr-2" aria-hidden="true" />
              <span>AI-Powered Storytelling</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Create Magical{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">
                Bedtime Stories
              </span>{" "}
              in Seconds
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-xl mx-auto lg:mx-0">
              Step Into Storytime transforms your ideas into personalized
              adventures that captivate children's imagination and create
              lasting memories.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <Button
                variant="default"
                size="lg"
                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-8 py-3 text-lg font-medium"
                onClick={() => router.push("/create")}
              >
                Start Your Story{" "}
                <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-slate-200 text-slate-700 px-8 py-3 text-lg font-medium"
                onClick={() => router.push("/#how-it-works")}
              >
                Watch Demo
              </Button>
            </div>
            <div className="flex items-center justify-center lg:justify-start space-x-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="inline-block h-10 w-10 rounded-full ring-4 ring-white overflow-hidden bg-white"
                  >
                    <Image
                      src={`/images/users/user-${i}.jpg`}
                      alt={`User ${i} avatar`}
                      width={40}
                      height={40}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center mb-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 text-amber-400"
                      fill="#fbbf24"
                    />
                  ))}
                </div>
                <p className="text-sm text-slate-600">
                  Trusted by 10,000+ families
                </p>
              </div>
            </div>
          </div>
          <div className="lg:mt-0">
            <HeroImage />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroImage() {
  const router = useRouter();

  return (
    <div className="relative mx-auto max-w-2xl lg:max-w-none">
      <div className="absolute -inset-4 bg-gradient-to-r from-violet-500/20 to-indigo-500/20 rounded-2xl blur-xl"></div>
      <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden aspect-[4/3]">
        <Image
          src="/images/hero/storybook-portal.jpg"
          alt="Child stepping into a storybook portal"
          width={800}
          height={600}
          className="w-full h-full object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent flex flex-col justify-end p-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-1">
              Emma's Space Adventure
            </h3>
            <p className="text-slate-700 text-sm mb-3">
              A personalized journey through the stars with Captain Emma and her
              robot friend Blip.
            </p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">
                Created 2 minutes ago
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="text-violet-600 hover:text-violet-700"
                onClick={() => router.push("/story")}
              >
                Read Story <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating elements with modern style */}
      <div className="absolute -top-8 -right-8 bg-gradient-to-br from-amber-400 to-amber-500 rounded-2xl p-4 shadow-lg transform rotate-6">
        <Sparkles className="h-6 w-6 text-white" />
      </div>
      <div className="absolute -bottom-6 -left-6 bg-gradient-to-br from-sky-400 to-sky-500 rounded-2xl p-4 shadow-lg transform -rotate-6">
        <BookOpen className="h-6 w-6 text-white" />
      </div>
    </div>
  );
}
