# Sharing Options Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add share popover with copy link, mailto email sharing, and QR code generation to the dashboard list detail page.

**Architecture:** Replace the inline share button in `ListHeader` with a `SharePopover` component containing three options. QR code generation uses the `qrcode` npm package client-side, displayed in a `QrCodeDialog` modal with download/print actions.

**Tech Stack:** Next.js 16, shadcn/ui (Popover, Dialog), `qrcode` npm package, next-intl, Tailwind CSS

---

### Task 1: Install `qrcode` dependency

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install qrcode and its types**

```bash
npm install qrcode && npm install -D @types/qrcode
```

- [ ] **Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add qrcode dependency for QR code generation"
```

---

### Task 2: Add i18n translation keys

**Files:**
- Modify: `messages/en.json` — add `lists.detail.share.*` keys
- Modify: `messages/pl.json` — add `lists.detail.share.*` keys

- [ ] **Step 1: Add English translations**

Add under `lists.detail` in `messages/en.json`:

```json
"share": {
  "copyLink": "Copy link",
  "linkCopied": "Copied!",
  "shareEmail": "Share via email",
  "qrCode": "QR Code",
  "qrTitle": "QR Code",
  "qrDownload": "Download PNG",
  "qrPrint": "Print",
  "emailSubject": "Check out my gift list on Podaruj.me!",
  "emailBody": "Hey! I made a gift list for {occasion}. Check it out and reserve something:\n\n{url}"
}
```

- [ ] **Step 2: Add Polish translations**

Add under `lists.detail` in `messages/pl.json`:

```json
"share": {
  "copyLink": "Kopiuj link",
  "linkCopied": "Skopiowano!",
  "shareEmail": "Udostępnij mailem",
  "qrCode": "Kod QR",
  "qrTitle": "Kod QR",
  "qrDownload": "Pobierz PNG",
  "qrPrint": "Drukuj",
  "emailSubject": "Sprawdź moją listę prezentów na Podaruj.me!",
  "emailBody": "Hej! Stworzyłem listę prezentów na {occasion}. Sprawdź i zarezerwuj coś:\n\n{url}"
}
```

- [ ] **Step 3: Commit**

```bash
git add messages/en.json messages/pl.json
git commit -m "feat: add i18n keys for share popover, email, and QR code"
```

---

### Task 3: Create `QrCodeDialog` component

**Files:**
- Create: `src/components/lists/qr-code-dialog.tsx`

- [ ] **Step 1: Create the QR code dialog component**

This is a `"use client"` component that:
- Receives `open`, `onOpenChange`, `url`, and `listName` props
- Uses shadcn `Dialog` to show a modal
- On open, renders a QR code to a `<canvas>` element using `QRCode.toCanvas()` from the `qrcode` package
- Shows "Podaruj.me" branding text below the canvas
- Has two buttons: "Download PNG" and "Print"
- Download: converts canvas to blob via `canvas.toBlob()`, creates an object URL, triggers download as `{listName}-qr.png`
- Print: opens `window.print()` — the dialog content is print-friendly

Key implementation details:
- Use `useEffect` to draw QR code when dialog opens
- Use `useRef` for the canvas element
- QR code options: `width: 280`, `margin: 2`, `color: { dark: '#1a1a2e', light: '#ffffff' }`
- Use `useTranslations("lists.detail.share")` for labels

- [ ] **Step 2: Verify it compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/lists/qr-code-dialog.tsx
git commit -m "feat: add QR code dialog with download and print"
```

---

### Task 4: Create `SharePopover` component

**Files:**
- Create: `src/components/lists/share-popover.tsx`

- [ ] **Step 1: Create the share popover component**

This is a `"use client"` component that:
- Receives `list` (with `slug`, `name`, `occasion`) and `locale` props
- Uses shadcn `Popover` as the container
- Trigger is the existing share pill button (coral accent style, `Share2` icon)
- Popover content has 3 rows, each a full-width ghost button with icon + label:

1. **Copy link** (`Link` icon): Copies `${window.location.origin}/${locale}/lists/${list.slug}` to clipboard. Shows checkmark + "Copied!" for 2 seconds.
2. **Share via email** (`Mail` icon): Constructs a `mailto:` URL with subject and body from i18n (occasion name inserted via `tOccasions(list.occasion)`), then sets `window.location.href` to it.
3. **QR Code** (`QrCode` icon): Opens the `QrCodeDialog`.

- Uses `useTranslations("lists.detail.share")` and `useTranslations("lists.occasions")` for labels
- Popover closes after copy link (with delay) and after clicking email

- [ ] **Step 2: Verify it compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/lists/share-popover.tsx
git commit -m "feat: add share popover with copy link, email, and QR options"
```

---

### Task 5: Integrate `SharePopover` into `ListHeader`

**Files:**
- Modify: `src/components/lists/list-header.tsx`

- [ ] **Step 1: Replace inline share button with SharePopover**

In `list-header.tsx`:
- Import `SharePopover` from `./share-popover`
- Remove the `shareCopied` state and the inline share `<button>` (lines ~79, ~204-226)
- In its place, render `<SharePopover list={list} locale={locale} />`
- Remove unused imports: `Share2`, `Check` (if no longer used elsewhere)

- [ ] **Step 2: Verify it compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/lists/list-header.tsx
git commit -m "feat: integrate share popover into list header"
```

---

### Task 6: Update PROJECT.md

**Files:**
- Modify: `PROJECT.md`

- [ ] **Step 1: Update sharing section**

In PROJECT.md:
- Under "Gift List" features, change `Shareable link, email invitations, QR code` to `Shareable link, email sharing (mailto), QR code`
- Replace the "Email invitation" path (lines ~50-55) with a simpler "Email sharing" path describing the mailto approach: owner clicks "Share via email", email client opens with pre-filled friendly message and link
- Keep the "Link / QR invitation" path as-is

- [ ] **Step 2: Commit**

```bash
git add PROJECT.md
git commit -m "docs: update PROJECT.md with mailto sharing approach"
```

---

### Task 7: Ensure shadcn Popover component exists

**Files:**
- Possibly create: `src/components/ui/popover.tsx`

- [ ] **Step 1: Check if Popover exists**

```bash
ls src/components/ui/popover.tsx
```

If it doesn't exist, add it via shadcn CLI:

```bash
npx shadcn@latest add popover
```

- [ ] **Step 2: Commit if new file added**

```bash
git add src/components/ui/popover.tsx
git commit -m "chore: add shadcn popover component"
```

---

### Task 8: Write E2E tests

**Files:**
- Create: `e2e/sharing.spec.ts`

- [ ] **Step 1: Write Playwright tests**

Tests should cover:
1. Share button is visible on published list detail page
2. Clicking share button opens popover with 3 options
3. Copy link button copies URL to clipboard (use `page.evaluate` to check clipboard or verify button text changes to "Copied!")
4. Email button has correct mailto href
5. QR Code button opens dialog with canvas and download/print buttons
6. Share button is NOT visible on draft lists
7. Popover closes after interactions

Use existing test patterns from `e2e/publish-mode.spec.ts` for auth setup and navigation.

- [ ] **Step 2: Run tests**

```bash
npx playwright test e2e/sharing.spec.ts
```

- [ ] **Step 3: Commit**

```bash
git add e2e/sharing.spec.ts
git commit -m "test: add E2E tests for sharing options"
```

---

### Task 9: Final verification

- [ ] **Step 1: Run linter and type check**

```bash
npm run lint && npx tsc --noEmit
```

- [ ] **Step 2: Run all E2E tests**

```bash
npx playwright test
```

- [ ] **Step 3: Fix any failures and commit fixes**
