import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    // 1. Validation
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Name is required." },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json(
        { success: false, error: "A valid email address is required." },
        { status: 400 }
      );
    }

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { success: false, error: "Message content cannot be empty." },
        { status: 400 }
      );
    }

    // 2. Read SMTP environment variables
    const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
    const smtpPort = Number(process.env.SMTP_PORT) || 465;
    const smtpSecure = process.env.SMTP_SECURE !== "false";
    const smtpUser = process.env.SMTP_USER || "ssubratkumar106@gmail.com";
    const smtpPass = process.env.SMTP_PASS;
    const receiverEmail = process.env.CONTACT_RECEIVER_EMAIL || "ssubratkumar106@gmail.com";

    // 3. Verify SMTP credentials exist
    if (!smtpPass || !smtpPass.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "SMTP credentials are not yet configured in .env.local (SMTP_PASS missing).",
          needsConfiguration: true,
        },
        { status: 503 }
      );
    }

    // 4. Initialize Nodemailer Transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass.trim(),
      },
    });

    // 5. Send Email
    const sanitizedName = name.replace(/[<>]/g, "");
    const sanitizedEmail = email.replace(/[<>]/g, "");
    const escapedMessage = message
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

    const info = await transporter.sendMail({
      from: `"Portfolio Contact Form" <${smtpUser}>`,
      to: receiverEmail,
      replyTo: `"${sanitizedName}" <${sanitizedEmail}>`,
      subject: `Portfolio Inquiry from ${sanitizedName}`,
      text: `You received a new inquiry from your portfolio website:\n\nName: ${sanitizedName}\nEmail: ${sanitizedEmail}\nDate: ${new Date().toLocaleString()}\n\nMessage:\n${message}\n`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0d0907; color: #f5ebd9; border-radius: 16px; overflow: hidden; border: 1px solid #33231c; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <div style="background: linear-gradient(135deg, #c41e3a 0%, #8b0000 100%); padding: 28px 24px; text-align: center;">
            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">New Portfolio Inquiry</h1>
            <p style="margin: 6px 0 0 0; color: #f5e6c8; font-size: 14px;">Direct message from your portfolio contact form</p>
          </div>
          <div style="padding: 28px 24px;">
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
              <tr>
                <td style="padding: 8px 0; color: #baa89d; font-size: 13px; font-weight: 600; text-transform: uppercase; width: 80px;">From:</td>
                <td style="padding: 8px 0; color: #ffffff; font-size: 15px; font-weight: bold;">${sanitizedName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #baa89d; font-size: 13px; font-weight: 600; text-transform: uppercase;">Email:</td>
                <td style="padding: 8px 0; color: #eb6036; font-size: 15px;"><a href="mailto:${sanitizedEmail}" style="color: #eb6036; text-decoration: none;">${sanitizedEmail}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #baa89d; font-size: 13px; font-weight: 600; text-transform: uppercase;">Date:</td>
                <td style="padding: 8px 0; color: #f5ebd9; font-size: 14px;">${new Date().toLocaleString()}</td>
              </tr>
            </table>
            <div style="border-top: 1px solid #33231c; padding-top: 20px;">
              <p style="margin: 0 0 10px 0; color: #baa89d; font-size: 13px; font-weight: 600; text-transform: uppercase;">Message Content:</p>
              <div style="background-color: #17110e; border: 1px solid #33231c; border-radius: 10px; padding: 18px; color: #f5ebd9; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${escapedMessage}</div>
            </div>
            <div style="margin-top: 28px; text-align: center;">
              <a href="mailto:${sanitizedEmail}" style="display: inline-block; background: linear-gradient(135deg, #c41e3a 0%, #e64a19 100%); color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">Reply to ${sanitizedName}</a>
            </div>
          </div>
          <div style="background-color: #070504; padding: 14px; text-align: center; border-top: 1px solid #221612; color: #7a6e65; font-size: 12px;">
            Subrat Kumar Sahoo — Personal Portfolio
          </div>
        </div>
      `,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Message sent successfully!",
        messageId: info.messageId,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("SMTP Error in /api/contact:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to deliver message via SMTP.";
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
