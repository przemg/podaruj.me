# Full Review & Event Time Feature

## Initial Prompt

Read CLAUDE.md, PROJECT.md, and README.md.

Two phases: first code review and updates, then interactive testing with me.

### PHASE 1: REVIEW AND UPDATE (do this first, without asking me)

1. Clean up the code — remove leftover debug stuff, unused code, fix any obvious bugs you find. Make sure privacy modes work correctly everywhere, especially Full Surprise.

2. Update PROJECT.md — compare with actual codebase. Remove features that don't exist, add features that exist but aren't documented. Must match reality.

3. Update README.md — make it professional for portfolio. What the app is, tech stack, how to run locally, link to live version.

4. Update landing page — make sure "How it works", "Features", FAQ all match what the app actually does. Remove or mark fake testimonials. Add any real features missing from the landing page.

5. Check all links work, navigation is consistent, language switching works everywhere.

Fix everything you find, commit it.

### NEW FEATURE — Event time:

Currently lists only have an event date. Add an optional event time field (hours and minutes) alongside the date. If the user sets a time, the countdown should count down to that exact time, not just the day. List closing should also respect the time — if the event is at 18:00, the list stays open until 18:00, not midnight. If no time is set, keep current behavior (closes at end of day).

### PHASE 2: INTERACTIVE TESTING WITH ME (after Phase 1 is done)

After you finish the code review, walk me through testing the app step by step. I will test in my browser and tell you if things work or not.

Create test scenarios covering every feature. Go one by one. For each step tell me exactly what to do.

Cover all areas: Landing page, Sign in, Creating lists, Adding items, Sharing, Guest view, Reservations, Dashboard, Profile settings, List lifecycle, Full Surprise mode, Drag & drop and sorting, Mobile.

After all tests are done, collect everything that failed into a summary list.
