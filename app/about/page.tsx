export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">About Step Into Storytime</h1>
      <div className="prose max-w-none">
        <p className="text-lg mb-6">
          Step Into Storytime is an AI-powered platform that transforms bedtime
          into a magical, personalized experience for children aged 3-8 and
          their families.
        </p>
        <p className="text-lg mb-6">
          Our mission is to make storytelling more engaging, interactive, and
          accessible for families around the world.
        </p>
        <h2 className="text-2xl font-bold mt-8 mb-4">Our Story</h2>
        <p className="text-lg mb-6">
          Founded with the belief that every child deserves personalized,
          engaging stories that spark their imagination and creativity.
        </p>
        <h2 className="text-2xl font-bold mt-8 mb-4">Our Values</h2>
        <ul className="list-disc pl-6 mb-6">
          <li className="text-lg mb-2">Creativity and Imagination</li>
          <li className="text-lg mb-2">Educational Excellence</li>
          <li className="text-lg mb-2">Family Connection</li>
          <li className="text-lg mb-2">Safety and Privacy</li>
        </ul>
      </div>
    </div>
  );
}
