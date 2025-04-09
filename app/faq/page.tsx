export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">Frequently Asked Questions</h1>
      <div className="prose max-w-none">
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">
              What is Step Into Storytime?
            </h2>
            <p className="text-lg">
              Step Into Storytime is an AI-powered platform that creates
              personalized bedtime stories for children aged 3-8.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">How does it work?</h2>
            <p className="text-lg">
              Simply choose your story preferences (characters, setting, theme),
              and our AI will generate a unique story tailored to your choices.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">
              Is it safe for children?
            </h2>
            <p className="text-lg">
              Yes, all stories are filtered for age-appropriate content and
              reviewed by our AI safety systems.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">
              What age group is it for?
            </h2>
            <p className="text-lg">
              Our stories are designed for children aged 3-8, but can be enjoyed
              by the whole family.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Can I save my stories?</h2>
            <p className="text-lg">
              Yes, premium users can save unlimited stories in their personal
              library.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
