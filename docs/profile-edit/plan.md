# Profile Settings Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a profile settings page where users can edit their display name, see their email and avatar, check Google account connection status, and delete their account.

**Architecture:** New `/dashboard/settings` route with server actions for profile updates and account deletion. Client component for the settings form with three sections. Uses existing profiles table with RLS.

**Tech Stack:** Next.js 16 App Router, Supabase (Auth + Postgres), Tailwind CSS, shadcn/ui, next-intl, Playwright

---

## File Structure

| Action | File | Responsibility |
|--------|------|---------------|
| Create | `src/app/[locale]/dashboard/settings/page.tsx` | Settings page (server component, fetches profile data) |
| Create | `src/app/[locale]/dashboard/settings/actions.ts` | Server actions: updateDisplayName, deleteAccount |
| Create | `src/components/settings/profile-settings.tsx` | Client component: full settings form with all three sections |
| Create | `src/components/settings/delete-account-dialog.tsx` | Client component: delete confirmation dialog |
| Modify | `src/components/auth/user-menu.tsx` | Add "Settings" link between "Dashboard" and "Sign out" |
| Modify | `messages/en.json` | Add `settings` namespace translations |
| Modify | `messages/pl.json` | Add `settings` namespace translations |
| Modify | `PROJECT.md` | Add Profile Settings to Features Brainstorm |
| Create | `e2e/settings.spec.ts` | E2E tests for profile settings page |

---

### Task 1: Add i18n translations

**Files:**
- Modify: `messages/en.json`
- Modify: `messages/pl.json`

- [ ] **Step 1: Add settings namespace to EN translations**

Add to `messages/en.json` after the `"dashboard"` section:

```json
"settings": {
  "pageTitle": "Settings — Podaruj.me",
  "title": "Profile settings",
  "subtitle": "Manage your account and preferences",
  "profileSection": "Profile info",
  "displayNameLabel": "Display name",
  "displayNamePlaceholder": "Your name",
  "emailLabel": "Email",
  "emailHelp": "Email cannot be changed",
  "avatarAlt": "Profile avatar",
  "saveButton": "Save changes",
  "saving": "Saving...",
  "saveSuccess": "Profile updated!",
  "saveError": "Failed to update profile",
  "connectedAccountsSection": "Connected accounts",
  "googleConnected": "Connected as {email}",
  "googleNotConnected": "Not connected",
  "linkGoogle": "Link Google account",
  "dangerZoneSection": "Danger zone",
  "dangerZoneDescription": "Once you delete your account, there is no going back.",
  "deleteButton": "Delete my account",
  "deleteDialogTitle": "Delete your account?",
  "deleteDialogDescription": "This will permanently delete your account, all your lists, items, and reservation data. This action cannot be undone.",
  "deleteDialogConfirmLabel": "Type DELETE to confirm",
  "deleteDialogConfirmPlaceholder": "DELETE",
  "deleteDialogConfirm": "Delete my account",
  "deleteDialogCancel": "Cancel",
  "deleting": "Deleting..."
}
```

- [ ] **Step 2: Add settings namespace to PL translations**

Add to `messages/pl.json` after the `"dashboard"` section:

