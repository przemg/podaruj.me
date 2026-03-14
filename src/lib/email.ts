import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.EMAIL_FROM || "Podaruj.me <noreply@podaruj.me>";

type SendConfirmationEmailParams = {
  to: string;
  itemName: string;
  listName: string;
  confirmUrl: string;
  manageUrl: string;
  locale: string;
};

export async function sendConfirmationEmail({
  to,
  itemName,
  listName,
  confirmUrl,
  manageUrl,
  locale,
}: SendConfirmationEmailParams) {
  const isPl = locale === "pl";

  const subject = isPl
    ? "Potwierdź rezerwację prezentu na Podaruj.me"
    : "Confirm your gift reservation on Podaruj.me";

  const html = buildConfirmationHtml({
    itemName,
    listName,
    confirmUrl,
    manageUrl,
    isPl,
  });

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html,
  });
}

function buildConfirmationHtml({
  itemName,
  listName,
  confirmUrl,
  manageUrl,
  isPl,
}: {
  itemName: string;
  listName: string;
  confirmUrl: string;
  manageUrl: string;
  isPl: boolean;
}) {
  const heading = isPl
    ? "Potwierdź swoją rezerwację"
    : "Confirm your reservation";
  const body = isPl
    ? `Zarezerwowałeś(aś) <strong>${escapeHtml(itemName)}</strong> z listy <strong>${escapeHtml(listName)}</strong>.`
    : `You reserved <strong>${escapeHtml(itemName)}</strong> from the list <strong>${escapeHtml(listName)}</strong>.`;
  const confirmLabel = isPl ? "Potwierdź rezerwację" : "Confirm reservation";
  const cancelLabel = isPl ? "Anuluj rezerwację" : "Cancel reservation";
  const expiry = isPl
    ? "Ten link wygasa za 24 godziny."
    : "This link expires in 24 hours.";

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
      <h2 style="color: #1a1a1a; margin-bottom: 16px;">${heading}</h2>
      <p style="line-height: 1.6; margin-bottom: 20px;">${body}</p>
      <a href="${confirmUrl}" style="display: inline-block; background: #e8816d; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-bottom: 12px;">${confirmLabel}</a>
      <p style="margin-top: 16px; font-size: 14px; color: #666;">${expiry}</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
      <p style="font-size: 13px; color: #999;">
        <a href="${manageUrl}" style="color: #e8816d;">${cancelLabel}</a>
      </p>
    </body>
    </html>
  `;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
