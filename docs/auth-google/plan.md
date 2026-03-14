# Google Auth Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Google OAuth as the primary sign-in method alongside existing magic link, with automatic profile creation from Google account data.

**Architecture:** Supabase OAuth with PKCE flow. Google button in the existing sign-in form triggers `signInWithOAuth`, redirecting through Google consent screen back to the existing `/auth/callback` route. A new DB migration updates the `handle_new_user()` trigger to extract name/avatar from Google metadata.

**Tech Stack:** Next.js 16, Supabase Auth (OAuth), TypeScript, Tailwind CSS, next-intl, Playwright

---

## Chunk 1: Database & i18n (foundation)

### Task 1: Update profile trigger to extract Google metadata

**Files:**
- Create: `supabase/migrations/20260314000000_update_profile_trigger_google.sql`

- [ ] **Step 1: Write the migration SQL**

```sql
-- Update handle_new_user to extract display_name and avatar_url from Google metadata
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name'
    ),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql;
```

This replaces the existing `handle_new_user()` function. For magic link users, `raw_user_meta_data` won't have these fields, so they'll be NULL (same as before). For Google users, Supabase populates `full_name` and `avatar_url` automatically.

- [ ] **Step 2: Apply the migration**

Run: `npx supabase migration up` (or apply via Supabase dashboard)

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260314000000_update_profile_trigger_google.sql
git commit -m "feat(auth): update profile trigger to extract Google metadata"
```

### Task 2: Add i18n translation keys

**Files:**
- Modify: `messages/en.json` — add Google button and separator keys, update subtitle
- Modify: `messages/pl.json` — same

- [ ] **Step 1: Update English translations**

In `messages/en.json`, inside `auth.signIn`, add these keys and update `subtitle`:

```json
"subtitle": "Sign in to manage your gift lists",
"googleButton": "Sign in with Google",
"orContinueWithEmail": "or continue with email",
```

Update `footerNote` to:
```json
"footerNote": "Sign in with Google or a magic link — no password required"
```

- [ ] **Step 2: Update Polish translations**

In `messages/pl.json`, inside `auth.signIn`, add these keys and update `subtitle`:

```json
"subtitle": "Zaloguj się, aby zarządzać listami prezentów",
"googleButton": "Zaloguj się przez Google",
"orContinueWithEmail": "lub kontynuuj przez email",
```

Update `footerNote` to:
```json
"footerNote": "Zaloguj się przez Google lub magiczny link — bez hasła"
```

- [ ] **Step 3: Commit**

```bash
git add messages/en.json messages/pl.json
git commit -m "feat(auth): add i18n keys for Google sign-in"
```

## Chunk 2: Sign-in form UI changes

### Task 3: Add Google sign-in button and separator to sign-in form

**Files:**
- Modify: `src/components/auth/sign-in-form.tsx`

The Google button goes at the top of the form, before the title. The layout becomes:
1. Title + subtitle
2. Google button (large, prominent)
3. Separator ("or continue with email")
4. Existing magic link form

- [ ] **Step 1: Add Google SVG icon component**

Add a small inline Google "G" SVG icon at the top of the file (before the `SignInForm` component). This avoids an external dependency for a single icon:

```tsx
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
```

- [ ] **Step 2: Add `signInWithGoogle` handler**

Inside the `SignInForm` component, after the existing `sendMagicLink` callback, add:

```tsx
const signInWithGoogle = useCallback(async () => {
  const supabase = createClient();
  const next = searchParams.get("next");
  const callbackUrl = new URL(
    `/${locale}/auth/callback`,
    window.location.origin
  );
  if (next) callbackUrl.searchParams.set("next", next);

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl.toString(),
    },
  });

  if (error) {
    setStatus("error");
    setErrorMessage(t("errorGeneric"));
  }
}, [locale, searchParams, t]);
```

- [ ] **Step 3: Update the JSX — add Google button and separator before the form**

In the return statement (the non-success branch), restructure the JSX. Replace the current return block with:

```tsx
return (
  <>
    {/* Title */}
    <div className="mb-8 text-center">
      <h1 className="text-2xl font-bold tracking-tight text-landing-text sm:text-3xl">
        {t("title")}
      </h1>
      <p className="mt-2 text-landing-text-muted">{t("subtitle")}</p>
    </div>

    {/* Google sign-in button */}
    <button
      type="button"
      onClick={signInWithGoogle}
      className="flex w-full items-center justify-center gap-3 rounded-xl border border-landing-text/10 bg-white px-8 py-3.5 font-semibold text-landing-text shadow-sm transition-all hover:bg-gray-50 hover:shadow-md"
    >
      <GoogleIcon className="h-5 w-5" />
      {t("googleButton")}
    </button>

    {/* Separator */}
    <div className="my-6 flex items-center gap-3">
      <div className="h-px flex-1 bg-landing-text/10" />
      <span className="text-sm text-landing-text-muted">
        {t("orContinueWithEmail")}
      </span>
      <div className="h-px flex-1 bg-landing-text/10" />
    </div>

    {/* Error message (show above form, covers both Google and magic link errors) */}
    {errorMessage && (
      <div
        className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700"
        style={{ animation: "fade-in-up 0.3s ease-out" }}
      >
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{errorMessage}</span>
      </div>
    )}

    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (status !== "loading" && cooldown <= 0) {
          sendMagicLink(email);
        }
      }}
    >
      {/* Email input with icon */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <Mail className="h-5 w-5 text-landing-text-muted/40" />
        </div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("emailPlaceholder")}
          required
          className="w-full rounded-xl border border-landing-text/10 bg-white py-3.5 pr-5 pl-12 text-landing-text placeholder:text-landing-text-muted/40 focus:border-landing-coral focus:ring-2 focus:ring-landing-coral/20 focus:outline-none"
        />
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={status === "loading" || cooldown > 0}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-landing-coral-dark px-8 py-3.5 font-semibold text-white transition-all hover:bg-landing-coral-hover hover:shadow-lg hover:shadow-landing-coral/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "loading" ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            {t("sending")}
          </>
        ) : (
          t("sendLink")
        )}
      </button>

      {/* Divider with trust note */}
      <div className="mt-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-landing-text/5" />
        <div className="flex items-center gap-1.5 text-xs text-landing-text-muted/50">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {t("noPassword")}
        </div>
        <div className="h-px flex-1 bg-landing-text/5" />
      </div>
    </form>
  </>
);
```

Key changes from the existing JSX:
- Removed `autoFocus` from email input (Google button is now primary)
- Moved error message above the form (covers both Google and magic link errors)
- Added Google button + separator between title and form

- [ ] **Step 4: Verify the app compiles**

Run: `npx next build` or `npm run dev` and check for TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/auth/sign-in-form.tsx
git commit -m "feat(auth): add Google sign-in button with separator"
```

