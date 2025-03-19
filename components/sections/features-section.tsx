import { Wand2, BookOpen, Sparkles, Zap } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function FeaturesSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-sm font-medium mb-4">
            <Zap className="h-4 w-4 mr-2" />
            <span>Powerful Features</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Unleash Your Imagination</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Our AI-powered platform creates personalized stories that spark creativity and create lasting memories.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Wand2 className="h-6 w-6 text-white" />}
            title="Custom Characters"
            description="Create heroes that look just like your little ones with our advanced character customization."
            color="from-violet-500 to-violet-600"
          />

          <FeatureCard
            icon={<BookOpen className="h-6 w-6 text-white" />}
            title="Magical Themes"
            description="Choose from fantasy, adventure, space and more with new themes added monthly."
            color="from-indigo-500 to-indigo-600"
          />

          <FeatureCard
            icon={<Sparkles className="h-6 w-6 text-white" />}
            title="Instant Stories"
            description="Generate unique tales with just a few clicks using our advanced AI technology."
            color="from-sky-500 to-sky-600"
          />
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ icon, title, description, color }) {
  return (
    <Card className="border-0 shadow-xl overflow-hidden h-full transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
      <div className={`bg-gradient-to-r ${color} p-4 flex justify-center`}>
        <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">{icon}</div>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl text-slate-900">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-slate-600 text-base">{description}</CardDescription>
      </CardContent>
    </Card>
  )
}

