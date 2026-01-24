import { sendApplicationEmail } from "./mail.js";

function buildVerifyLayoutEmail({
  logoUrl,
  brandName = "Brand",
  greeting = "Hello,",
  paragraph1 = "Paragraph 1",
  paragraph2 = "Paragraph 2",
  linkUrl,
  linkText,
  buttonUrl,
  buttonText = "Button",
  footerLeft = "Brand",
  footerRight = "All Rights Reserved",
}) {
  const safeLinkText = linkText || linkUrl;

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
</head>
<body style="margin:0;padding:0;background:#ffffff;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#ffffff;">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0"
               style="width:600px;max-width:600px;background:#ffffff;">
          <!-- Logo -->
          <tr>
            <td align="center" style="padding:10px 24px 18px 24px;">
              ${logoUrl ? `<img src="${logoUrl}" alt="${brandName}" width="220" style="display:block;border:0;outline:none;text-decoration:none;height:auto;">` : ""}
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td align="center" style="padding:10px 24px 0 24px;font-family:Arial,Helvetica,sans-serif;color:#111827;">
              <p style="margin:0;font-size:16px;line-height:1.6;">${greeting}</p>
            </td>
          </tr>

          <!-- Paragraphs -->
          <tr>
            <td align="center" style="padding:14px 24px 0 24px;font-family:Arial,Helvetica,sans-serif;color:#111827;">
              <p style="margin:0 auto;font-size:16px;line-height:1.6;max-width:520px;">${paragraph1}</p>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:14px 24px 0 24px;font-family:Arial,Helvetica,sans-serif;color:#111827;">
              <p style="margin:0 auto;font-size:16px;line-height:1.6;max-width:520px;">${paragraph2}</p>
            </td>
          </tr>

          <!-- Link line -->
          <tr>
            <td align="center" style="padding:18px 24px 0 24px;font-family:Arial,Helvetica,sans-serif;color:#111827;">
              <p style="margin:0;font-size:16px;line-height:1.6;">
                <span> </span>
                <a href="${linkUrl}" target="_blank" style="color:#2563eb;text-decoration:underline;">${safeLinkText}</a>
              </p>
            </td>
          </tr>

          <!-- Or -->
          <tr>
            <td align="center" style="padding:18px 24px 0 24px;font-family:Arial,Helvetica,sans-serif;color:#111827;">
              <p style="margin:0;font-size:16px;line-height:1.6;">Or</p>
            </td>
          </tr>

          <!-- Button intro (optional line) -->
          <tr>
            <td align="center" style="padding:12px 24px 0 24px;font-family:Arial,Helvetica,sans-serif;color:#111827;">
              <p style="margin:0;font-size:16px;line-height:1.6;"> </p>
            </td>
          </tr>

          <!-- CTA button -->
          <tr>
            <td align="center" style="padding:18px 24px 18px 24px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                <tr>
                  <td bgcolor="#f59e0b" style="border-radius:6px;">
                    <a href="${buttonUrl}" target="_blank"
                       style="display:inline-block;padding:12px 18px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:#111827;text-decoration:none;">
                      ${buttonText}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer line -->
          <tr>
            <td align="left" style="padding:26px 24px 0 24px;font-family:Arial,Helvetica,sans-serif;color:#111827;">
              <p style="margin:0;font-size:14px;line-height:1.6;">
                <span style="text-decoration:underline;">${footerLeft} © ${new Date().getFullYear()}</span>
                <span> | </span>
                <span style="text-decoration:underline;">${footerRight}</span>
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

// Ejemplo de envío (rellena con tu contenido real)
const html = buildVerifyLayoutEmail({
  logoUrl: "https://tu-dominio.com/logo.png",
  brandName: "Amazon",
  greeting: "Hola,",
  paragraph1: "Texto 1",
  paragraph2: "Texto 2",
  linkUrl: "https://tu-dominio.com/verify",
  linkText: "tu-dominio.com/verify",
  buttonUrl: "https://tu-dominio.com/verify",
  buttonText: "Verificar email",
  footerLeft: "Tu App",
  footerRight: "All Rights Reserved",
});

const info = await sendApplicationEmail({
  to: "amazontechnetwork@gmail.com",
  subject: "Verificación",
  text: "Abre el enlace para continuar: https://tu-dominio.com/verify",
  html,
});

console.log("messageId:", info.messageId);
console.log("accepted:", info.accepted);
console.log("rejected:", info.rejected);
