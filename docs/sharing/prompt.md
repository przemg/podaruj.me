# Sharing Options Feature — Initial Prompt

Add sharing options to the list detail page (owner view).

In the share section, add these buttons:
- "Copy link" — copies the shareable URL to clipboard (already exists?)
- "Share via email" — opens the user's email client (mailto:) with
  a pre-filled subject and body containing the list name, a short
  friendly message, and the link to the list
- "QR Code" — generates a QR code for the list URL, shows it in
  a nice modal with options to download as PNG or print.
  QR code should have Podaruj.me branding if possible.

The mailto message should feel friendly, like:
"Hey! I made a gift list for [occasion]. Check it out and reserve
something: [link]"

Also update PROJECT.md — replace email invitations with mailto
approach and add QR code to sharing features.

Save initial prompt to docs/sharing/prompt.md.
Follow Superpowers workflow and End of Task Checklist from CLAUDE.md.
