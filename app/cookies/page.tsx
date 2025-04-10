export default function CookiesPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">Cookie Policy</h1>
      <div className="prose max-w-none">
        <p className="text-lg mb-6">
          This Cookie Policy explains how Step Into Storytime uses cookies and
          similar technologies to provide, customize, evaluate, improve, promote
          and protect our services.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">What are Cookies?</h2>
        <p className="text-lg mb-6">
          Cookies are small text files that are placed on your device when you
          visit our website. They help us provide you with a better experience
          and improve our services.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">
          Types of Cookies We Use
        </h2>
        <ul className="list-disc pl-6 mb-6">
          <li className="text-lg mb-2">
            Essential cookies for authentication and security
          </li>
          <li className="text-lg mb-2">
            Preference cookies to remember your settings
          </li>
          <li className="text-lg mb-2">
            Analytics cookies to improve our service
          </li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">Managing Cookies</h2>
        <p className="text-lg mb-6">
          You can control and/or delete cookies as you wish. You can delete all
          cookies that are already on your computer and you can set most
          browsers to prevent them from being placed.
        </p>
      </div>
    </div>
  );
}
