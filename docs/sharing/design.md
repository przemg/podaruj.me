# Sharing Options — Design Spec

**Date:** 2026-03-15
**Feature:** Add sharing options (copy link, email, QR code) to dashboard list detail page

## Overview

Enhance the existing share button on the list detail page (owner view) with a popover offering three sharing methods: copy link, share via email (mailto), and QR code generation.

## Current State

- Single "Share" pill button in `list-header.tsx` copies public URL to clipboard
- No email or QR sharing exists
- Button only appears for published lists (not drafts)

## Design

### UI: Share Popover

The existing "Share" pill button becomes a **Popover trigger** (shadcn/ui `Popover`). Clicking it opens a popover with three rows:

1. **Copy link** — `Link` icon + "Copy link" label. Copies `/{locale}/lists/{slug}` to clipboard. Shows checkmark + "Copied!" for 2 seconds.
2. **Share via email** — `Mail` icon + "Share via email". Opens `mailto:` link with pre-filled subject and body.
3. **QR Code** — `QrCode` icon + "QR Code". Opens a Dialog modal.

Each row is a button styled as a hover-able list item (ghost style, full width, left-aligned with icon).

### Mailto Content

**English:**
- Subject: `Check out my gift list on Podaruj.me!`
- Body: `Hey! I made a gift list for {occasion}. Check it out and reserve something:\n\n{url}`

**Polish:**
- Subject: `Sprawdź moją listę prezentów na Podaruj.me!`
- Body: `Hej! Stworzyłem/am listę prezentów na {occasion}. Sprawdź ją i zarezerwuj coś:\n\n{url}`

### QR Code Dialog

A shadcn/ui `Dialog` containing:
- QR code rendered client-side using the `qrcode` npm package (`QRCode.toCanvas()`)
- QR encodes the full public URL: `{origin}/{locale}/lists/{slug}`
- "Podaruj.me" branding text rendered below the QR code on the canvas
- Two action buttons below:
  - **Download PNG** — converts canvas to blob, triggers download as `{list-name}-qr.png`
  - **Print** — opens browser print dialog focused on the QR code

### Component Structure

- `src/components/lists/share-popover.tsx` — Popover with 3 sharing options ("use client")
- `src/components/lists/qr-code-dialog.tsx` — QR code modal with download/print ("use client")
- `src/components/lists/list-header.tsx` — Updated to use SharePopover instead of inline share button

### i18n Keys

New keys under `lists.detail.share`:
- `copyLink` / `linkCopied` — Copy link button states
- `shareEmail` — Email button label
- `qrCode` — QR button label
- `qrTitle` — QR dialog title
- `qrDownload` — Download button label
- `qrPrint` — Print button label
- `emailSubject` / `emailBody` — Mailto content templates

### Dependencies

- `qrcode` npm package (MIT, lightweight, canvas-based QR generation)

### PROJECT.md Updates

- Replace "Email invitations with magic link" invitation path with "Email sharing via mailto" approach
- Clarify QR code is now implemented as a sharing feature

## Constraints

- Share popover only shows for published lists (same as current share button)
- All QR generation is client-side — no server calls needed
- Mobile-first: popover and dialog must work well on small screens
