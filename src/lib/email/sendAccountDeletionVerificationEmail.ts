import { resend } from "./resend";

interface SendAccountDeletionVerificationEmailParams {
  email: string;
  verificationUrl: string;
  expiresAt: Date;
}

const FROM_EMAIL = "Anikawa <no-reply@anikawa.fun>";

export async function sendAccountDeletionVerificationEmail({
  email,
  verificationUrl,
  expiresAt,
}: SendAccountDeletionVerificationEmailParams) {
  const expiresAtText = expiresAt.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  });

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: [email],
    subject: "Confirm your Anikawa account deletion",
    html: `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Confirm account deletion</title>
        </head>

        <body style="
          margin: 0;
          padding: 0;
          background: #141519;
          color: #ffffff;
          font-family: Arial, Helvetica, sans-serif;
        ">
          <div style="
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
          ">

            <div style="
              background: #1a1c22;
              border: 1px solid rgba(140, 82, 255, 0.25);
              border-radius: 20px;
              padding: 32px;
            ">

              <h1 style="
                margin: 0 0 16px;
                font-size: 26px;
                line-height: 1.3;
              ">
                Confirm account deletion
              </h1>

              <p style="
                margin: 0 0 16px;
                color: #c7c7c7;
                font-size: 15px;
                line-height: 1.7;
              ">
                We received a request to permanently delete your
                Anikawa account.
              </p>

              <p style="
                margin: 0 0 24px;
                color: #c7c7c7;
                font-size: 15px;
                line-height: 1.7;
              ">
                Click the button below to confirm that you made this
                request. Your account will <strong>not</strong> be
                deleted immediately. A 24-hour waiting period will
                begin after your request is verified.
              </p>

              <div style="margin: 28px 0;">
                <a
                  href="${verificationUrl}"
                  style="
                    display: inline-block;
                    background: #8c52ff;
                    color: #ffffff;
                    text-decoration: none;
                    padding: 14px 22px;
                    border-radius: 12px;
                    font-weight: 600;
                    font-size: 15px;
                  "
                >
                  Confirm Account Deletion
                </a>
              </div>

              <p style="
                margin: 0 0 12px;
                color: #888888;
                font-size: 13px;
                line-height: 1.6;
              ">
                This verification link expires at:
                ${expiresAtText} UTC.
              </p>

              <p style="
                margin: 20px 0 0;
                color: #888888;
                font-size: 13px;
                line-height: 1.6;
              ">
                If you did not request account deletion, you can
                safely ignore this email and your account will remain
                active.
              </p>

            </div>

            <p style="
              margin: 20px 0 0;
              text-align: center;
              color: #666666;
              font-size: 12px;
            ">
              Anikawa · anikawa.fun
            </p>

          </div>
        </body>
      </html>
    `,
  });

  if (error) {
    throw new Error(`Failed to send account deletion email: ${error.message}`);
  }

  return data;
}
