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
      from: process.env.EMAIL_FROM || "GrantFinder AI <noreply@grantfinder.ai>",
      to: [to],
      subject: "Welcome to GrantFinder AI - Your Account is Ready",
      html: generateWelcomeEmailHTML({
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
  name,
  loginUrl,
  temporaryPassword,
  organizationUrl,
}: Omit<WelcomeEmailParams, "to">): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to GrantFinder AI</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 40px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
      color: #4F46E5;
      margin-bottom: 10px;
    }
    .content {
      margin-bottom: 30px;
    }
    .credentials {
      background-color: #F3F4F6;
      border-left: 4px solid #4F46E5;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .credentials-label {
      font-weight: 600;
      color: #374151;
      margin-bottom: 5px;
    }
    .credentials-value {
      font-family: 'Courier New', monospace;
      background-color: #ffffff;
      padding: 8px 12px;
      border-radius: 4px;
      margin-top: 5px;
      word-break: break-all;
    }
    .button {
      display: inline-block;
      background-color: #4F46E5;
      color: #ffffff !important;
      text-decoration: none;
      padding: 12px 30px;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
    }
    .button:hover {
      background-color: #4338CA;
    }
    .warning {
      background-color: #FEF3C7;
      border-left: 4px solid #F59E0B;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
      font-size: 14px;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #E5E7EB;
      font-size: 14px;
      color: #6B7280;
    }
    .link {
      color: #4F46E5;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🎯 GrantFinder AI</div>
      <p style="color: #6B7280;">Find and manage grant opportunities</p>
    </div>

    <div class="content">
      <h2 style="color: #111827; margin-bottom: 20px;">Welcome, ${name}!</h2>
      
      <p>Your GrantFinder AI account has been created by an administrator. You now have access to our grant discovery and management platform.</p>

      <div class="credentials">
        <div class="credentials-label">📧 Email / Username</div>
        <div class="credentials-value">${name
          .split(" ")[0]
          .toLowerCase()}@example.com</div>
        
        <div class="credentials-label" style="margin-top: 15px;">🔑 Temporary Password</div>
        <div class="credentials-value">${temporaryPassword}</div>
      </div>

      <div class="warning">
        <strong>⚠️ Security Notice:</strong> This is a temporary password. Please change it immediately after your first login by going to Settings → Account.
      </div>

      <div style="text-align: center;">
        <a href="${loginUrl}" class="button">Login to Your Account</a>
      </div>

      <h3 style="color: #111827; margin-top: 30px;">Getting Started</h3>
      <ul style="color: #4B5563;">
        <li><strong>Login:</strong> Use the button above or visit <a href="${loginUrl}" class="link">${loginUrl}</a></li>
        <li><strong>Your Organization:</strong> Access your personal organization at <a href="${organizationUrl}" class="link">this link</a></li>
        <li><strong>Change Password:</strong> Go to Settings → Account after logging in</li>
        <li><strong>Explore Grants:</strong> Browse available grant opportunities in your dashboard</li>
      </ul>

      <h3 style="color: #111827; margin-top: 30px;">Need Help?</h3>
      <p style="color: #4B5563;">If you have any questions or need assistance, please contact your administrator or reach out to our support team.</p>
    </div>

    <div class="footer">
      <p>This email was sent by GrantFinder AI</p>
      <p style="margin-top: 10px;">
        <a href="${organizationUrl}" class="link">Go to Dashboard</a> • 
        <a href="${loginUrl}" class="link">Login</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
