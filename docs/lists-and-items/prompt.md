# Lists & Items — Initial Prompt

Read CLAUDE.md and PROJECT.md (sections: Core Concepts → Gift List,
Item, Reservation Privacy Modes. Features Brainstorm → Lists & Items).

Add creating gift lists and adding gifts to Podaruj.me.

Creating a list:
- Logged in user clicks "Create list" → opens a form
- Form fields: list name, description, occasion type
  (birthday, holiday, wedding, other), event date (optional),
  privacy mode (Buyer's Choice, Visible, Full Surprise)
  with clear explanation of each mode
- After creating → user lands on the list detail page

List detail page (owner view):
- Shows list info: name, description, occasion, date with countdown
  if date is set, privacy mode badge
- Edit and delete list options
- List of gifts with option to add, edit, reorder, remove
- Share button (just placeholder for now)

Adding gifts to a list:
- "Add gift" button → opens form
- Fields: name (required), description, link to store (optional),
  price (optional), image (optional), priority level
- Gift can be a specific product or just a suggestion
  like "a book about gardening"
- Drag and drop to reorder gifts by priority

Store everything in Supabase with proper database tables.
Keep the same warm, friendly design with nice animations.

Save initial prompt to docs/lists-and-items/prompt.md.
Follow Superpowers workflow and End of Task Checklist from CLAUDE.md.
