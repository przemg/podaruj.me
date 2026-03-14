"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { GiftCard } from "./gift-card";
import { GiftFormDialog } from "./gift-form-dialog";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import {
  deleteItem,
  reorderItems,
} from "@/app/[locale]/dashboard/lists/actions";
import { Plus, Gift } from "lucide-react";

type ItemData = {
  id: string;
  name: string;
  description: string | null;
  url: string | null;
  price: number | null;
  image_url: string | null;
  priority: string;
  position: number;
  created_at?: string;
};

type ReservationBadge = {
  reserverName: string | null;
};

type GiftListProps = {
  items: ItemData[];
  listId: string;
  listSlug: string;
  locale: string;
  reservations?: Record<string, ReservationBadge>;
  privacyMode?: string;
  reservedItemIds?: string[];
  isPublished?: boolean;
  publishedAt?: string | null;
};

export function GiftList({ items, listId, listSlug, locale, reservations, privacyMode, reservedItemIds, isPublished, publishedAt }: GiftListProps) {
  const t = useTranslations("items");
  const tConfirm = useTranslations("items.confirmDelete");
  const router = useRouter();

  const [orderedItems, setOrderedItems] = useState(items);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemData | undefined>();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<ItemData | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Sync with server data when items prop changes
  if (items !== orderedItems && JSON.stringify(items) !== JSON.stringify(orderedItems)) {
    setOrderedItems(items);
  }

  const handleMoveUp = useCallback(
    async (index: number) => {
      if (index === 0) return;
      const newItems = [...orderedItems];
      [newItems[index - 1], newItems[index]] = [
        newItems[index],
        newItems[index - 1],
      ];
      setOrderedItems(newItems);
      await reorderItems(
        locale,
        listId,
        listSlug,
        newItems.map((item) => item.id)
      );
    },
    [orderedItems, locale, listId]
  );

  const handleMoveDown = useCallback(
    async (index: number) => {
      if (index === orderedItems.length - 1) return;
      const newItems = [...orderedItems];
      [newItems[index], newItems[index + 1]] = [
        newItems[index + 1],
        newItems[index],
      ];
      setOrderedItems(newItems);
      await reorderItems(
        locale,
        listId,
        listSlug,
        newItems.map((item) => item.id)
      );
    },
    [orderedItems, locale, listId]
  );

  const handleEdit = useCallback((item: ItemData) => {
    setEditingItem(item);
    setEditDialogOpen(true);
  }, []);

  const handleDeleteClick = useCallback((item: ItemData) => {
    setDeletingItem(item);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deletingItem) return;
    setDeleteLoading(true);
    await deleteItem(locale, listSlug, deletingItem.id);
    setDeleteLoading(false);
    setDeleteDialogOpen(false);
    setDeletingItem(undefined);
    router.refresh();
  }, [deletingItem, locale, listId, router]);

  return (
    <div>
      {/* Section header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg font-semibold text-landing-text">
            {t("sectionTitle")}
          </h2>
          <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-landing-text/5 px-2 text-xs font-medium text-landing-text-muted">
            {orderedItems.length}
          </span>
        </div>
        <Button
          onClick={() => setAddDialogOpen(true)}
          size="sm"
          className="cursor-pointer bg-landing-coral-dark text-white hover:bg-landing-coral-hover"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          {t("addButton")}
        </Button>
      </div>

      {/* Gift list or empty state */}
      {orderedItems.length === 0 ? (
        <div
          className="rounded-2xl border-2 border-dashed border-landing-text/10 p-12 text-center"
          style={{ animation: "fade-in-up 0.4s ease-out" }}
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-landing-peach-wash">
            <Gift className="h-8 w-8 text-landing-coral" />
          </div>
          <h3 className="text-lg font-medium text-landing-text">
            {t("empty.title")}
          </h3>
          <p className="mt-1 text-sm text-landing-text-muted">
            {t("empty.description")}
          </p>
          <Button
            onClick={() => setAddDialogOpen(true)}
            className="mt-4 cursor-pointer bg-landing-coral-dark text-white hover:bg-landing-coral-hover"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            {t("addButton")}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {orderedItems.map((item, index) => {
            const itemLocked = privacyMode === "full_surprise" && isPublished && !!publishedAt && !!item.created_at && item.created_at <= publishedAt;
            return (
              <GiftCard
                key={item.id}
                item={item}
                isFirst={index === 0}
                isLast={index === orderedItems.length - 1}
                locale={locale}
                reservation={reservations?.[item.id]}
                privacyMode={privacyMode}
                isReserved={!!reservations?.[item.id] || !!reservedItemIds?.includes(item.id)}
                hasAnyReservation={(reservedItemIds?.length ?? 0) > 0 || Object.keys(reservations ?? {}).length > 0}
                isLocked={itemLocked}
                onMoveUp={() => handleMoveUp(index)}
                onMoveDown={() => handleMoveDown(index)}
                onEdit={() => handleEdit(item)}
                onDelete={() => handleDeleteClick(item)}
              />
            );
          })}
        </div>
      )}

      {/* Add gift dialog — key forces remount to reset form */}
      {addDialogOpen && (
        <GiftFormDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          listId={listId}
          listSlug={listSlug}
          locale={locale}
        />
      )}

      {/* Edit gift dialog — key forces remount with new item data */}
      {editDialogOpen && (
        <GiftFormDialog
          key={editingItem?.id}
          open={editDialogOpen}
          onOpenChange={(open) => {
            setEditDialogOpen(open);
            if (!open) setEditingItem(undefined);
          }}
          listId={listId}
          listSlug={listSlug}
          locale={locale}
          editItem={editingItem}
        />
      )}

      {/* Delete confirmation dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setDeletingItem(undefined);
        }}
        title={tConfirm("title")}
        description={
          privacyMode === "full_surprise" && deletingItem && reservedItemIds?.includes(deletingItem.id)
            ? tConfirm("surpriseWarning")
            : tConfirm("description")
        }
        confirmLabel={tConfirm("confirm")}
        cancelLabel={tConfirm("cancel")}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />
    </div>
  );
}
