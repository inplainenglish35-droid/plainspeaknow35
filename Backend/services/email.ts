import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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
    console.error(error);
  }
}

export async function sendKeysAddedEmail(toEmail) {
  try {
    await resend.emails.send({
      from: "Plainspeak <hello@plainspeaknow.net>",
      to: toEmail,
      subject: "Your Keys Are Ready",
      html: `
        <h1>Your Keys Were Added</h1>
        <p>Thank you for using Plainspeak Now™.</p>
        <p>Your Keys are now available in your account.</p>
      `,
    });

    console.log("Keys email sent!");
  } catch (error) {
    console.error(error);
  }
}