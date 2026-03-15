"use client";

import { useState, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GiftCard } from "./gift-card";
import { GiftFormDialog } from "./gift-form-dialog";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import {
  deleteItem,
  reorderItems,
} from "@/app/[locale]/dashboard/lists/actions";
import { Plus, Gift, ArrowUpDown } from "lucide-react";

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

function SortableGiftCard({
  item,
  isDragDisabled,
  ...cardProps
}: {
  item: ItemData;
  isDragDisabled: boolean;
} & Omit<
  React.ComponentProps<typeof GiftCard>,
  "dragHandleProps" | "isDragDisabled" | "item"
>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    disabled: isDragDisabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : ("auto" as const),
  };

  return (
    <div ref={setNodeRef} style={style}>
      <GiftCard
        {...cardProps}
        item={item}
        isDragDisabled={isDragDisabled}
        dragHandleProps={
          { ...attributes, ...listeners } as React.HTMLAttributes<HTMLButtonElement>
        }
      />
    </div>
  );
}

export function GiftList({
  items,
  listId,
  listSlug,
  locale,
  reservations,
  privacyMode,
  reservedItemIds,
  isPublished,
  publishedAt,
}: GiftListProps) {
  const t = useTranslations("items");
  const tSort = useTranslations("items.sort");
  const tConfirm = useTranslations("items.confirmDelete");
  const router = useRouter();

  const [orderedItems, setOrderedItems] = useState(items);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemData | undefined>();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<ItemData | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [sortMode, setSortMode] = useState<string>("custom");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [animateRef] = useAutoAnimate();

  // Sync with server data when items prop changes
  if (
    items !== orderedItems &&
    JSON.stringify(items) !== JSON.stringify(orderedItems)
  ) {
    setOrderedItems(items);
  }

  // Sorting
  const sortedItems = useMemo(() => {
    if (sortMode === "custom") return orderedItems;
    const sorted = [...orderedItems];
    switch (sortMode) {
      case "priority": {
        const order: Record<string, number> = {
          must_have: 0,
          would_love: 1,
          nice_to_have: 2,
        };
        sorted.sort(
          (a, b) => (order[a.priority] ?? 2) - (order[b.priority] ?? 2)
        );
        break;
      }
      case "price_low":
        sorted.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
        break;
      case "price_high":
        sorted.sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
        break;
      case "name_az":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "date_newest":
        sorted.sort((a, b) =>
          (b.created_at ?? "").localeCompare(a.created_at ?? "")
        );
        break;
      case "date_oldest":
        sorted.sort((a, b) =>
          (a.created_at ?? "").localeCompare(b.created_at ?? "")
        );
        break;
      case "available_first":
        sorted.sort((a, b) => {
          const aReserved =
            reservations?.[a.id] || reservedItemIds?.includes(a.id) ? 1 : 0;
          const bReserved =
            reservations?.[b.id] || reservedItemIds?.includes(b.id) ? 1 : 0;
          return aReserved - bReserved;
        });
        break;
    }
    return sorted;
  }, [sortMode, orderedItems, reservations, reservedItemIds]);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = orderedItems.findIndex((i) => i.id === active.id);
      const newIndex = orderedItems.findIndex((i) => i.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const newItems = [...orderedItems];
      const [moved] = newItems.splice(oldIndex, 1);
      newItems.splice(newIndex, 0, moved);
      setOrderedItems(newItems);

      await reorderItems(
        locale,
        listId,
        listSlug,
        newItems.map((item) => item.id)
      );
    },
    [orderedItems, locale, listId, listSlug]
  );

  const activeItem = activeId
    ? orderedItems.find((i) => i.id === activeId)
    : null;

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
    [orderedItems, locale, listId, listSlug]
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
    [orderedItems, locale, listId, listSlug]
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
  }, [deletingItem, locale, listSlug, router]);

  const isDragDisabled = sortMode !== "custom";

  return (
    <div>
      {/* Section header */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg font-semibold text-landing-text">
            {t("sectionTitle")}
          </h2>
          <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-landing-text/5 px-2 text-xs font-medium text-landing-text-muted">
            {orderedItems.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {orderedItems.length > 1 && (
            <Select value={sortMode} onValueChange={setSortMode}>
              <SelectTrigger className="h-8 w-auto gap-1.5 border-landing-text/10 px-2.5 text-xs">
                <ArrowUpDown className="h-3 w-3 text-landing-text-muted" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">{tSort("custom")}</SelectItem>
                <SelectItem value="priority">{tSort("priority")}</SelectItem>
                <SelectItem value="price_low">{tSort("priceLow")}</SelectItem>
                <SelectItem value="price_high">
                  {tSort("priceHigh")}
                </SelectItem>
                <SelectItem value="name_az">{tSort("nameAz")}</SelectItem>
                <SelectItem value="date_newest">
                  {tSort("dateNewest")}
                </SelectItem>
                <SelectItem value="date_oldest">
                  {tSort("dateOldest")}
                </SelectItem>
                <SelectItem value="available_first">
                  {tSort("availableFirst")}
                </SelectItem>
              </SelectContent>
            </Select>
          )}
          <Button
            onClick={() => setAddDialogOpen(true)}
            size="sm"
            className="cursor-pointer bg-landing-coral-dark text-white hover:bg-landing-coral-hover"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            {t("addButton")}
          </Button>
        </div>
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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedItems.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3" ref={animateRef}>
              {sortedItems.map((item, index) => {
                const itemLocked =
                  privacyMode === "full_surprise" &&
                  isPublished &&
                  !!publishedAt &&
                  !!item.created_at &&
                  item.created_at <= publishedAt;
                return (
                  <SortableGiftCard
                    key={item.id}
                    item={item}
                    isDragDisabled={isDragDisabled}
                    isFirst={index === 0}
                    isLast={index === sortedItems.length - 1}
                    locale={locale}
                    reservation={reservations?.[item.id]}
                    privacyMode={privacyMode}
                    isReserved={
                      !!reservations?.[item.id] ||
                      !!reservedItemIds?.includes(item.id)
                    }
                    hasAnyReservation={
                      (reservedItemIds?.length ?? 0) > 0 ||
                      Object.keys(reservations ?? {}).length > 0
                    }
                    isLocked={itemLocked}
                    onMoveUp={() => handleMoveUp(index)}
                    onMoveDown={() => handleMoveDown(index)}
                    onEdit={() => handleEdit(item)}
                    onDelete={() => handleDeleteClick(item)}
                  />
                );
              })}
            </div>
          </SortableContext>
          <DragOverlay>
            {activeItem ? (
              <div className="scale-[1.02] rounded-2xl shadow-xl ring-2 ring-landing-coral/20">
                <GiftCard
                  item={activeItem}
                  isFirst={false}
                  isLast={false}
                  locale={locale}
                  reservation={reservations?.[activeItem.id]}
                  privacyMode={privacyMode}
                  isReserved={false}
                  hasAnyReservation={false}
                  isLocked={false}
                  isDragDisabled={true}
                  onMoveUp={() => {}}
                  onMoveDown={() => {}}
                  onEdit={() => {}}
                  onDelete={() => {}}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Add gift dialog — key forces remount to reset form */}
      {addDialogOpen && (
        <GiftFormDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          listId={listId}
          listSlug={listSlug}
          locale={locale}
          isPublishedSurprise={
            privacyMode === "full_surprise" && isPublished
          }
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
          privacyMode === "full_surprise" &&
          deletingItem &&
          reservedItemIds?.includes(deletingItem.id)
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
