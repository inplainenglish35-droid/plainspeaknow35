import { useState } from "react";
import { Link } from "react-router-dom";
import { useOutletContext } from "react-router-dom";
import { translations } from "../i18n";
import type { Language } from "../components/plainspeak/types/language";

const API_URL = import.meta.env.VITE_API_URL ?? "";

export default function Contact() {
  const [name, setName] = useState("");
  const [organization, setOrganization] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const isValid =
  name.trim() &&
  organization.trim() &&
  email.trim() &&
  message.trim();
  const { language } = useOutletContext<{ language: Language }>();

  const t = translations[language];
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!isValid) return;

  try {
    const response = await fetch(`${API_URL}/api/support`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
  type: "organization",
  name,
  organization,
  email,
  message,
}),
    });

    if (!response.ok) {
      throw new Error("Request failed");
    }

    setSuccess(true);

    setName("");
setOrganization("");
setEmail("");
setMessage("");
  } catch (error) {
    console.error(error);
    alert("Something went wrong. Please try again.");
  }
};

  return (
    <main className="min-h-screen bg-white text-black px-6 py-16">
      <div className="mx-auto max-w-2xl space-y-8">
        <h1 className="text-3xl font-bold">{t.contactTitle}</h1>

        <p className="text-gray-700">
          {t.contactSubtitle}
        </p>

        {/* Contact form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-lg border border-gray-200 p-6"
        >
          <div className="space-y-1">
            <label className="block text-sm font-medium">
  {t.contactName}
</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              required
            />
            {success && (
  <div className="rounded-md border border-green-200 bg-green-50 p-4 text-green-800">
    Thank you. Your message has been sent.
  </div>
)}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium">
  {t.contactOrganization}
</label>
            <input
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium">
  {t.contactEmail}
</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              required
            />
          </div>

<div className="space-y-1">
  <label className="block text-sm font-medium">
    Message
  </label>

  <textarea
    value={message}
    onChange={(e) => setMessage(e.target.value)}
    rows={6}
    required
    placeholder="Tell us about your organization, your document needs, expected number of users, or any questions you have."
    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
  />
</div>
          <button
            type="submit"
            disabled={!isValid}
            className="inline-flex items-center justify-center rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {t.contactSend}
          </button>
        </form>

        {/* What happens next */}
        <p className="text-sm text-gray-600">
          <strong>{t.contactNextStepsTitle}</strong> {t.contactNextSteps}
        </p>

        {/* Response time */}
        <p className="text-sm text-gray-600">
          {t.contactResponseTime}.
        </p>

        {/* Privacy reassurance */}
        <p className="text-sm text-gray-600">
          {t.contactPrivacy}
        </p>

        {/* Fallback email */}
        <p className="text-sm text-gray-600">
          Prefer email? Reach us directly at{" "}
          <a
            href="mailto:support@plainspeaknow.net"
            className="font-medium text-teal-600 underline hover:text-teal-700"
          >
            support@plainspeaknow.net
          </a>
        </p>

        {/* Back link */}
        <div className="pt-4">
          <Link
            to="/pricing"
            className="text-sm font-medium text-teal-600 underline hover:text-teal-700"
          >
            {t.contactBack}
          </Link>
        </div>
      </div>
    </main>
  );
}
 
