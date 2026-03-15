"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { revalidatePath } from "next/cache";
import { isListClosed } from "@/lib/countdown";

export type ReservationActionResult = {
  error?: string;
  success?: string;
};

// ── Helpers ────────────────────────────────────────────────────────

function revalidateReservationPaths(locale: string, listSlug: string) {
  revalidatePath(`/${locale}/lists/${listSlug}`);
  revalidatePath(`/${locale}/dashboard/reservations`);
}

async function isItemAvailable(
  supabase: ReturnType<typeof createServiceClient>,
  itemId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("reservations")
    .select("id")
    .eq("item_id", itemId)
    .single();

  return !data;
}

// ── Reserve (logged-in user) ───────────────────────────────────────

export async function reserveItem(
  listSlug: string,
  itemId: string,
  data: { showName?: boolean }
): Promise<ReservationActionResult> {
  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const serviceClient = createServiceClient();

  const { data: item } = await serviceClient
    .from("items")
    .select("id, list_id")
    .eq("id", itemId)
    .single();

  if (!item) return { error: "Item not found" };

  const { data: list } = await serviceClient
    .from("lists")
    .select("id, slug, user_id, privacy_mode, is_published, is_closed, event_date")
    .eq("slug", listSlug)
    .single();

  if (!list || item.list_id !== list.id)
    return { error: "Item does not belong to this list" };

  if (list.user_id === user.id) return { error: "Cannot reserve your own item" };

  if (list.privacy_mode === "full_surprise" && !list.is_published)
    return { error: "This list is not yet published" };

  if (isListClosed({ is_closed: list.is_closed, event_date: list.event_date }))
    return { error: "This list is closed and no longer accepting reservations" };

  if (!(await isItemAvailable(serviceClient, itemId)))
    return { error: "This item is already reserved" };

  const { error: dbError } = await serviceClient
    .from("reservations")
    .insert({
      item_id: itemId,
      list_id: list.id,
      user_id: user.id,
      show_name: data.showName ?? true,
    });

  if (dbError) {
    if (dbError.code === "23505")
      return { error: "This item was just reserved by someone else" };
    return { error: "Failed to reserve item" };
  }

  revalidateReservationPaths("en", listSlug);
  revalidateReservationPaths("pl", listSlug);
  return {};
}

// ── Reserve (guest) ────────────────────────────────────────────────

export async function reserveItemAsGuest(
  listSlug: string,
  itemId: string,
  data: { nickname: string; showName?: boolean }
): Promise<ReservationActionResult> {
  const nickname = data.nickname?.trim();
  if (!nickname || nickname.length === 0) return { error: "Nickname is required" };
  if (nickname.length > 50) return { error: "Nickname must be 50 characters or less" };

  const serviceClient = createServiceClient();

  const { data: item } = await serviceClient
    .from("items")
    .select("id, list_id")
    .eq("id", itemId)
    .single();

  if (!item) return { error: "Item not found" };

  const { data: list } = await serviceClient
    .from("lists")
    .select("id, slug, privacy_mode, is_published, is_closed, event_date")
    .eq("slug", listSlug)
    .single();

  if (!list || item.list_id !== list.id)
    return { error: "Item does not belong to this list" };

  if (list.privacy_mode === "full_surprise" && !list.is_published)
    return { error: "This list is not yet published" };

  if (isListClosed({ is_closed: list.is_closed, event_date: list.event_date }))
    return { error: "This list is closed and no longer accepting reservations" };

  if (!(await isItemAvailable(serviceClient, itemId)))
    return { error: "This item is already reserved" };

  const { error: dbError } = await serviceClient
    .from("reservations")
    .insert({
      item_id: itemId,
      list_id: list.id,
      guest_nickname: nickname,
      show_name: data.showName ?? true,
    });

  if (dbError) {
    if (dbError.code === "23505")
      return { error: "This item was just reserved by someone else" };
    return { error: "Failed to reserve item" };
  }

  revalidateReservationPaths("en", listSlug);
  revalidateReservationPaths("pl", listSlug);
  return {};
}

// ── Cancel (logged-in user) ────────────────────────────────────────

export async function cancelReservation(
  listSlug: string,
  itemId: string
): Promise<ReservationActionResult> {
  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error: dbError } = await authClient
    .from("reservations")
    .delete()
    .eq("item_id", itemId)
    .eq("user_id", user.id);

  if (dbError) return { error: "Failed to cancel reservation" };

  revalidateReservationPaths("en", listSlug);
  revalidateReservationPaths("pl", listSlug);
  return {};
}

// ── Get my reservations (dashboard) ────────────────────────────────

export type MyReservation = {
  id: string;
  itemId: string;
  itemName: string;
  itemPrice: number | null;
  itemPriority: string;
  listName: string;
  listSlug: string;
  listOccasion: string;
  listEventDate: string | null;
  listIsClosed: boolean;
  showName: boolean;
  createdAt: string;
};

export async function getMyReservations(): Promise<MyReservation[]> {
  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!user) return [];

  const serviceClient = createServiceClient();

  const { data: reservations } = await serviceClient
    .from("reservations")
    .select(`
      id,
      item_id,
      show_name,
      created_at,
      items!inner (name, price, priority),
      lists!inner (name, slug, occasion, event_date, is_closed)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (!reservations) return [];

  return reservations.map((r: Record<string, unknown>) => {
    const item = r.items as Record<string, unknown>;
    const list = r.lists as Record<string, unknown>;
    return {
      id: r.id as string,
      itemId: r.item_id as string,
      itemName: item.name as string,
      itemPrice: item.price as number | null,
      itemPriority: item.priority as string,
      listName: list.name as string,
      listSlug: list.slug as string,
      listOccasion: list.occasion as string,
      listEventDate: list.event_date as string | null,
      listIsClosed: isListClosed({ is_closed: list.is_closed as boolean, event_date: list.event_date as string | null }),
      showName: r.show_name as boolean,
      createdAt: r.created_at as string,
    };
  });
}
