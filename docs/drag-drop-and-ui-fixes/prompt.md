# Drag & Drop, Sorting, and Mobile UI Fixes

## Task 1: Drag & Drop Reordering

On the list detail page (owner view), add drag and drop to reorder gift items.

How it works:
- On desktop: each item card has a drag handle icon (grip/dots icon) on the left side. User grabs the handle and drags the item up or down.
- On mobile: same drag handle is visible, but user can also long press anywhere on the card to start dragging.
- While dragging: the card lifts up visually (shadow, slight scale), other cards smoothly shift to make space.
- On drop: new order is saved to database automatically.
- Keep the existing up/down arrow buttons as an alternative way to reorder — but make them bigger and easier to tap on mobile (they are currently too small).

## Task 2: Sorting

On the list detail page, add a dropdown to sort gift items. The dropdown should be placed near the "Gifts" header.

Sort options:
- Custom order (default — the drag & drop / manual order)
- Priority (most wanted first)
- Price: low to high
- Price: high to low
- Name: A-Z
- Date added: newest first
- Date added: oldest first
- Reservation status: available first

When user picks a sort option, items rearrange with a smooth animation. Custom order is the default — this is the order set by drag & drop. When any other sort is active, drag & drop reordering is disabled (grey out the drag handles).

## Task 3: Mobile UI Fixes

a) User dropdown z-index bug: The dropdown menu that appears when clicking on user name (shows "Create new list", "Settings", "Sign out") gets hidden behind other page content. It must always appear on top of everything — fix z-index and overflow issues.

b) Landing page dropdown missing "Dashboard" link: When logged in user is on the landing page and clicks their name, the dropdown shows "Create new list", "Settings", "Sign out" — but there is no link to go to the dashboard. Add "My lists" or "Dashboard" as the first item in this dropdown.

c) Mobile header: The header/navigation on mobile looks messy and broken. Clean it up — logo on the left, hamburger menu icon on the right. Simple and clean, matching the landing page header style.

d) Mobile menu — replace dashboard sidebar: Currently the dashboard has a sidebar that slides from the right on mobile (shows "My lists", "My reservations", "Sign out"). This looks much worse than the landing page mobile menu. Replace it with the same hamburger menu style used on the landing page — full screen overlay or slide-down menu, same animations, same visual quality. The mobile menu must contain these items: My lists, My reservations, Create new list, Settings, Sign out. Currently "Create new list" and "Settings" are missing from the mobile sidebar — add them.

e) Item cards overflow: On mobile, text in gift item cards is cut off / overflows outside the card boundaries. Make sure all text wraps properly and cards look good on small screens (320px - 428px width).

f) Privacy mode tooltip on mobile: The privacy mode badge (e.g. "Buyer's Choice") has a tooltip that only shows on hover. This doesn't work on mobile — there is no hover on touch screens. On mobile, show the privacy mode explanation as always-visible text below the badge instead of a tooltip. On desktop the hover tooltip can stay.

g) Consistency: After all fixes, the mobile experience across landing page, dashboard, and list detail pages should feel like one cohesive app — same menu style, same header, same quality level.

h) Full Surprise privacy mode is permanent: When editing a list, if the list was created with "Full Surprise" mode, the privacy mode selector should be locked/disabled — user cannot change it to another mode. Show a message explaining why: "Full Surprise mode cannot be changed after creation to protect the surprise for gift givers." When creating a new list and selecting Full Surprise, show a warning before saving: "This mode is permanent and cannot be changed later. Are you sure?" The other two modes (Buyer's Choice, Visible) can be freely changed between each other at any time.
