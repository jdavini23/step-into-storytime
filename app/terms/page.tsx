export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
      <div className="prose max-w-none">
        <p className="text-lg mb-6">
          By using Step Into Storytime, you agree to these terms of service.
          Please read them carefully.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Account Terms</h2>
        <ul className="list-disc pl-6 mb-6">
          <li className="text-lg mb-2">
            You must be 18 or older to create an account
          </li>
          <li className="text-lg mb-2">
            You are responsible for maintaining account security
          </li>
          <li className="text-lg mb-2">
            You must provide accurate account information
          </li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">Usage Guidelines</h2>
        <ul className="list-disc pl-6 mb-6">
          <li className="text-lg mb-2">
            Content must be appropriate for children
          </li>
          <li className="text-lg mb-2">No unauthorized commercial use</li>
          <li className="text-lg mb-2">Respect intellectual property rights</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">Service Modifications</h2>
        <p className="text-lg mb-6">
          We reserve the right to modify or discontinue services at any time.
        </p>
      </div>
    </div>
  );
}