```json
"settings": {
  "pageTitle": "Ustawienia — Podaruj.me",
  "title": "Ustawienia profilu",
  "subtitle": "Zarządzaj swoim kontem i preferencjami",
  "profileSection": "Informacje o profilu",
  "displayNameLabel": "Wyświetlana nazwa",
  "displayNamePlaceholder": "Twoje imię",
  "emailLabel": "Email",
  "emailHelp": "Nie można zmienić adresu email",
  "avatarAlt": "Zdjęcie profilowe",
  "saveButton": "Zapisz zmiany",
  "saving": "Zapisywanie...",
  "saveSuccess": "Profil zaktualizowany!",
  "saveError": "Nie udało się zaktualizować profilu",
  "connectedAccountsSection": "Połączone konta",
  "googleConnected": "Połączono jako {email}",
  "googleNotConnected": "Nie połączono",
  "linkGoogle": "Połącz konto Google",
  "dangerZoneSection": "Strefa zagrożenia",
  "dangerZoneDescription": "Po usunięciu konta nie ma możliwości cofnięcia tej operacji.",
  "deleteButton": "Usuń moje konto",
  "deleteDialogTitle": "Usunąć konto?",
  "deleteDialogDescription": "Spowoduje to trwałe usunięcie Twojego konta, wszystkich list, prezentów i danych rezerwacji. Tej operacji nie można cofnąć.",
  "deleteDialogConfirmLabel": "Wpisz DELETE aby potwierdzić",
  "deleteDialogConfirmPlaceholder": "DELETE",
  "deleteDialogConfirm": "Usuń moje konto",
  "deleteDialogCancel": "Anuluj",
  "deleting": "Usuwanie..."
}
```

- [ ] **Step 3: Add "Settings" to user menu translations**

In both `en.json` and `pl.json`, add `"settings": "Settings"` / `"settings": "Ustawienia"` to the `auth.userMenu` namespace.

- [ ] **Step 4: Commit**

```bash
git add messages/en.json messages/pl.json
git commit -m "feat: add i18n translations for profile settings"
```

---

### Task 2: Add "Settings" link to user menu

**Files:**
- Modify: `src/components/auth/user-menu.tsx`

- [ ] **Step 1: Add Settings icon import**

Add `Settings` to the lucide-react import in `user-menu.tsx`.

- [ ] **Step 2: Add Settings menu item**

Add a new button between the "Dashboard" button and the divider:

```tsx
<button
  onClick={() => {
    router.push("/dashboard/settings");
    setIsOpen(false);
  }}
  className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-landing-text-muted transition-colors hover:bg-landing-peach-wash hover:text-landing-text"
  role="menuitem"
>
  <Settings className="h-4 w-4" />
  {t("settings")}
</button>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/auth/user-menu.tsx
git commit -m "feat: add settings link to user menu"
```

---

### Task 3: Create server actions

**Files:**
- Create: `src/app/[locale]/dashboard/settings/actions.ts`

- [ ] **Step 1: Create settings actions file**

Create `src/app/[locale]/dashboard/settings/actions.ts` with:

1. `updateDisplayName(displayName: string)` — validates (trim, 1-50 chars), updates profiles table, returns `{ error?: string }` or `{ success: true }`
2. `deleteAccount()` — gets authenticated user, creates a service role Supabase client using `SUPABASE_SERVICE_ROLE_KEY` env var, calls `supabase.auth.admin.deleteUser(userId)` which cascades via FK to delete profile/lists/items, returns `{ error?: string }` or `{ success: true }`

Follow the same pattern as `lists/actions.ts`: use `getAuthenticatedClient()` helper, validate input, return `ActionResult`.

For `deleteAccount`, use `createClient` from `@supabase/supabase-js` (not SSR) with the service role key to call `auth.admin.deleteUser()`.

- [ ] **Step 2: Commit**

```bash
git add src/app/[locale]/dashboard/settings/actions.ts
git commit -m "feat: add server actions for profile update and account deletion"
```

---

### Task 4: Create the delete account dialog component

**Files:**
- Create: `src/components/settings/delete-account-dialog.tsx`

- [ ] **Step 1: Create delete-account-dialog component**

Client component with:
- Props: `onConfirm: () => void`, `isDeleting: boolean`
- Uses shadcn `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`
- Controlled `Input` where user types "DELETE"
- Confirm button disabled until input === "DELETE"
- Confirm button shows "Deleting..." when `isDeleting` is true
- Cancel button closes dialog
- Uses `useTranslations("settings")` for all text
- Red styling for the confirm button using `variant="destructive"`

- [ ] **Step 2: Commit**

