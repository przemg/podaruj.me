# Animated Demo — Initial Prompt

Create an animated HTML marketing demo showing how Podaruj.me works. This is NOT real screenshots — it's a stylized, simplified animation of the user flow. Think of it like an animated explainer you'd see on a SaaS landing page.

The animation should auto-loop through these scenes with smooth transitions:

1. LANDING — Simplified phone mockup showing the Podaruj.me landing page with the tagline. Quick scroll through it.

2. CREATE LIST — User types a list name ("Birthday Gifts 2026"), picks an occasion (Birthday), selects privacy mode (Buyer's Choice). A list card appears.

3. ADD GIFTS — Items drop in one by one with a nice animation: "Wireless Headphones", "Book about space", "Coffee machine". Show drag handle to hint at reordering.

4. SHARE — The share button is clicked. Three options animate in: copy link, email, QR code. A QR code pops up briefly.

5. GUEST VIEW — Scene switches to a different "phone" or color to show guest perspective. Guest sees the gift list, clicks reserve on "Wireless Headphones", enters nickname "Ania", item gets a checkmark with "Reserved" badge.

6. PRIVACY MODES — Quick visual showing three modes side by side: Buyer's Choice (question mark on name), Visible (name shown), Full Surprise (everything hidden from owner).

7. COUNTDOWN & CLOSE — A countdown timer ticks down (3 days... 2 days... 1 day...), list closes, confetti animation, summary card appears: "2 of 3 gifts reserved!"

8. END — Podaruj.me logo with tagline "Gift lists made simple" and a CTA feel.

Style:
- Inspired by Podaruj.me design (pastels, rounded corners, warm colors) but simplified for clarity — this is a marketing demo, not a pixel-perfect replica. Prioritize clear storytelling over accuracy.
- Phone mockup frame (mobile first vibe)
- Smooth CSS animations between scenes, no heavy JS libraries
- Auto-playing infinite loop with a short pause at the end before restarting
- Clean, minimal — less is more, don't overcrowd scenes
- Each scene visible for 3-4 seconds
- Total loop: about 30-40 seconds

Output as a single HTML file. Also try to generate a GIF version if possible (using canvas capture or similar).

Save to public/demo/ folder.
