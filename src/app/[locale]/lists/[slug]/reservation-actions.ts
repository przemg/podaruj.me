"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sendConfirmationEmail } from "@/lib/email";
import { revalidatePath } from "next/cache";

export type ReservationActionResult = {
  error?: string;
  success?: string;
};

// ── Validation ─────────────────────────────────────────────────────

function validateGuestData(data: {
  nickname: string;
  email: string;
}): string | null {
  if (!data.nickname || data.nickname.trim().length === 0)
    return "Nickname is required";
  if (data.nickname.length > 50)
    return "Nickname must be 50 characters or less";
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    return "Valid email is required";
  if (data.email.length > 320) return "Email is too long";
  return null;
}

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
    .select("id, status, created_at")
    .eq("item_id", itemId)
    .single();

  if (!data) return true;

  if (data.status === "pending") {
    const created = new Date(data.created_at);
    const now = new Date();
    const hoursElapsed =
      (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    if (hoursElapsed > 24) {
      await supabase.from("reservations").delete().eq("id", data.id);
      return true;
    }
  }

  return false;
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
    .select("id, slug, user_id")
    .eq("slug", listSlug)
    .single();

  if (!list || item.list_id !== list.id)
    return { error: "Item does not belong to this list" };

  if (list.user_id === user.id) return { error: "Cannot reserve your own item" };

  if (!(await isItemAvailable(serviceClient, itemId)))
    return { error: "This item is already reserved" };

  const { error: dbError } = await serviceClient
    .from("reservations")
    .insert({
      item_id: itemId,
      list_id: list.id,
      user_id: user.id,
      show_name: data.showName ?? true,
      status: "confirmed",
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
  data: { nickname: string; email: string; showName?: boolean; locale: string }
): Promise<ReservationActionResult> {
  const validationError = validateGuestData(data);
  if (validationError) return { error: validationError };

  const serviceClient = createServiceClient();

  const { data: item } = await serviceClient
    .from("items")
    .select("id, name, list_id")
    .eq("id", itemId)
    .single();

  if (!item) return { error: "Item not found" };

  const { data: list } = await serviceClient
    .from("lists")
    .select("id, slug, name")
    .eq("slug", listSlug)
    .single();

  if (!list || item.list_id !== list.id)
    return { error: "Item does not belong to this list" };

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await serviceClient
    .from("reservations")
    .select("id", { count: "exact", head: true })
    .eq("guest_email", data.email.trim().toLowerCase())
    .eq("status", "pending")
    .gte("created_at", oneHourAgo);

  if (count !== null && count >= 5)
    return { error: "Too many pending reservations. Please try again later." };

  if (!(await isItemAvailable(serviceClient, itemId)))
    return { error: "This item is already reserved" };

  const { data: reservation, error: dbError } = await serviceClient
    .from("reservations")
    .insert({
      item_id: itemId,
      list_id: list.id,
      guest_email: data.email.trim().toLowerCase(),
      guest_nickname: data.nickname.trim(),
      show_name: data.showName ?? true,
      status: "pending",
      locale: data.locale,
    })
    .select("guest_token")
    .single();

  if (dbError) {
    if (dbError.code === "23505")
      return { error: "This item was just reserved by someone else" };
    return { error: "Failed to reserve item" };
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://podaruj.me";
  const token = reservation.guest_token;

  try {
    await sendConfirmationEmail({
      to: data.email.trim(),
      itemName: item.name,
      listName: list.name,
      confirmUrl: `${baseUrl}/${data.locale}/reservations/confirm/${token}`,
      manageUrl: `${baseUrl}/${data.locale}/reservations/manage/${token}`,
      locale: data.locale,
    });
  } catch {
    await serviceClient
      .from("reservations")
      .delete()
      .eq("guest_token", token);
    return { error: "Failed to send confirmation email. Please try again." };
  }

  revalidateReservationPaths("en", listSlug);
  revalidateReservationPaths("pl", listSlug);
  return { success: "Check your email to confirm the reservation" };
}

// ── Confirm guest reservation ──────────────────────────────────────

export async function confirmGuestReservation(
  token: string
): Promise<ReservationActionResult> {
  const serviceClient = createServiceClient();

  const { data: reservation } = await serviceClient
    .from("reservations")
    .select("id, status, created_at, list_id")
    .eq("guest_token", token)
    .single();

  if (!reservation) return { error: "Reservation not found" };

  if (reservation.status === "confirmed")
    return { success: "Already confirmed" };

  if (reservation.status === "pending") {
    const created = new Date(reservation.created_at);
    const now = new Date();
    const hoursElapsed =
      (now.getTime() - created.getTime()) / (1000 * 60 * 60);

    if (hoursElapsed > 24) {
      await serviceClient
        .from("reservations")
        .delete()
        .eq("id", reservation.id);
      return { error: "This reservation has expired" };
    }
  }

  const { error: dbError } = await serviceClient
    .from("reservations")
    .update({ status: "confirmed" })
    .eq("id", reservation.id);

  if (dbError) return { error: "Failed to confirm reservation" };

  const { data: list } = await serviceClient
    .from("lists")
    .select("slug")
    .eq("id", reservation.list_id)
    .single();

  if (list) {
    revalidateReservationPaths("en", list.slug);
    revalidateReservationPaths("pl", list.slug);
  }

  return { success: "Reservation confirmed!" };
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

// ── Cancel (guest) ─────────────────────────────────────────────────

export async function cancelGuestReservation(
  token: string
): Promise<ReservationActionResult> {
  const serviceClient = createServiceClient();

  const { data: reservation } = await serviceClient
    .from("reservations")
    .select("id, list_id")
    .eq("guest_token", token)
    .single();

  if (!reservation) return { error: "Reservation not found" };

  const { error: dbError } = await serviceClient
    .from("reservations")
    .delete()
    .eq("id", reservation.id);

  if (dbError) return { error: "Failed to cancel reservation" };

  const { data: list } = await serviceClient
    .from("lists")
    .select("slug")
    .eq("id", reservation.list_id)
    .single();

  if (list) {
    revalidateReservationPaths("en", list.slug);
    revalidateReservationPaths("pl", list.slug);
  }

  return { success: "Reservation cancelled" };
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
      lists!inner (name, slug, occasion, event_date)
    `)
    .eq("user_id", user.id)
    .eq("status", "confirmed")
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
      showName: r.show_name as boolean,
      createdAt: r.created_at as string,
    };
  });
}
