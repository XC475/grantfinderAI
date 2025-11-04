/**
 * Email sending utilities
 * Using Resend for transactional emails
 */

import { Resend } from "resend";

interface WelcomeEmailParams {
  to: string;
  name: string;
  loginUrl: string;
  temporaryPassword: string;
  organizationUrl: string;
}

/**
 * Send welcome email to newly created user
 */
export async function sendWelcomeEmail({
  to,
  name,
  loginUrl,
  temporaryPassword,
  organizationUrl,
}: WelcomeEmailParams): Promise<{ success: boolean; error?: string }> {
  const resendApiKey = process.env.RESEND_API_KEY;

  // If no API key configured, skip email sending
  if (!resendApiKey) {
    console.warn("[Email] RESEND_API_KEY not configured, skipping email");
    return { success: false, error: "Email service not configured" };
  }

  try {
    // Initialize Resend client with API key
    const resend = new Resend(resendApiKey);

    // Send email using Resend SDK
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "GrantWare AI <noreply@grantware.ai>",
      to: [to],
      subject: "Welcome to GrantWare AI - Your Account is Ready",
      html: generateWelcomeEmailHTML({
        to,
        name,
        loginUrl,
        temporaryPassword,
        organizationUrl,
      }),
    });

    if (error) {
      console.error("[Email] Failed to send welcome email:", error);
      return { success: false, error: error.message || "Failed to send email" };
    }

    console.log(`[Email] Welcome email sent to ${to}`, data);
    return { success: true };
  } catch (error) {
    console.error("[Email] Error sending welcome email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Generate HTML for welcome email
 */
function generateWelcomeEmailHTML({
  to,
  name,
  loginUrl,
  temporaryPassword,
  organizationUrl,
}: WelcomeEmailParams): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to GrantWare AI</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #09090b;
      background-color: #b5d5f0;
      padding: 40px 20px;
      min-height: 100vh;
    }
    .email-wrapper {
      width: 80vw;
      max-width: 800px;
      margin: 0 auto;
    }
    .container {
      background-color: #ffffff;
      border-radius: 10px;
      padding: 48px 40px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      border: 1px solid #e4e4e7;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 32px;
      border-bottom: 1px solid #e4e4e7;
    }
    .logo {
      font-family: 'Source Serif 4', Georgia, serif;
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 12px;
      line-height: 1.2;
    }
    .logo-brand {
      color: #09090b;
      font-weight: 700;
    }
    .logo-ai {
      color: #4169e1;
      font-weight: 700;
    }
    .header-tagline {
      color: #71717a;
      font-size: 16px;
      font-weight: 400;
      margin-top: 8px;
    }
    .content {
      margin-bottom: 32px;
    }
    .greeting {
      font-family: 'Source Serif 4', Georgia, serif;
      font-size: 28px;
      font-weight: 600;
      color: #09090b;
      margin-bottom: 24px;
      line-height: 1.3;
    }
    .content-text {
      color: #09090b;
      font-size: 16px;
      line-height: 1.7;
      margin-bottom: 24px;
    }
    .credentials {
      background: linear-gradient(to bottom, #f4f4f5 0%, #ffffff 100%);
      border: 1px solid #e4e4e7;
      border-left: 4px solid #5a8bf2;
      padding: 24px;
      margin: 32px 0;
      border-radius: 10px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
    }
    .credentials-label {
      font-weight: 600;
      color: #09090b;
      margin-bottom: 8px;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .credentials-value {
      font-family: 'Courier New', 'Monaco', monospace;
      background-color: #ffffff;
      padding: 12px 16px;
      border-radius: 8px;
      margin-top: 8px;
      word-break: break-all;
      color: #09090b;
      font-size: 14px;
      border: 1px solid #e4e4e7;
    }
    .button-wrapper {
      text-align: center;
      margin: 32px 0;
    }
    .buttons-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
      align-items: center;
    }
    .button {
      display: inline-block;
      background: linear-gradient(to bottom, #5b8cff 0%, #4169e1 100%);
      color: #ffffff !important;
      text-decoration: none;
      padding: 10px 24px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 14px;
      box-shadow: 0 12px 48px rgba(59, 91, 219, 0.3), 0 4px 16px rgba(59, 91, 219, 0.2);
      transition: all 0.3s ease;
      border: none;
    }
    .button:hover {
      background: linear-gradient(to bottom, #5078e8 0%, #3b5bdb 100%);
      box-shadow: 0 16px 56px rgba(59, 91, 219, 0.4), 0 6px 20px rgba(59, 91, 219, 0.3);
      transform: translateY(-1px);
    }
    .button-secondary {
      display: inline-block;
      background: #ffffff;
      color: #5a8bf2 !important;
      text-decoration: none;
      padding: 10px 24px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 14px;
      border: 2px solid #5a8bf2;
      transition: all 0.3s ease;
    }
    .button-secondary:hover {
      background: #f4f4f5;
      color: #4169e1 !important;
      border-color: #4169e1;
    }
    .warning {
      background: linear-gradient(to bottom, #fef3c7 0%, #fef9e7 100%);
      border-left: 4px solid #f59e0b;
      padding: 20px;
      margin: 24px 0;
      border-radius: 10px;
      font-size: 14px;
      color: #92400e;
      border: 1px solid #fde68a;
    }
    .warning strong {
      color: #78350f;
      display: block;
      margin-bottom: 4px;
    }
    .section-title {
      font-family: 'Source Serif 4', Georgia, serif;
      font-size: 22px;
      font-weight: 600;
      color: #09090b;
      margin-top: 32px;
      margin-bottom: 16px;
    }
    .list {
      color: #71717a;
      font-size: 15px;
      line-height: 1.8;
      padding-left: 24px;
      margin-bottom: 24px;
    }
    .list li {
      margin-bottom: 8px;
    }
    .list strong {
      color: #09090b;
      font-weight: 600;
    }
    .link {
      color: #5a8bf2;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s ease;
    }
    .link:hover {
      color: #4169e1;
      text-decoration: underline;
    }
    .footer {
      text-align: center;
      margin-top: 48px;
      padding-top: 32px;
      border-top: 1px solid #e4e4e7;
      font-size: 14px;
      color: #71717a;
    }
    .footer-text {
      margin-bottom: 16px;
      color: #71717a;
    }
    .footer-links {
      display: inline-flex;
      gap: 16px;
      flex-wrap: wrap;
      justify-content: center;
    }
    .footer-links a {
      color: #5a8bf2;
      text-decoration: none;
      font-weight: 500;
    }
    .footer-links a:hover {
      color: #4169e1;
      text-decoration: underline;
    }
    @media only screen and (max-width: 600px) {
      .email-wrapper {
        width: 90vw;
      }
      .container {
        padding: 32px 24px;
      }
      .logo {
        font-size: 28px;
      }
      .greeting {
        font-size: 24px;
      }
      .button {
        padding: 10px 20px;
        font-size: 13px;
      }
      .button-secondary {
        padding: 10px 20px;
        font-size: 13px;
      }
      .buttons-container {
        width: 100%;
      }
      .button, .button-secondary {
        width: 100%;
        max-width: 100%;
      }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="container">
      <div class="header">
        <div class="logo">
          <span class="logo-brand">GrantWare</span>
          <span class="logo-ai"> AI</span>
        </div>
        <p class="header-tagline">Discover high-fit opportunities, get AI-powered eligibility analysis, and manage the entire grant lifecycle in one intelligent platform.</p>
      </div>

      <div class="content">
        <h2 class="greeting">Welcome, ${name}!</h2>
        
        <h3 class="content-text">
        Ready to see GrantWare AI in action?
        </p>

        <div class="credentials">
          <div class="credentials-label">📧 Email / Username</div>
          <div class="credentials-value">${to}</div>
          
          <div class="credentials-label" style="margin-top: 20px;">🔑 Temporary Password</div>
          <div class="credentials-value">${temporaryPassword}</div>
        </div>

        <div class="warning">
          <strong>⚠️ Security Notice</strong>
          This is a temporary password. Please change it immediately after your first login by going to Settings → Account.
        </div>

        <div class="button-wrapper">
          <div class="buttons-container">
            <a href="${loginUrl}" class="button">Login to Your Account</a>
            <a href="https://www.grantware.ai/" class="button-secondary" target="_blank" rel="noopener noreferrer">Learn More About GrantWare AI</a>
          </div>
        </div>

        <h3 class="section-title">Need Help?</h3>
        <p class="content-text" style="color: #71717a; margin-bottom: 0;">
          If you have any questions or need assistance, please contact your administrator or reach out to our support team.
        </p>
      </div>

      <div class="footer">
        <p class="footer-text">This email was sent by GrantWare AI</p>
        <div class="footer-links">
          <a href="${organizationUrl}">Go to Dashboard</a>
          <span style="color: #e4e4e7;">•</span>
          <a href="${loginUrl}">Login</a>
          <span style="color: #e4e4e7;">•</span>
          <a href="https://www.grantware.ai/" target="_blank" rel="noopener noreferrer">Visit Our Website</a>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}