```bash
git add src/components/settings/delete-account-dialog.tsx
git commit -m "feat: add delete account confirmation dialog"
```

---

### Task 5: Create the profile settings component

**Files:**
- Create: `src/components/settings/profile-settings.tsx`

- [ ] **Step 1: Create profile-settings component**

Client component (`"use client"`) with props:
```typescript
{
  profile: { display_name: string | null; avatar_url: string | null };
  email: string;
  googleEmail: string | null; // null if not connected
}
```

Three sections in a single-column layout:

**Section 1 — Profile Info:**
- Avatar circle (image if `avatar_url` exists, initials fallback otherwise)
- Display name `Input` with save `Button`
- Email read-only `Input` (disabled) with helper text
- Calls `updateDisplayName` server action on save
- Shows success/error feedback

**Section 2 — Connected Accounts:**
- Google row with icon, status text, and optional "Link" button
- Link button calls `supabase.auth.linkIdentity({ provider: "google" })` (client-side)

**Section 3 — Danger Zone:**
- Red-bordered card
- Description text + "Delete my account" button
- Opens `DeleteAccountDialog`
- On confirm, calls `deleteAccount` server action
- On success, signs out and redirects to landing page

Uses `useTranslations("settings")` for all text.

- [ ] **Step 2: Commit**

```bash
git add src/components/settings/profile-settings.tsx
git commit -m "feat: add profile settings component"
```

---

### Task 6: Create the settings page

**Files:**
- Create: `src/app/[locale]/dashboard/settings/page.tsx`

- [ ] **Step 1: Create settings page**

Server component that:
1. Gets authenticated user via `supabase.auth.getUser()`
2. Fetches profile from `profiles` table
3. Extracts Google email from `user.identities` (look for provider === "google")
4. Passes data to `<ProfileSettings />` client component
5. Includes `generateMetadata` for page title

Layout pattern matches `dashboard/page.tsx`:
```tsx
<main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
  <h1>...</h1>
  <p>...</p>
  <ProfileSettings ... />
</main>
```

- [ ] **Step 2: Commit**

```bash
git add src/app/[locale]/dashboard/settings/page.tsx
git commit -m "feat: add profile settings page"
```

---

### Task 7: Update PROJECT.md

**Files:**
- Modify: `PROJECT.md`

- [ ] **Step 1: Add Profile Settings section**

Add a "Profile Settings" section to the Features Brainstorm area with:
- Editable display name
- Read-only email display
- Avatar from Google
- Link/unlink Google account
- Delete account with cascade deletion

- [ ] **Step 2: Commit**

```bash
git add PROJECT.md
git commit -m "docs: add profile settings to PROJECT.md features"
```

---

### Task 8: Write E2E tests

**Files:**
- Create: `e2e/settings.spec.ts`

- [ ] **Step 1: Write E2E tests**

Tests to cover:
1. Settings page loads and shows profile info section
2. Settings page accessible from user menu
3. Display name input is editable
4. Email input is read-only/disabled
5. Danger zone section is visible
6. Delete dialog opens and requires "DELETE" typed
7. Delete confirm button is disabled until "DELETE" is typed
8. Polish locale works for settings page

Use existing mock patterns from `e2e/helpers/mock-supabase.ts`. Mock auth session for protected page access.

- [ ] **Step 2: Run tests**

```bash
npx playwright test e2e/settings.spec.ts
```

- [ ] **Step 3: Commit**

```bash
git add e2e/settings.spec.ts
git commit -m "test: add E2E tests for profile settings"
```

---

### Task 9: Final verification

- [ ] **Step 1: Run type check**

```bash
npx tsc --noEmit
```

- [ ] **Step 2: Run linter**

```bash
npm run lint
```

- [ ] **Step 3: Run all E2E tests**

```bash
npx playwright test
```

- [ ] **Step 4: Fix any failures and re-run**

- [ ] **Step 5: Commit any fixes**
