import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { api, type RouterOutputs } from "@/trpc/react";
import {
  Loader2,
  AlertTriangle,
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from "lucide-react";
import { DateTime } from "luxon";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Typography } from "./typography";
import type { SelectedPhoto } from "@/app/_hooks/useGalleryPhotoUrl";

const CONTROLS_HIDE_DELAY_MS = 3000;
const NAV_ANIM_DURATION_MS = 250;
const SWIPE_DISTANCE_PX = 80;
const DRAG_THRESHOLD_PX = 8;
const SLOT_GAP_PX = 16;

type MonthPhoto = RouterOutputs["photos"]["getMonthPhotos"][number];

interface PhotoFullscreenProps {
  selectedPhoto: SelectedPhoto | null;
  setSelectedPhoto: (photo: SelectedPhoto | null) => void;
  photoCounts: PhotoCountItem[];
}

interface PhotoCountItem {
  month: string;
  count: number;
}

function preloadImage(url: string | undefined) {
  if (!url) return;
  const img = new Image();
  img.src = url;
}

export function GalleryFullscreen({
  selectedPhoto,
  setSelectedPhoto,
  photoCounts,
}: PhotoFullscreenProps) {
  const utils = api.useUtils();
  const { data: monthPhotosData, error: monthPhotosError } =
    api.photos.getMonthPhotos.useQuery(
      { date: selectedPhoto?.month! },
      { enabled: !!selectedPhoto },
    );

  const selectedIndex = selectedPhoto?.index ?? 0;
  const currentPhoto = monthPhotosData?.[selectedIndex];
  const prevPhoto =
    selectedIndex > 0 ? monthPhotosData?.[selectedIndex - 1] : undefined;
  const nextPhoto = monthPhotosData?.[selectedIndex + 1];

  const currMonthIndex = selectedPhoto
    ? photoCounts.findIndex((m) => m.month === selectedPhoto.month)
    : -1;
  const currMonth =
    currMonthIndex >= 0 ? (photoCounts[currMonthIndex] ?? null) : null;

  const hasPrev =
    selectedPhoto != null && (selectedPhoto.index > 0 || currMonthIndex > 0);
  const hasNext =
    selectedPhoto != null &&
    currMonth != null &&
    (selectedPhoto.index < currMonth.count - 1 ||
      currMonthIndex < photoCounts.length - 1);

  // Ref for carousel strip element; allows direct DOM transforms to avoid re-renders.
  const stripRef = useRef<HTMLDivElement | null>(null);
  const isAnimatingRef = useRef(false);

  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Touch: dragging reveals next/prev image; tap-to-toggle only if started on photo.
  const dragRef = useRef<{
    startX: number;
    startY: number;
    isDragging: boolean;
    isHorizontal: boolean;
    startedOnButton: boolean;
    startedOnImage: boolean;
  } | null>(null);

  // Preload adjacent images and photos from neighboring months to speed up navigation.
  useEffect(() => {
    if (!selectedPhoto || !currMonth || !monthPhotosData) return;

    for (let offset = -2; offset <= 2; offset++) {
      if (offset === 0) continue;
      preloadImage(monthPhotosData[selectedPhoto.index + offset]?.fullResUrl);
    }

    if (
      selectedPhoto.index >= currMonth.count - 2 &&
      currMonthIndex < photoCounts.length - 1
    ) {
      const nextMonth = photoCounts[currMonthIndex + 1]?.month;
      if (nextMonth) {
        void utils.photos.getMonthPhotos
          .prefetch({ date: nextMonth })
          .then(() => {
            preloadImage(
              utils.photos.getMonthPhotos.getData({ date: nextMonth })?.[0]
                ?.fullResUrl,
            );
          });
      }
    }
    if (selectedPhoto.index <= 1 && currMonthIndex > 0) {
      const prevMonth = photoCounts[currMonthIndex - 1]?.month;
      if (prevMonth) {
        void utils.photos.getMonthPhotos
          .prefetch({ date: prevMonth })
          .then(() => {
            const data = utils.photos.getMonthPhotos.getData({
              date: prevMonth,
            });
            preloadImage(data?.[data.length - 1]?.fullResUrl);
          });
      }
    }
  }, [
    selectedPhoto,
    currMonth,
    currMonthIndex,
    monthPhotosData,
    photoCounts,
    utils,
  ]);

  // Shows or hides the photo controls based on the selected photo state.
  useEffect(() => {
    if (!selectedPhoto) {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      setControlsVisible(true);
      return;
    }
    setControlsVisible(true);
    hideTimerRef.current = setTimeout(
      () => setControlsVisible(false),
      CONTROLS_HIDE_DELAY_MS,
    );
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [selectedPhoto]);

  function goNext() {
    if (!selectedPhoto || !currMonth || !hasNext) return;
    const nextIndex = selectedPhoto.index + 1;
    if (nextIndex < currMonth.count) {
      setSelectedPhoto({ month: selectedPhoto.month, index: nextIndex });
      return;
    }
    const nextMonth = photoCounts[currMonthIndex + 1]?.month;
    if (nextMonth) {
      setSelectedPhoto({ month: nextMonth, index: 0 });
    }
  }

  function goPrev() {
    if (!selectedPhoto || !hasPrev) return;
    const prevIndex = selectedPhoto.index - 1;
    if (prevIndex >= 0) {
      setSelectedPhoto({ month: selectedPhoto.month, index: prevIndex });
      return;
    }
    const prevMonthData = photoCounts[currMonthIndex - 1];
    if (prevMonthData) {
      setSelectedPhoto({
        month: prevMonthData.month,
        index: prevMonthData.count - 1,
      });
    }
  }

  /**
   * Slides the carousel strip in the given direction, updates photo state, and resets the transform.
   * For navigation within the same month, the neighbor is already rendered.
   * For cross-month navigation, the strip slides out and the new photo appears centered.
   */
  function navigate(direction: "next" | "prev") {
    if (isAnimatingRef.current) return;
    if (direction === "next" ? !hasNext : !hasPrev) return;

    const strip = stripRef.current;
    if (!strip) {
      if (direction === "next") goNext();
      else goPrev();
      return;
    }

    const dir = direction === "next" ? -1 : 1;
    const width = strip.clientWidth || window.innerWidth;
    // Slide by width + gap so the neighbour, which sits at ±(100% + gap),
    // lands exactly at center.
    const distance = width + SLOT_GAP_PX;

    isAnimatingRef.current = true;
    strip.style.transition = `transform ${NAV_ANIM_DURATION_MS}ms ease-out`;
    strip.style.transform = `translateX(${dir * distance}px)`;

    setTimeout(() => {
      flushSync(() => {
        if (direction === "next") goNext();
        else goPrev();
      });
      const s = stripRef.current;
      if (s) {
        s.style.transition = "none";
        s.style.transform = "";
      }
      isAnimatingRef.current = false;
    }, NAV_ANIM_DURATION_MS);
  }

  /**
   * Resets the carousel strip transform to its initial position, stopping any active animation.
   */
  function snapStripBack() {
    const s = stripRef.current;
    if (!s) return;
    s.style.transition = `transform ${NAV_ANIM_DURATION_MS}ms ease-out`;
    s.style.transform = "";
  }

  function showControls() {
    setControlsVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(
      () => setControlsVisible(false),
      CONTROLS_HIDE_DELAY_MS,
    );
  }
  function hideControls() {
    setControlsVisible(false);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
  }

  function handleTouchStart(e: React.TouchEvent) {
    if (isAnimatingRef.current) return;
    const t = e.touches[0];
    if (!t) return;
    const target = e.target instanceof HTMLElement ? e.target : null;
    dragRef.current = {
      startX: t.clientX,
      startY: t.clientY,
      isDragging: false,
      isHorizontal: false,
      startedOnButton: target?.closest("button") != null,
      startedOnImage: target instanceof HTMLImageElement,
    };
    const s = stripRef.current;
    if (s) s.style.transition = "";
  }

  function handleTouchMove(e: React.TouchEvent) {
    const drag = dragRef.current;
    if (!drag || drag.startedOnButton || isAnimatingRef.current) return;
    const t = e.touches[0];
    if (!t) return;
    const dx = t.clientX - drag.startX;
    const dy = t.clientY - drag.startY;

    if (!drag.isDragging) {
      if (
        Math.abs(dx) < DRAG_THRESHOLD_PX &&
        Math.abs(dy) < DRAG_THRESHOLD_PX
      ) {
        return;
      }
      drag.isDragging = true;
      drag.isHorizontal = Math.abs(dx) > Math.abs(dy);
    }

    if (drag.isHorizontal && stripRef.current) {
      const atGalleryEdge = (dx > 0 && !hasPrev) || (dx < 0 && !hasNext);
      const offset = atGalleryEdge ? dx * 0.25 : dx;
      stripRef.current.style.transform = `translateX(${offset}px)`;
    }
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const drag = dragRef.current;
    dragRef.current = null;
    if (!drag) return;

    if (drag.startedOnButton) {
      // Button handles its own click; never toggle or animate here.
      return;
    }

    const end = e.changedTouches[0];
    if (!end) {
      snapStripBack();
      return;
    }
    const dx = end.clientX - drag.startX;
    const dy = end.clientY - drag.startY;

    if (drag.isDragging && drag.isHorizontal) {
      const canNav = (dx < 0 && hasNext) || (dx > 0 && hasPrev);
      const passedThreshold = Math.abs(dx) > SWIPE_DISTANCE_PX && canNav;
      if (passedThreshold) {
        navigate(dx < 0 ? "next" : "prev");
      } else {
        snapStripBack();
      }
    } else if (!drag.isDragging) {
      // Only count as a tap-to-toggle if the touch landed on the photo itself.
      if (
        drag.startedOnImage &&
        Math.abs(dx) < DRAG_THRESHOLD_PX &&
        Math.abs(dy) < DRAG_THRESHOLD_PX
      ) {
        if (controlsVisible) hideControls();
        else showControls();
      }
    }
  }

  const monthLabel = currentPhoto
    ? DateTime.fromISO(currentPhoto.takenAt.toISOString()).toFormat(
        "MMMM d, yyyy",
      )
    : "";

  const controlClass = cn(
    "transition-opacity duration-300",
    controlsVisible ? "opacity-100" : "pointer-events-none opacity-0",
  );
  const buttonClass =
    "rounded-full bg-black/50 p-3 text-white backdrop-blur-sm transition-colors hover:bg-black/70 focus:ring-2 focus:ring-white/50 focus:outline-none";

  return (
    <Dialog
      open={!!selectedPhoto}
      onOpenChange={(open) => !open && setSelectedPhoto(null)}
    >
      <DialogContent
        showCloseButton={false}
        className={cn(
          "fixed inset-0 max-h-none max-w-none translate-x-0 translate-y-0 touch-none overflow-hidden rounded-none border-0 bg-black p-0 shadow-none sm:max-w-none",
          !controlsVisible && "cursor-none",
        )}
        onPointerMove={(e) => {
          if (e.pointerType === "mouse") showControls();
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onKeyDown={(e) => {
          showControls();
          if (e.key === "ArrowRight") navigate("next");
          else if (e.key === "ArrowLeft") navigate("prev");
        }}
      >
        <DialogTitle className="sr-only">
          {selectedPhoto && currMonth
            ? `Photo ${selectedPhoto.index + 1} of ${currMonth.count}, ${monthLabel}`
            : "Photo"}
        </DialogTitle>

        {/* Carousel emulation using three slots: previous, current, next */}
        <div ref={stripRef} className="absolute inset-0">
          {prevPhoto && (
            <PhotoSlot
              key={prevPhoto.id}
              photo={prevPhoto}
              offsetTransform={`translateX(calc(-100% - ${SLOT_GAP_PX}px))`}
            />
          )}
          {currentPhoto && (
            <PhotoSlot
              key={currentPhoto.id}
              photo={currentPhoto}
              offsetTransform="translateX(0)"
            />
          )}
          {nextPhoto && (
            <PhotoSlot
              key={nextPhoto.id}
              photo={nextPhoto}
              offsetTransform={`translateX(calc(100% + ${SLOT_GAP_PX}px))`}
            />
          )}
        </div>

        {selectedPhoto && !currentPhoto && !monthPhotosError && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <Loader2 className="size-8 animate-spin text-white" />
          </div>
        )}
        {monthPhotosError && !currentPhoto && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 text-white">
            <AlertTriangle className="size-6" />
            <Typography className="text-white">Failed to load photo</Typography>
          </div>
        )}

        {selectedPhoto && currMonth && (
          <div
            className={cn(
              "pointer-events-none fixed top-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white tabular-nums backdrop-blur-sm",
              controlClass,
            )}
          >
            {monthLabel}
          </div>
        )}

        <DialogClose
          aria-label="Close"
          className={cn("fixed top-3 right-3 z-10", buttonClass, controlClass)}
        >
          <X className="size-5" />
        </DialogClose>

        {hasPrev && (
          <button
            type="button"
            onClick={() => navigate("prev")}
            aria-label="Previous photo"
            className={cn(
              "fixed top-1/2 left-2 z-10 -translate-y-1/2 sm:left-4",
              buttonClass,
              controlClass,
            )}
          >
            <ChevronLeft className="size-6" />
          </button>
        )}

        {hasNext && (
          <button
            type="button"
            onClick={() => navigate("next")}
            aria-label="Next photo"
            className={cn(
              "fixed top-1/2 right-2 z-10 -translate-y-1/2 sm:right-4",
              buttonClass,
              controlClass,
            )}
          >
            <ChevronRight className="size-6" />
          </button>
        )}

        {/* Caption allows taps for toggling controls; controlClass prevents interaction when hidden. */}
        {currentPhoto &&
          (currentPhoto.description || currentPhoto.location) && (
            <div
              className={cn(
                "absolute inset-x-0 bottom-0 z-10 space-y-1 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-6 pt-16 pb-6 text-white",
                controlClass,
              )}
            >
              {currentPhoto.description && (
                <Typography variant="small" className="text-white">
                  {currentPhoto.description}
                </Typography>
              )}
              {currentPhoto.location && (
                <Typography variant="small" className="text-white/80">
                  <MapPin className="mr-1 inline-block size-3.5" />
                  {currentPhoto.location}
                </Typography>
              )}
            </div>
          )}
      </DialogContent>
    </Dialog>
  );
}

function PhotoSlot({
  photo,
  offsetTransform,
}: {
  photo: MonthPhoto;
  offsetTransform: string;
}) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{ transform: offsetTransform }}
    >
      <img
        src={photo.fullResUrl}
        alt={photo.description ?? ""}
        draggable={false}
        loading="eager"
        className="max-h-full max-w-full object-contain select-none"
      />
    </div>
  );
}
