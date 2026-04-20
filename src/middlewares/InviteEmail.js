// import transporter from "./Email.config.js";

// const sendInviteEmail = async (email, workspaceName) => {
//   try {
//     const info = await transporter.sendMail({
//       from: '"Mini Jira" <kkarena007@gmail.com>',
//       to: email,
//       subject: `Invitation to join workspace: ${workspaceName}`,
//       html: `
//         <div style="
//           font-family: Arial, sans-serif;
//           max-width: 600px;
//           margin: auto;
//           padding: 20px;
//           border: 1px solid #e5e7eb;
//           border-radius: 12px;
//           background-color: #f9fafb;
//         ">
          
//           <div style="text-align: center; padding: 20px 0;">
//             <h1 style="
//               color: #111827;
//               margin: 0;
//               font-size: 28px;
//             ">
//               Mini Jira
//             </h1>
//             <p style="
//               color: #6b7280;
//               font-size: 16px;
//               margin-top: 8px;
//             ">
//               Workspace Invitation
//             </p>
//           </div>

//           <div style="
//             background: white;
//             padding: 30px;
//             border-radius: 10px;
//             box-shadow: 0 2px 8px rgba(0,0,0,0.05);
//           ">
//             <h2 style="
//               color: #111827;
//               margin-bottom: 15px;
//             ">
//               You're Invited!
//             </h2>

//             <p style="
//               color: #4b5563;
//               font-size: 15px;
//               line-height: 1.6;
//             ">
//               You have been invited to join the workspace <strong>${workspaceName}</strong> on Mini Jira.
//             </p>

//             <div style="
//               text-align: center;
//               margin: 30px 0;
//             ">
//               <div style="
//                 display: inline-block;
//                 padding: 20px 30px;
//                 background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//                 color: white;
//                 border-radius: 10px;
//                 font-size: 16px;
//                 font-weight: 600;
//               ">
//                 🎉 Welcome to ${workspaceName}
//               </div>
//             </div>

//             <p style="
//               color: #4b5563;
//               font-size: 15px;
//               line-height: 1.6;
//             ">
//               Log in to your Mini Jira account to start collaborating with your team.
//             </p>

//             <div style="
//               text-align: center;
//               margin: 25px 0;
//             ">
//               <a href="${process.env.FRONTEND_URL}" style="
//                 display: inline-block;
//                 padding: 12px 30px;
//                 background: #2563eb;
//                 color: white;
//                 text-decoration: none;
//                 border-radius: 8px;
//                 font-weight: 600;
//                 font-size: 14px;
//               ">
//                 Go to Mini Jira
//               </a>
//             </div>

//             <p style="
//               color: #6b7280;
//               font-size: 14px;
//             ">
//               If you don't have an account yet, you can sign up for free.
//             </p>
//           </div>

//           <div style="
//             text-align: center;
//             margin-top: 20px;
//             color: #9ca3af;
//             font-size: 12px;
//           ">
//             © 2026 Mini Jira. All rights reserved.
//           </div>
//         </div>
//       `,
//     });

//     console.log("Workspace invitation email sent:", info.messageId);
//   } catch (error) {
//     console.error("Error sending invitation email:", error);
//     throw error;
//   }
// };

// export default sendInviteEmail;



import transporter from "./Email.config.js";

const sendInviteEmail = async (email, workspaceName, token) => {
  try {

    // ✅ create invite link with token
    const inviteLink = `${process.env.FRONTEND_URL}/accept-invite/${token}`;

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

            <!-- ✅ ACCEPT BUTTON -->
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
                ✅ Accept Invitation
              </a>
            </div>

            <!-- ❌ OPTIONAL REJECT BUTTON -->
            <div style="text-align: center; margin: 15px 0;">
              <a href="${inviteLink}?action=reject" style="
                display: inline-block;
                padding: 10px 25px;
                background: #ef4444;
                color: white;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 500;
              ">
                ❌ Reject
              </a>
            </div>

            <p style="color: #6b7280; font-size: 13px;">
              This invitation will expire in 24 hours.
            </p>
          </div>

          <div style="text-align: center; margin-top: 20px; font-size: 12px;">
            © 2026 Mini Jira
          </div>
        </div>
      `,
    });

    console.log("Invite email sent:", info.messageId);

  } catch (error) {
    console.error("Error sending invite email:", error);
    throw error;
  }
};

export default sendInviteEmail;