"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

// ── Types ───────────────────────────────────────────────────────────

type ActionResult = {
  error?: string;
  success?: boolean;
};

// ── Auth helper ─────────────────────────────────────────────────────

async function getAuthenticatedClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, user };
}

// ── Actions ─────────────────────────────────────────────────────────

export async function updateDisplayName(
  displayName: string
): Promise<ActionResult> {
  const trimmed = displayName.trim();
  if (trimmed.length === 0) return { error: "Display name is required" };
  if (trimmed.length > 50)
    return { error: "Display name must be 50 characters or less" };

  const { supabase, user } = await getAuthenticatedClient();

  const { error: dbError } = await supabase
    .from("profiles")
    .update({ display_name: trimmed })
    .eq("id", user.id);

  if (dbError) return { error: "Failed to update display name" };

  return { success: true };
}

export async function deleteAccount(): Promise<ActionResult> {
  const { user } = await getAuthenticatedClient();

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("SUPABASE_SERVICE_ROLE_KEY is not set");
    return { error: "Server configuration error" };
  }

  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { error } = await serviceClient.auth.admin.deleteUser(user.id);

  if (error) {
    console.error("Delete user error:", error.message);
    return { error: "Failed to delete account" };
  }

  return { success: true };
}
