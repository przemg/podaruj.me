Read CLAUDE.md and PROJECT.md. Use the frontend-design skill for UI quality.

Fix all of these issues. No new features — only fixes.

1. CLOSED LIST STILL ALLOWS ADDING ITEMS: When a list is closed, the owner can still add new gifts. Block this — hide or disable the "Add gift" button on closed lists. Show a message like "This list is closed. Reopen it to add more gifts."

2. REOPEN BUTTON MISSING AFTER EVENT DATE: When the event date has passed and the list auto-closed, there is no way to reopen it. Add a "Reopen list" button for the owner, with a note explaining that the event date has passed but they can still reopen if needed.

3. MOBILE LAYOUT — LIST DETAIL CARD TOO CRAMPED: On mobile the list detail card has too many elements squeezed into a small space (badges, privacy mode info, share button, edit/delete/reopen actions). Fix the layout:
   - Badges (closed, occasion, countdown) should wrap nicely on multiple lines
   - Action buttons (share, edit, delete, reopen) should be laid out in two rows instead of one cramped line
   - The share button must always show its full label text, never truncated — even on the smallest screens
   - Give everything enough breathing room — padding, spacing between elements
   - Test on 320px and 375px width screens

4. CONFETTI SHOWS EVERY TIME: Confetti and celebration animation should only play ONCE per list closing, tracked in the database. If the owner refreshes, navigates away and comes back, or opens on another device — no confetti, just the summary. When the owner reopens a closed list, reset the flag — so next time the list closes, confetti plays once more.
   - List closes → owner opens → confetti plays → flag saved as "shown"
   - Owner refreshes or opens on phone → no confetti, just summary
   - Owner reopens list → flag reset
   - List closes again → confetti plays once → flag saved again

5. LANDING PAGE ANIMATIONS TOO SLOW AND LAGGY: The features section (dark background) and everything below it appears too late when scrolling. Even when scrolling fast past the section and then scrolling back up, the content still appears with a delay. This might be a performance issue — the animation library or scroll observer could be too heavy or triggering too late. Make scroll-triggered animations start much earlier (trigger well before the section enters the viewport). Consider using simple CSS animations instead of heavy JS libraries if performance is the problem. All sections should already be visible by the time the user scrolls to them — no waiting, no empty space.

6. SURNAME AND NAME DECLENSION BUG: In the footer it says "Stworzone przez Przemysława Gwóźdź" — both the first name and surname should never be grammatically declined. It should be "Stworzone przez Przemysław Gwóźdź" or better yet rephrase to avoid declension entirely, e.g. "Autor: Przemysław Gwóźdź". Check all places where a user's display name is shown and make sure names are used as-is, without any Polish grammatical declension applied.

7. FOOTER — GITHUB AND LINKEDIN LINKS HARD TO TAP ON MOBILE: The GitHub and LinkedIn icons in the footer ("Stworzone przez Przemysława Gwóźdź") are tiny and barely visible on mobile. On mobile, display them on separate lines with full text labels (e.g. "GitHub" and "LinkedIn") — not just icons. Make them easy to tap. On desktop they can stay as they are if they already have labels, but make sure icons have enough contrast to be visible on the dark footer background.

8. CONTENT WIDTH INCONSISTENCY: Pages have different content widths and it looks messy. Create a central, reusable system for content widths (one place to change, used everywhere). The widths should be:
   - Landing page: all sections including header and footer max 1440px, centered
   - Dashboard/app header: max 1440px, centered
   - Dashboard content (lists, reservations): max 1024px, centered
   - Forms and settings pages (create list, edit list, profile settings): max 800px, centered
   Define these as reusable layout components or constants so they are easy to change in the future from one place. Apply them across the entire app.

9. MOBILE STICKY HEADER ISSUES: On mobile the sticky header sits too close to the top edge — the logo and content get hidden under the browser's toolbar/address bar. Add enough top padding or safe area inset so the header content is always fully visible, even when the browser toolbar is showing. Also the header background color should use the app's brand color from the design system, not a generic/dark color. Make sure this is consistent across landing page, dashboard, and all other pages.

Fix all of these, test on mobile (375px). Don't add any new features.

Also update PROJECT.md if needed.

Save initial prompt to docs/bugfixes-round/prompt.md.
Follow Superpowers workflow and End of Task Checklist from CLAUDE.md.
