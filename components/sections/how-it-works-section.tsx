import Image from "next/image"
import { Zap } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HowItWorksSection() {
  return (
    <section className="py-20 md:py-28 bg-slate-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-sm font-medium mb-4">
            <Zap className="h-4 w-4 mr-2" />
            <span>Simple Process</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">How the Magic Happens</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Creating personalized stories has never been easier
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <StepCard
            number={1}
            title="Choose Your Theme"
            description="Select from fantasy, adventure, sci-fi, and many more magical worlds to explore"
            image="/placeholder.svg?height=160&width=300"
            color="violet"
          />

          <StepCard
            number={2}
            title="Customize Characters"
            description="Name them, pick traits, and make them truly your own with our intuitive editor"
            image="/placeholder.svg?height=160&width=300"
            color="indigo"
          />

          <StepCard
            number={3}
            title="Generate & Enjoy!"
            description="Our AI creates a magical bedtime story instantly, ready to read and share"
            image="/placeholder.svg?height=160&width=300"
            color="sky"
          />
        </div>
      </div>
    </section>
  )
}

function StepCard({ number, title, description, image, color }) {
  const colorMap = {
    violet: {
      bg: "bg-violet-600",
      gradient: "bg-gradient-to-r from-transparent via-violet-300 to-violet-600",
      nextGradient: "bg-gradient-to-r from-violet-600 via-indigo-300 to-indigo-600",
    },
    indigo: {
      bg: "bg-indigo-600",
      gradient: "bg-gradient-to-r from-violet-600 via-indigo-300 to-indigo-600",
      nextGradient: "bg-gradient-to-r from-indigo-600 via-sky-300 to-transparent",
    },
    sky: {
      bg: "bg-sky-600",
      gradient: "bg-gradient-to-r from-indigo-600 via-sky-300 to-transparent",
      nextGradient: "",
    },
  }

  return (
    <div className="relative">
      <div
        className={`absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${colorMap[color].bg} text-white h-12 w-12 rounded-full flex items-center justify-center text-xl font-bold shadow-lg z-10`}
      >
        {number}
      </div>
      <div className={`h-1 ${colorMap[color].gradient} absolute top-0 left-1/2 w-full`}></div>
      <Card className="border-0 shadow-xl h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl text-slate-900">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-40 w-full mb-4 rounded-lg overflow-hidden">
            <Image
              src={image || "/placeholder.svg"}
              alt={title}
              width={300}
              height={160}
              className="w-full h-full object-cover"
            />
          </div>
          <CardDescription className="text-slate-600">{description}</CardDescription>
        </CardContent>
      </Card>
    </div>
  )
}

