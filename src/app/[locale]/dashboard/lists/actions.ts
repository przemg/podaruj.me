"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
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

// ── Slug helper ─────────────────────────────────────────────────────

function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/[^a-z0-9\s-]/g, "")   // remove special chars
    .trim()
    .replace(/\s+/g, "-")           // spaces to hyphens
    .replace(/-+/g, "-")            // collapse multiple hyphens
    .slice(0, 80);                  // limit length

  // Append 5-char random hash for uniqueness
  const hash = Math.random().toString(36).slice(2, 7);
  return `${base}-${hash}`;
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

  const slug = generateSlug(data.name);

  const { data: list, error: dbError } = await supabase
    .from("lists")
    .insert({
      user_id: user.id,
      name: data.name.trim(),
      description: data.description?.trim() || null,
      occasion: data.occasion,
      event_date: data.eventDate || null,
      privacy_mode: data.privacyMode,
      slug,
      is_published: data.privacyMode !== "full_surprise",
    })
    .select("slug")
    .single();

  if (dbError) return { error: "Failed to create list" };

  redirect(`/${locale}/dashboard/lists/${list.slug}`);
}

export async function updateList(
  locale: string,
  slug: string,
  data: ListFormData
): Promise<ActionResult> {
  const error = validateListData(data);
  if (error) return { error };

  const { supabase } = await getAuthenticatedClient();

  const newSlug = generateSlug(data.name);

  const { error: dbError } = await supabase
    .from("lists")
    .update({
      name: data.name.trim(),
      description: data.description?.trim() || null,
      occasion: data.occasion,
      event_date: data.eventDate || null,
      privacy_mode: data.privacyMode,
      slug: newSlug,
    })
    .eq("slug", slug);

  if (dbError) return { error: "Failed to update list" };

  revalidatePath(`/${locale}/lists/${slug}`);
  revalidatePath(`/${locale}/lists/${newSlug}`);
  redirect(`/${locale}/dashboard/lists/${newSlug}`);
}

export async function deleteList(
  locale: string,
  slug: string
): Promise<ActionResult> {
  const { supabase } = await getAuthenticatedClient();

  const { error: dbError } = await supabase
    .from("lists")
    .delete()
    .eq("slug", slug);

  if (dbError) return { error: "Failed to delete list" };

  revalidatePath(`/${locale}/lists/${slug}`);
  redirect(`/${locale}/dashboard`);
}

// ── Publish Action ──────────────────────────────────────────────────

export async function publishList(
  locale: string,
  slug: string
): Promise<ActionResult> {
  const { supabase } = await getAuthenticatedClient();

  // Fetch list to validate
  const { data: list } = await supabase
    .from("lists")
    .select("id, privacy_mode, is_published")
    .eq("slug", slug)
    .single();

  if (!list) return { error: "List not found" };
  if (list.privacy_mode !== "full_surprise")
    return { error: "Only Full Surprise lists need publishing" };
  if (list.is_published) return { error: "List is already published" };

  const { error: dbError } = await supabase
    .from("lists")
    .update({ is_published: true, published_at: new Date().toISOString() })
    .eq("slug", slug);

  if (dbError) return { error: "Failed to publish list" };

  revalidatePath(`/${locale}/dashboard/lists/${slug}`);
  revalidatePath(`/${locale}/lists/${slug}`);
  return {};
}

// ── Item Actions ────────────────────────────────────────────────────

export async function createItem(
  locale: string,
  listId: string,
  listSlug: string,
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

  revalidatePath(`/${locale}/dashboard/lists/${listSlug}`);
  revalidatePath(`/${locale}/lists/${listSlug}`);
  return {};
}

export async function updateItem(
  locale: string,
  listSlug: string,
  itemId: string,
  data: ItemFormData
): Promise<ActionResult> {
  const error = validateItemData(data);
  if (error) return { error };

  const { supabase } = await getAuthenticatedClient();

  // Block editing locked items on published full_surprise lists
  const { data: list } = await supabase
    .from("lists")
    .select("privacy_mode, is_published, published_at")
    .eq("slug", listSlug)
    .single();

  if (list?.privacy_mode === "full_surprise" && list.is_published && list.published_at) {
    const { data: item } = await supabase
      .from("items")
      .select("created_at")
      .eq("id", itemId)
      .single();

    if (item && item.created_at <= list.published_at) {
      return { error: "This item was locked when the list was published" };
    }
  }

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

  revalidatePath(`/${locale}/dashboard/lists/${listSlug}`);
  revalidatePath(`/${locale}/lists/${listSlug}`);
  return {};
}

export async function deleteItem(
  locale: string,
  listSlug: string,
  itemId: string
): Promise<ActionResult> {
  const { supabase } = await getAuthenticatedClient();

  // Block deletion of locked items on published full_surprise lists
  const { data: list } = await supabase
    .from("lists")
    .select("privacy_mode, is_published, published_at")
    .eq("slug", listSlug)
    .single();

  if (list?.privacy_mode === "full_surprise" && list.is_published && list.published_at) {
    const { data: item } = await supabase
      .from("items")
      .select("created_at")
      .eq("id", itemId)
      .single();

    if (item && item.created_at <= list.published_at) {
      return { error: "This item was locked when the list was published" };
    }
  }

  // Block deletion if item has an active reservation
  const serviceClient = createServiceClient();
  const { data: reservation } = await serviceClient
    .from("reservations")
    .select("id")
    .eq("item_id", itemId)
    .single();

  if (reservation) return { error: "Cannot delete a reserved item" };

  const { error: dbError } = await supabase
    .from("items")
    .delete()
    .eq("id", itemId);

  if (dbError) return { error: "Failed to delete gift" };

  revalidatePath(`/${locale}/dashboard/lists/${listSlug}`);
  revalidatePath(`/${locale}/lists/${listSlug}`);
  return {};
}

export async function reorderItems(
  locale: string,
  listId: string,
  listSlug: string,
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

  revalidatePath(`/${locale}/dashboard/lists/${listSlug}`);
  revalidatePath(`/${locale}/lists/${listSlug}`);
  return {};
}
