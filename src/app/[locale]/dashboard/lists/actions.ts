"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

// ── Types ───────────────────────────────────────────────────────────

export type ListFormData = {
  name: string;
  description?: string;
  occasion: "birthday" | "holiday" | "wedding" | "other";
  eventDate?: string;
  privacyMode: "buyers_choice" | "visible" | "full_surprise";
};

export type ItemFormData = {
  name: string;
  description?: string;
  url?: string;
  price?: number;
  imageUrl?: string;
  priority: "nice_to_have" | "would_love" | "must_have";
};

export type ActionResult = {
  error?: string;
};

// ── Validation helpers ──────────────────────────────────────────────

const OCCASIONS = ["birthday", "holiday", "wedding", "other"] as const;
const PRIVACY_MODES = [
  "buyers_choice",
  "visible",
  "full_surprise",
] as const;
const PRIORITIES = ["nice_to_have", "would_love", "must_have"] as const;

function validateListData(data: ListFormData): string | null {
  if (!data.name || data.name.trim().length === 0) return "Name is required";
  if (data.name.length > 100) return "Name must be 100 characters or less";
  if (data.description && data.description.length > 500)
    return "Description must be 500 characters or less";
  if (!OCCASIONS.includes(data.occasion as (typeof OCCASIONS)[number]))
    return "Invalid occasion";
  if (
    !PRIVACY_MODES.includes(data.privacyMode as (typeof PRIVACY_MODES)[number])
  )
    return "Invalid privacy mode";
  return null;
}

function validateItemData(data: ItemFormData): string | null {
  if (!data.name || data.name.trim().length === 0) return "Name is required";
  if (data.name.length > 200) return "Name must be 200 characters or less";
  if (data.description && data.description.length > 1000)
    return "Description must be 1000 characters or less";
  if (data.url && !/^https?:\/\/.+/.test(data.url)) return "Invalid URL";
  if (data.price !== undefined && data.price < 0)
    return "Price must be positive";
  if (!PRIORITIES.includes(data.priority as (typeof PRIORITIES)[number]))
    return "Invalid priority";
  return null;
}

// ── Auth helper ─────────────────────────────────────────────────────

async function getAuthenticatedClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, user };
}

// ── List Actions ────────────────────────────────────────────────────

export async function createList(
  locale: string,
  data: ListFormData
): Promise<ActionResult> {
  const error = validateListData(data);
  if (error) return { error };

  const { supabase, user } = await getAuthenticatedClient();

  const { data: list, error: dbError } = await supabase
    .from("lists")
    .insert({
      user_id: user.id,
      name: data.name.trim(),
      description: data.description?.trim() || null,
      occasion: data.occasion,
      event_date: data.eventDate || null,
      privacy_mode: data.privacyMode,
    })
    .select("id")
    .single();

  if (dbError) return { error: "Failed to create list" };

  redirect(`/${locale}/dashboard/lists/${list.id}`);
}

export async function updateList(
  locale: string,
  listId: string,
  data: ListFormData
): Promise<ActionResult> {
  const error = validateListData(data);
  if (error) return { error };

  const { supabase } = await getAuthenticatedClient();

  const { error: dbError } = await supabase
    .from("lists")
    .update({
      name: data.name.trim(),
      description: data.description?.trim() || null,
      occasion: data.occasion,
      event_date: data.eventDate || null,
      privacy_mode: data.privacyMode,
    })
    .eq("id", listId);

  if (dbError) return { error: "Failed to update list" };

  redirect(`/${locale}/dashboard/lists/${listId}`);
}

export async function deleteList(
  locale: string,
  listId: string
): Promise<ActionResult> {
  const { supabase } = await getAuthenticatedClient();

  const { error: dbError } = await supabase
    .from("lists")
    .delete()
    .eq("id", listId);

  if (dbError) return { error: "Failed to delete list" };

  redirect(`/${locale}/dashboard`);
}

// ── Item Actions ────────────────────────────────────────────────────

export async function createItem(
  locale: string,
  listId: string,
  data: ItemFormData
): Promise<ActionResult> {
  const error = validateItemData(data);
  if (error) return { error };

  const { supabase } = await getAuthenticatedClient();

  // Calculate next position
  const { data: lastItem } = await supabase
    .from("items")
    .select("position")
    .eq("list_id", listId)
    .order("position", { ascending: false })
    .limit(1)
    .single();

  const nextPosition = lastItem ? lastItem.position + 1 : 0;

  const { error: dbError } = await supabase.from("items").insert({
    list_id: listId,
    name: data.name.trim(),
    description: data.description?.trim() || null,
    url: data.url?.trim() || null,
    price: data.price ?? null,
    image_url: data.imageUrl?.trim() || null,
    priority: data.priority,
    position: nextPosition,
  });

  if (dbError) return { error: "Failed to add gift" };

  revalidatePath(`/${locale}/dashboard/lists/${listId}`);
  return {};
}

export async function updateItem(
  locale: string,
  listId: string,
  itemId: string,
  data: ItemFormData
): Promise<ActionResult> {
  const error = validateItemData(data);
  if (error) return { error };

  const { supabase } = await getAuthenticatedClient();

  const { error: dbError } = await supabase
    .from("items")
    .update({
      name: data.name.trim(),
      description: data.description?.trim() || null,
      url: data.url?.trim() || null,
      price: data.price ?? null,
      image_url: data.imageUrl?.trim() || null,
      priority: data.priority,
    })
    .eq("id", itemId);

  if (dbError) return { error: "Failed to update gift" };

  revalidatePath(`/${locale}/dashboard/lists/${listId}`);
  return {};
}

export async function deleteItem(
  locale: string,
  listId: string,
  itemId: string
): Promise<ActionResult> {
  const { supabase } = await getAuthenticatedClient();

  const { error: dbError } = await supabase
    .from("items")
    .delete()
    .eq("id", itemId);

  if (dbError) return { error: "Failed to delete gift" };

  revalidatePath(`/${locale}/dashboard/lists/${listId}`);
  return {};
}

export async function reorderItems(
  locale: string,
  listId: string,
  itemIds: string[]
): Promise<ActionResult> {
  const { supabase } = await getAuthenticatedClient();

  const updates = itemIds.map((id, index) =>
    supabase
      .from("items")
      .update({ position: index })
      .eq("id", id)
      .eq("list_id", listId)
  );

  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);
  if (failed?.error) return { error: "Failed to reorder gifts" };

  revalidatePath(`/${locale}/dashboard/lists/${listId}`);
  return {};
}
