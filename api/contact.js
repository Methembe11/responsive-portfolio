import { Resend } from "resend";

/**
 * Strip HTML tags from a string to prevent injection into email body.
 */
function stripHtml(str) {
  return String(str).replace(/<[^>]*>/g, "").trim();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Sanitize all user inputs to prevent XSS in email body
  const safeName = stripHtml(name);
  const safeEmail = stripHtml(email);
  const safeMessage = stripHtml(message).replace(/\n/g, "<br>");

  const recipientEmail = process.env.CONTACT_EMAIL || "mkhizemethembe89@gmail.com";

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: `Portfolio Contact <onboarding@resend.dev>`,
      to: recipientEmail,
      replyTo: safeEmail,
      subject: `New message from ${safeName}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Message:</strong></p>
        <p>${safeMessage}</p>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return res.status(500).json({ error: "Failed to send message" });
    }

    return res.status(200).json({ success: true, id: data?.id });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