## Chunk 3: Documentation updates

### Task 4: Update PROJECT.md

**Files:**
- Modify: `PROJECT.md`

- [ ] **Step 1: Add Google as primary auth method**

In `PROJECT.md`, the auth-related content doesn't have a dedicated section yet. Add a note in the "Access Model" section. After the "Two invitation paths" heading, before "Email invitation:", add:

```markdown
### Authentication

Users sign in via **Google OAuth** (primary) or **magic link** (email-based alternative). Both methods are passwordless. Google sign-in automatically populates the user's display name and avatar from their Google account.
```

- [ ] **Step 2: Commit**

```bash
git add PROJECT.md
git commit -m "docs: add Google as primary auth method in PROJECT.md"
```

## Chunk 4: E2E tests

### Task 5: Add E2E tests for Google sign-in UI

**Files:**
- Modify: `e2e/auth.spec.ts`

We can't fully test the Google OAuth flow in E2E (it requires real Google credentials), but we can test that the UI renders correctly and the button triggers an OAuth redirect.

- [ ] **Step 1: Add test for Google button presence**

Add to the existing `"Auth - Sign in page"` describe block:

```typescript
test("renders Google sign-in button", async ({ page }) => {
  await page.goto("/en/auth/sign-in");
  await expect(
    page.getByRole("button", { name: "Sign in with Google" })
  ).toBeVisible();
});

test("renders separator between Google and email", async ({ page }) => {
  await page.goto("/en/auth/sign-in");
  await expect(page.getByText("or continue with email")).toBeVisible();
});

test("Google button renders in Polish", async ({ page }) => {
  await page.goto("/pl/auth/sign-in");
  await expect(
    page.getByRole("button", { name: "Zaloguj się przez Google" })
  ).toBeVisible();
  await expect(page.getByText("lub kontynuuj przez email")).toBeVisible();
});

test("Google button initiates OAuth redirect", async ({ page }) => {
  await page.goto("/en/auth/sign-in");
  const [request] = await Promise.all([
    page.waitForRequest((req) =>
      req.url().includes("/auth/v1/authorize") && req.url().includes("provider=google")
    ),
    page.getByRole("button", { name: "Sign in with Google" }).click(),
  ]);
  expect(request.url()).toContain("provider=google");
});
```

- [ ] **Step 2: Run all E2E tests**

Run: `npx playwright test`
Expected: All tests pass, including the new ones and all existing auth tests.

- [ ] **Step 3: Commit**

```bash
git add e2e/auth.spec.ts
git commit -m "test(auth): add E2E tests for Google sign-in button"
```

## Chunk 5: Verification & cleanup

### Task 6: Final verification

- [ ] **Step 1: Run linter and type check**

Run: `npm run lint && npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 2: Run all E2E tests**

Run: `npx playwright test`
Expected: All tests pass.

- [ ] **Step 3: Visual check**

Visit `/en/auth/sign-in` and `/pl/auth/sign-in` in the dev server. Verify:
- Google button is prominent at the top
- Separator text is visible
- Magic link form is below
- Footer note is updated
- Both languages render correctly

- [ ] **Step 4: Run /review and /security-review**
- [ ] **Step 5: Run /simplify on modified files**
- [ ] **Step 6: Push and create PR**
