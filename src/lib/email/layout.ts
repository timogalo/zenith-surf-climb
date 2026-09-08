import "server-only";

// Shared minimal HTML shell for transactional emails — restrained Zenith
// branding (navy header, warm-white background), no email framework, kept
// readable in plain/text clients by always pairing this with a text/
// version at the call site.

export function renderEmailLayout(bodyHtml: string): string {
  return `<div style="font-family:Arial,Helvetica,sans-serif;background:#F8F7F3;padding:32px 16px;">
  <div style="max-width:520px;margin:0 auto;background:#FFFFFF;border-radius:4px;overflow:hidden;">
    <div style="background:#102A43;padding:20px 28px;">
      <p style="margin:0;color:#F8F7F3;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;opacity:0.75;">Zenith Surf &amp; Climb</p>
    </div>
    <div style="padding:28px;color:#102A43;font-size:15px;line-height:1.6;">
      ${bodyHtml}
    </div>
  </div>
</div>`;
}

export type EmailContent = { subject: string; html: string; text: string };

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
