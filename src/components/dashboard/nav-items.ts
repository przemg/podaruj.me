import { List, Gift } from "lucide-react";

export const NAV_ITEMS = [
  { href: "/dashboard" as const, labelKey: "myLists" as const, icon: List },
  { href: "/dashboard/reservations" as const, labelKey: "myReservations" as const, icon: Gift },
];
