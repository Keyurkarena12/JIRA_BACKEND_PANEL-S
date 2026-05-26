import transporter from "./Email.config.js";
import { acceptInviteUrl, FRONTEND_URL } from "../config/urls.js";

const sendInviteEmail = async (email, workspaceName, token) => {
  try {
    const inviteLink = acceptInviteUrl(token);
    const rejectLink = `${inviteLink}&action=reject`;

    const info = await transporter.sendMail({
      from: '"Mini Jira" <kkarena007@gmail.com>',
      to: email,
      subject: `Invitation to join workspace: ${workspaceName}`,

      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: auto;
          padding: 20px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          background-color: #f9fafb;
        ">
          
          <div style="text-align: center; padding: 20px 0;">
            <h1 style="color: #111827; margin: 0; font-size: 28px;">
              Mini Jira
            </h1>
            <p style="color: #6b7280; font-size: 16px; margin-top: 8px;">
              Workspace Invitation
            </p>
          </div>

          <div style="
            background: white;
            padding: 30px;
            border-radius: 10px;
          ">
            <h2 style="color: #111827;">You're Invited!</h2>

            <p style="color: #4b5563;">
              You have been invited to join 
              <strong>${workspaceName}</strong>.
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${inviteLink}" style="
                display: inline-block;
                padding: 14px 30px;
                background: #16a34a;
                color: white;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
              ">
                Accept Invitation
              </a>
            </div>

            <div style="text-align: center; margin: 15px 0;">
              <a href="${rejectLink}" style="
                display: inline-block;
                padding: 10px 25px;
                background: #ef4444;
                color: white;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 500;
              ">
                Decline
              </a>
            </div>

            <p style="color: #6b7280; font-size: 13px; word-break: break-all;">
              Or copy this link:<br/>
              <a href="${inviteLink}" style="color: #2563eb;">${inviteLink}</a>
            </p>

            <p style="color: #6b7280; font-size: 13px;">
              This invitation will expire in 24 hours.
            </p>
          </div>

          <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #9ca3af;">
            Sent from ${FRONTEND_URL}
          </div>
        </div>
      `,
    });

    console.log("Invite email sent:", info.messageId, "→", inviteLink);

  } catch (error) {
    console.error("Error sending invite email:", error);
    throw error;
  }
};

export default sendInviteEmail;
