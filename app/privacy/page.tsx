export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      <div className="prose max-w-none">
        <p className="text-lg mb-6">
          At Step Into Storytime, we take your privacy seriously. This policy
          outlines how we collect, use, and protect your personal information.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Information We Collect</h2>
        <ul className="list-disc pl-6 mb-6">
          <li className="text-lg mb-2">Account information (email, name)</li>
          <li className="text-lg mb-2">Story preferences and settings</li>
          <li className="text-lg mb-2">Usage data and analytics</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">
          How We Use Your Information
        </h2>
        <ul className="list-disc pl-6 mb-6">
          <li className="text-lg mb-2">
            To provide personalized story experiences
          </li>
          <li className="text-lg mb-2">To improve our services</li>
          <li className="text-lg mb-2">To communicate important updates</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">Data Protection</h2>
        <p className="text-lg mb-6">
          We implement industry-standard security measures to protect your data.
        </p>
      </div>
    </div>
  );
}
