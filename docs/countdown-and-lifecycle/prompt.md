# Countdown & List Lifecycle — Initial Prompt

Read CLAUDE.md and PROJECT.md (sections: Features Brainstorm → List Lifecycle, Event countdown).

Two connected features: event countdown and list closing with summary.

## COUNTDOWN

For lists that have an event date set, show an animated countdown displaying days, hours, minutes until the event. Show it on the list detail page (both owner and guest view). The countdown should feel exciting and festive — not just plain numbers. Animated, matching the warm Podaruj.me design. Also show a small countdown badge on list cards in the dashboard. When the event date passes, the countdown changes to "This event has passed."

## LIST CLOSING

A list can be Active or Closed. List closes automatically when the event date passes. Owner can also close a list manually at any time. Owner can reopen a closed list if needed.

When a list is closed:
- No new reservations allowed
- Existing reservations are preserved
- Guests see a message like "This event has passed" or "This list is closed"
- The list stays visible as an archive — not deleted
- On the dashboard, closed lists are visually different (greyed out, badge, or separate section)

## SUMMARY AFTER CLOSING

When a list is closed, show a celebratory summary card: how many items were reserved out of total, who reserved what (names or "anonymous" depending on mode).

In Buyer's Choice and Visible modes — summary shows immediately.

In Full Surprise mode — owner first sees a confirmation dialog: "Your list had a Full Surprise mode. Do you want to reveal who reserved your gifts?" Only after confirming they see the full summary with names.

The summary should feel celebratory — like opening presents. Nice animations, maybe confetti effect.

Owner can still view all details and summary of a closed list at any time.

Keep the warm, friendly design. Also update PROJECT.md if needed.

## ADDITIONAL FIX — Old links must keep working after any list change

When the owner edits the list name or changes the privacy mode, the shareable link slug might change. People who received the old link must still be able to find the list. Keep a history of old slugs and redirect them to the current URL. Old links should never break — no matter what the owner changes on the list.

## ADDITIONAL FIX — Delete list confirmation with close suggestion

When the owner clicks "Delete list", don't delete immediately. Show a confirmation dialog that suggests closing instead: "Are you sure you want to permanently delete this list? All items and reservations will be lost. If you just want to stop accepting reservations, you can close the list instead." Two options: "Close list" (safer) and "Delete permanently" (destructive, red). This way users don't accidentally lose data when they just wanted to archive.

Save initial prompt to docs/countdown-and-lifecycle/prompt.md.
Follow Superpowers workflow and End of Task Checklist from CLAUDE.md.
