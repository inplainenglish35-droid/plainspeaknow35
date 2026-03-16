import { useState } from "react";
import { Link } from "react-router-dom";

export default function Contact() {
  const [name, setName] = useState("");
  const [organization, setOrganization] = useState("");
  const [email, setEmail] = useState("");

  const isValid = name.trim() && organization.trim() && email.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    const subject = encodeURIComponent(
      "PlainSpeak Organization Plans Inquiry"
    );

    const body = encodeURIComponent(
      `Name: ${name}\nOrganization: ${organization}\nEmail: ${email}\n\nTell us a bit about your needs:`
    );

    window.location.href = `mailto:inplainenglish@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <main className="min-h-screen bg-white text-black px-6 py-16">
      <div className="mx-auto max-w-2xl space-y-8">
        <h1 className="text-3xl font-bold">Contact PlainSpeak</h1>

        <p className="text-gray-700">
          If you represent a nonprofit, clinic, school, or organization and are
          interested in PlainSpeak, please share a few details below.
        </p>

        {/* Contact form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-lg border border-gray-200 p-6"
        >
          <div className="space-y-1">
            <label className="block text-sm font-medium">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium">Organization</label>
            <input
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              required
            />
          </div>

          <button
            type="submit"
            disabled={!isValid}
            className="inline-flex items-center justify-center rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Send inquiry
          </button>
        </form>

        {/* What happens next */}
        <p className="text-sm text-gray-600">
          <strong>What happens next:</strong> We’ll review your inquiry and
          follow up by email to learn more about your needs. There’s no
          obligation — just a conversation to see whether PlainSpeak is a good
          fit for your organization.
        </p>

        {/* Response time */}
        <p className="text-sm text-gray-600">
          We typically respond within <strong>1–2 business days</strong>.
        </p>

        {/* Privacy reassurance */}
        <p className="text-sm text-gray-600">
          We respect your privacy. Your information is used only to respond to
          your inquiry and is never shared or sold.
        </p>

        {/* Fallback email */}
        <p className="text-sm text-gray-600">
          Prefer email? Reach us directly at{" "}
          <a
            href="mailto:inplainenglish@gmail.com"
            className="font-medium text-teal-600 underline hover:text-teal-700"
          >
            inplainenglish@gmail.com
          </a>
        </p>

        {/* Back link */}
        <div className="pt-4">
          <Link
            to="/pricing"
            className="text-sm font-medium text-teal-600 underline hover:text-teal-700"
          >
            ← Back to pricing
          </Link>
        </div>
      </div>
    </main>
  );
}


