import transporter from "./Email.config.js";

const sendPasswordResetEmail = async (email, resetCode) => {
  try {
    const info = await transporter.sendMail({
      from: '"Mini Jira" <kkarena007@gmail.com>',
      to: email,
      subject: "Password Reset Code",
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
            <h1 style="
              color: #111827;
              margin: 0;
              font-size: 28px;
            ">
              Mini Jira
            </h1>
            <p style="
              color: #6b7280;
              font-size: 16px;
              margin-top: 8px;
            ">
              Password Reset Verification Code
            </p>
          </div>

          <div style="
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          ">
            <h2 style="
              color: #111827;
              margin-bottom: 15px;
            ">
              Reset Your Password
            </h2>

            <p style="
              color: #4b5563;
              font-size: 15px;
              line-height: 1.6;
            ">
              Use the verification code below to reset your password:
            </p>

            <div style="
              text-align: center;
              margin: 30px 0;
            ">
              <span style="
                display: inline-block;
                padding: 15px 30px;
                font-size: 28px;
                font-weight: bold;
                letter-spacing: 6px;
                color: #2563eb;
                background: #eff6ff;
                border: 2px dashed #2563eb;
                border-radius: 8px;
              ">
                ${resetCode}
              </span>
            </div>

            <p style="
              color: #6b7280;
              font-size: 14px;
              line-height: 1.6;
            ">
              This code is valid for a limited time only.
            </p>

            <p style="
              color: #6b7280;
              font-size: 14px;
            ">
              If you did not request a password reset, please ignore this email.
            </p>
          </div>

          <div style="
            text-align: center;
            margin-top: 20px;
            color: #9ca3af;
            font-size: 12px;
          ">
            © 2026 Mini Jira. All rights reserved.
          </div>
        </div>
      `,
    });

    console.log("Password reset email sent:", info.messageId);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};

export default sendPasswordResetEmail;