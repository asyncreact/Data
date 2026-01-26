import path from "node:path";
import { fileURLToPath } from "node:url";
import { sendApplicationEmail } from "./mail.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMAGE_CID = "offers";

function buildVerifyLayoutEmail({
  imageUrl,
  title = "Verificación de correo",
  buttonUrl,
  buttonText = "Verificar email",
}) {
  const colorPrimary = "#f97316"; 
  const colorBackground = "#f3f4f6"; 
  const colorCard = "#ffffff";
  const colorTextMain = "#1f2937";
  const colorTextLight = "#6b7280"; 

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    /* Reset básico para clientes de correo */
    body { margin: 0; padding: 0; width: 100%; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
  </style>
</head>
<body style="margin:0; padding:0; background-color:${colorBackground};">
  
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:${colorBackground}; width:100%;">
    <tr>
      <td align="center" style="padding: 40px 10px;">
        
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" 
               style="background-color:${colorCard}; width:100%; max-width:600px; border-radius:8px; overflow:hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          
          <tr>
            <td height="6" style="background-color:${colorPrimary}; font-size:0; line-height:0;">&nbsp;</td>
          </tr>

          <tr>
            <td align="center" style="padding: 30px 40px 10px 40px; font-family: Helvetica, Arial, sans-serif;">
              <p style="margin:0; font-size:12px; text-transform:uppercase; letter-spacing:1px; color:${colorTextLight}; font-weight:600;">
                AMAZON PRIME DAY
              </p>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding: 0 40px 20px 40px; font-family: Helvetica, Arial, sans-serif; color:${colorTextMain};">
              <h1 style="margin:0; font-size:24px; font-weight:700; line-height:1.3;">${title}</h1>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding: 0;">
              <a href="${buttonUrl}" target="_blank" style="text-decoration:none; display:block;">
                <img
                  src="cid:${IMAGE_CID}"
                  alt="Special Deals"
                  width="600"
                  style="display:block; width:100%; max-width:600px; height:auto;"
                />
              </a>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding: 30px 40px 40px 40px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="border-radius: 6px; background-color:${colorPrimary};">
                    <a href="${buttonUrl}" target="_blank" 
                       style="display: inline-block; padding: 14px 32px; font-family: Helvetica, Arial, sans-serif; font-size: 16px; color: #ffffff; font-weight: bold; text-decoration: none; border-radius: 6px; background-color:${colorPrimary}; border: 1px solid ${colorPrimary};">
                      ${buttonText}
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin-top:20px; font-family: Helvetica, Arial, sans-serif; font-size:14px; color:${colorTextLight}; line-height:1.5;">
                Tap the button above to unlock your exclusive benefits today.
              </p>
            </td>
          </tr>

        </table>

        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;">
          <tr>
            <td align="center" style="padding: 20px 0; font-family: Helvetica, Arial, sans-serif; font-size: 12px; color: ${colorTextLight};">
              <p style="margin:0;">© ${new Date().getFullYear()} Amazon. All rights reserved.</p>
              <p style="margin:5px 0 0 0;">
                <a href="#" style="color:${colorTextLight}; text-decoration:underline;">Unsubscribe</a>
                &nbsp;|&nbsp;
                <a href="#" style="color:${colorTextLight}; text-decoration:underline;">Privacy Policy</a>
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}

const imagePath = path.resolve(__dirname, "../assets/unnamed.jpg");

const html = buildVerifyLayoutEmail({
  imageUrl: `cid:${IMAGE_CID}`,
  title: "Prime Day Exclusive Deals",
  buttonUrl: "https://tu-dominio.com/verify",
  buttonText: "Claim Your Reward",
});

const info = await sendApplicationEmail({
  to: "",
  subject: "Your exclusive Prime Day rewards are here",
  text: "Claim your reward and unlock exclusive deals just for you.",
  html,
  attachments: [
    {
      filename: "offers.jpg",
      path: imagePath,       
      cid: IMAGE_CID,        
    },
  ],
});

console.log("messageId:", info.messageId);
console.log("accepted:", info.accepted);
console.log("rejected:", info.rejected);
