
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SupportEmailData {
  type?: string;
  name?: string;
  organization?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export async function sendWelcomeEmail(toEmail: string) {
  try {
    await resend.emails.send({
      from: "Plainspeak <hello@plainspeaknow.net>",
      to: toEmail,
      subject: "Welcome to Plainspeak Now™",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b;">

          <h1>Welcome to Plainspeak Now™</h1>

          <p>
            Your account is ready.
          </p>

          <p>
            Plainspeak Now™ helps turn confusing documents into clear, everyday language.
          </p>

          <p>
            You can now upload supported documents and receive:
          </p>

          <ul>
            <li>Plain-language explanations</li>
            <li>Important item breakdowns</li>
            <li>Optional translation support</li>
          </ul>

          <p>
            Thank you for being part of our community.
          </p>

          <p>
            — Plainspeak Now™
          </p>

        </div>
      `,
    });

    console.log("Welcome email sent!");
  } catch (error) {
    console.error("Failed to send welcome email:", error);
  }
}

export async function sendKeysAddedEmail(toEmail: string) {
  try {
    await resend.emails.send({
      from: "Plainspeak <hello@plainspeaknow.net>",
      to: toEmail,
      subject: "Your Keys Are Ready",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b;">

          <h1>Your Keys Are Ready</h1>

          <p>
            Thank you for using Plainspeak Now™.
          </p>

          <p>
            Your Keys have been successfully added to your account and are ready to use.
          </p>

          <p>
            Sign in anytime to process additional documents.
          </p>

          <p>
            Thank you for supporting Plainspeak Now™.
          </p>

        </div>
      `,
    });

    console.log("Keys email sent!");
  } catch (error) {
    console.error("Failed to send keys email:", error);
  }
}

export async function sendSupportEmail(
  data: SupportEmailData
) {
  try {
    await resend.emails.send({
      from: "Plainspeak <hello@plainspeaknow.net>",
      to: "support@plainspeaknow.net",
      replyTo: data.email,
      ...(data.email
        ? {
            replyTo: data.email,
          }
        : {}),

      subject: `[${data.type || "Support"}] ${
        data.subject || "New Message"
      }`,

      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b;">

          <h2>New Support Request</h2>

          <p>
            <strong>Type:</strong> ${data.type || "Unknown"}
          </p>

          <p>
            <strong>Name:</strong> ${data.name || "Not provided"}
          </p>

          <p>
            <strong>Organization:</strong> ${
              data.organization || "Not provided"
            }
          </p>

          <p>
            <strong>Email:</strong> ${
              data.email || "Not provided"
            }
          </p>

          <p>
            <strong>Subject:</strong> ${
              data.subject || "None"
            }
          </p>

          <hr />

          <p>
            <strong>Message:</strong>
          </p>

          <p>
            ${data.message || "No message provided"}
          </p>

        </div>
      `,
    });

    console.log("Support email sent!");
  } catch (error) {
    console.error("Failed to send support email:", error);
    throw error;
  }
}



