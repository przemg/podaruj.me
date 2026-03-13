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
};

type GiftListProps = {
  items: ItemData[];
  listId: string;
  locale: string;
};

export function GiftList({ items, listId, locale }: GiftListProps) {
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
    await deleteItem(locale, listId, deletingItem.id);
    setDeleteLoading(false);
    setDeleteDialogOpen(false);
    setDeletingItem(undefined);
    router.refresh();
  }, [deletingItem, locale, listId, router]);

  return (
    <div>
      {/* Add gift button */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-landing-text">
          {t("addButton")} ({orderedItems.length})
        </h2>
        <Button
          onClick={() => setAddDialogOpen(true)}
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
          {orderedItems.map((item, index) => (
            <GiftCard
              key={item.id}
              item={item}
              isFirst={index === 0}
              isLast={index === orderedItems.length - 1}
              locale={locale}
              onMoveUp={() => handleMoveUp(index)}
              onMoveDown={() => handleMoveDown(index)}
              onEdit={() => handleEdit(item)}
              onDelete={() => handleDeleteClick(item)}
            />
          ))}
        </div>
      )}

      {/* Add gift dialog — key forces remount to reset form */}
      {addDialogOpen && (
        <GiftFormDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          listId={listId}
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
        description={tConfirm("description")}
        confirmLabel={tConfirm("confirm")}
        cancelLabel={tConfirm("cancel")}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />
    </div>
  );
}
