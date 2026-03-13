# Auth Feature — Initial Prompt

Read CLAUDE.md and PROJECT.md (section: Access Model).

Add login system to Podaruj.me using Supabase.

Users can sign up and log in by entering their email — they receive a magic link (no passwords). After clicking the link they land on their dashboard.

People who receive a shared list link can browse it without logging in. If they want to reserve a gift, they just enter a nickname. Show them a gentle suggestion to create an account for easier access next time.

Pages like dashboard and my lists should only be visible to logged in users. If someone tries to access them without logging in, redirect to sign in page.

Update the landing page navigation — "Create list" and "Get Started" should go to sign in if not logged in, or dashboard if logged in. When logged in, show user menu with email and sign out option.

Create a user profile table in the database linked to auth.

Keep the same warm, friendly design from the landing page. Dashboard page can be empty for now — just a welcome message.

Custom magic link email with Podaruj.me logo and warm colors.
