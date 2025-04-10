export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">Contact Us</h1>
      <div className="prose max-w-none">
        <p className="text-lg mb-6">
          We'd love to hear from you! Get in touch with us using any of the
          methods below.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Support</h2>
        <p className="text-lg mb-6">
          For general inquiries and support: <br />
          Email: support@stepintostorytime.com
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Business Inquiries</h2>
        <p className="text-lg mb-6">
          For partnerships and business opportunities: <br />
          Email: business@stepintostorytime.com
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Office Hours</h2>
        <p className="text-lg mb-6">
          Monday - Friday: 9:00 AM - 5:00 PM EST <br />
          Response time: Within 24 hours
        </p>
      </div>
    </div>
  );
}
