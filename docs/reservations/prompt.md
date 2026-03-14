# Reservations Feature — Initial Prompt

Read CLAUDE.md and PROJECT.md (sections: Core Concepts → Reservation
Privacy Modes, Features Brainstorm → Reservations).

Add gift reservations to Podaruj.me.

When someone opens a shared list:
- Each gift has a "Reserve" button
- If logged in — reservation is linked to their account
- If guest — they enter a nickname before reserving
- After reserving, the button changes to "Reserved" with option
  to cancel their own reservation

Privacy modes (set by list owner when creating the list):

Buyer's Choice — the person reserving decides if they want to show
their name to the list owner or stay anonymous. Show a toggle
"Show my name to the list owner" when reserving.

Visible — everyone sees who reserved what. No choice, names
are always shown.

Full Surprise — the list owner doesn't see ANY reservation status.
Items look completely unreserved to them. Other guests can still
see what's already reserved to avoid duplicates.

Make sure the owner view respects the privacy mode — in Full Surprise
mode the owner must not see any hints that something is reserved.

Update the dashboard "My Reservations" tab to show real reservation
data now.

Also update PROJECT.md if needed.

Save initial prompt to docs/reservations/prompt.md.
Follow Superpowers workflow and End of Task Checklist from CLAUDE.md.
