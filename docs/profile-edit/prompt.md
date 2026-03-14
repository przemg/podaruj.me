Read CLAUDE.md and PROJECT.md.

Add a profile settings page for logged in users.

The page should have these sections:

Profile info:
- Display name — editable, prefilled from Google account if signed 
  in with Google
- Email — visible but not editable (read only, greyed out)
- Avatar — from Google account if connected

Connected accounts:
- Show if Google is connected or not
- If not connected — button to link Google account
- If connected — show which Google email is linked

Delete account:
- Big red danger zone section at the bottom
- "Delete my account" button
- Confirmation dialog warning that this will permanently delete 
  all their lists, items, and reservation data
- After deletion — sign out and redirect to landing page

Access settings from the user menu in navigation (where sign out is).

Keep the same warm, friendly design. Danger zone should feel serious 
but not scary.

Also update PROJECT.md — add a "Profile Settings" section to 
Features Brainstorm with these features: editable display name, 
read-only email, avatar from Google, link/unlink Google account, 
delete account with cascade deletion.

Save initial prompt to docs/profile-settings/prompt.md.
Follow Superpowers workflow and End of Task Checklist from CLAUDE.md.
