"use client";

import { Typography } from "@/app/_components/typography";
import { Card } from "@/components/ui/card";
import { api } from "@/trpc/react";
import { AlertTriangle, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { DateTime } from "luxon";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "./link";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface MonthSectionProps {
  month: string;
  count: number;
  scrollAnchorClassName?: string;
  onPhotoClick: (photo: SelectedPhoto) => void;
}

interface PhotoPreviewProps {
  src?: string;
  index: number;
  loading?: boolean;
  error?: boolean;
  onClick: (index: number) => void;
}

interface PhotoFullscreenProps {
  selectedPhoto: SelectedPhoto | null;
  setSelectedPhoto: (photo: SelectedPhoto | null) => void;
  photoCounts: PhotoCountItem[];
}

interface SelectedPhoto {
  month: string;
  index: number;
}

interface PhotoCountItem {
  month: string;
  count: number;
}

function groupPhotoCountsByYear(
  photoCounts: { month: string; count: number }[],
): { year: number; months: { month: string; count: number }[] }[] {
  const map = new Map<number, { month: string; count: number }[]>();
  for (const item of photoCounts) {
    const year = DateTime.fromISO(item.month).year;
    const bucket = map.get(year);
    if (bucket) bucket.push(item);
    else map.set(year, [item]);
  }
  return Array.from(map.entries(), ([year, months]) => ({ year, months }));
}

export default function Gallery() {
  const [selectedPhoto, setSelectedPhoto] = useState<SelectedPhoto | null>(
    null,
  );

  const {
    data: photoCounts,
    isLoading: photoCountsLoading,
    error: photoCountsError,
  } = api.photos.getCountsByMonth.useQuery();

  if (photoCountsLoading) {
    return <Typography>Loading photos...</Typography>;
  }

  if (photoCountsError) {
    return (
      <Typography className="text-destructive">
        Failed to load photos.
      </Typography>
    );
  }

  if (!photoCounts || photoCounts.length === 0) {
    return <Typography>No photos uploaded yet.</Typography>;
  }

  return (
    <>
      <div className="relative">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1 space-y-8">
            {photoCounts.map((month) => (
              <MonthSection
                key={month.month}
                month={month.month}
                count={month.count}
                onPhotoClick={setSelectedPhoto}
              />
            ))}
          </div>

          <aside
            className="sticky top-22 mr-[-20] shrink-0 text-right"
            aria-label="Jump to month"
          >
            <MonthNavigator photoCounts={photoCounts} />
          </aside>
        </div>
      </div>

      <PhotoFullscreen
        selectedPhoto={selectedPhoto}
        setSelectedPhoto={setSelectedPhoto}
        photoCounts={photoCounts}
      />
    </>
  );
}

export function MonthNavigator({
  photoCounts,
}: {
  photoCounts: { month: string; count: number }[];
}) {
  const [activeMonth, setActiveMonth] = useState<string | null>(
    () => photoCounts?.at(0)?.month ?? null,
  );

  const [expandedYears, setExpandedYears] = useState<Set<number>>(
    () => new Set(),
  );

  const byYear = useMemo(
    () => groupPhotoCountsByYear(photoCounts),
    [photoCounts],
  );

  const activeYear =
    activeMonth != null ? DateTime.fromISO(activeMonth).year : null;

  useEffect(() => {
    const monthIds = photoCounts?.map((m) => m.month) ?? [];

    const updateActive = () => {
      const lineY = 400;
      let current: string | null = monthIds[0] ?? null;
      for (const id of monthIds) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top <= lineY) {
          current = id;
        }
      }
      setActiveMonth(current);
    };

    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive);
    return () => {
      window.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
    };
  }, [photoCounts]);

  return (
    <nav
      className={cn(
        "flex max-h-[min(70vh,calc(100vh-10rem))] flex-col gap-1 overflow-y-auto",
      )}
    >
      {byYear.map(({ year, months }) => {
        const isOpen =
          expandedYears.has(year) ||
          (activeYear != null && activeYear === year);
        return (
          <Collapsible
            key={year}
            open={isOpen}
            onOpenChange={(open) => {
              setExpandedYears((prev) => {
                const next = new Set(prev);
                if (open) {
                  next.add(year);
                } else if (activeYear !== year) {
                  next.delete(year);
                }
                return next;
              });
            }}
          >
            <CollapsibleTrigger
              className={cn(
                "flex w-full items-center justify-end gap-1 rounded-md py-0.5 text-sm font-medium transition-colors",
                activeYear === year
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <ChevronRight
                className={cn(
                  "size-4 shrink-0 transition-transform duration-200 ease-out",
                  isOpen && "rotate-90",
                )}
                aria-hidden
              />
              <span className="text-base font-bold">{year}</span>
            </CollapsibleTrigger>
            <CollapsibleContent className="flex flex-col gap-1 pl-5">
              {months.map((m) => (
                <Link
                  key={m.month}
                  href={`#${m.month}`}
                  onClick={() => {
                    setExpandedYears(new Set());
                    setActiveMonth(m.month);
                  }}
                  className={cn(
                    "text-sm transition-all duration-200 ease-in-out",
                    activeMonth === m.month
                      ? "text-foreground font-bold"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  aria-current={
                    activeMonth === m.month ? "location" : undefined
                  }
                >
                  <span className="xl:hidden">
                    {DateTime.fromISO(m.month).toFormat("MMM")}
                  </span>
                  <span className="hidden xl:block">
                    {DateTime.fromISO(m.month).toFormat("MMMM")}
                  </span>
                </Link>
              ))}
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </nav>
  );
}

function MonthSection({
  month,
  count,
  scrollAnchorClassName,
  onPhotoClick,
}: MonthSectionProps) {
  const [canLoad, setCanLoad] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        setCanLoad(true);
      }
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  const {
    data: photosData,
    isLoading: photosLoading,
    error: photosError,
  } = api.photos.getMonthPhotos.useQuery({ date: month }, { enabled: canLoad });

  const photos = [];
  for (let i = 0; i < count; i++) {
    photos.push(
      <PhotoPreview
        key={i}
        src={photosData?.[i]?.thumbnailUrl}
        loading={photosLoading || (!canLoad && !photosData)}
        error={!!photosError}
        index={i}
        onClick={(index) => onPhotoClick({ month, index })}
      />,
    );
  }

  return (
    <div
      ref={ref}
      className={`scroll-mt-24 space-y-4 ${scrollAnchorClassName ?? ""}`}
      id={month}
    >
      <div className="space-y-0.5">
        <Typography variant="h2">
          {DateTime.fromISO(month).toFormat("MMMM yyyy")}
        </Typography>
        <Typography variant="muted">{count} photos</Typography>
      </div>
      <div className="grid grid-cols-3 gap-2 md:grid-cols-4 lg:grid-cols-6">
        {photos}
      </div>
    </div>
  );
}

function PhotoPreview({
  src,
  index,
  loading,
  error,
  onClick,
}: PhotoPreviewProps) {
  return (
    <Card
      className="group hover:bg-muted-foreground/20 flex aspect-square items-center justify-center p-0 transition-colors"
      onClick={() => onClick(index)}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <Loader2 className="size-4 animate-spin" />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center">
          <AlertTriangle className="size-4" />
        </div>
      ) : src ? (
        <div className="relative aspect-square h-full w-full">
          <img
            src={src}
            className="aspect-square h-full w-full object-cover transition duration-200 group-hover:brightness-65"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="flex items-center justify-center">
          <Typography>Missing photo source URL</Typography>
        </div>
      )}
    </Card>
  );
}

function PhotoFullscreen({
  selectedPhoto,
  setSelectedPhoto,
  photoCounts,
}: PhotoFullscreenProps) {
  const {
    data: monthPhotosData,
    isLoading: monthPhotosLoading,
    error: monthPhotosError,
  } = api.photos.getMonthPhotos.useQuery(
    { date: selectedPhoto?.month! },
    { enabled: !!selectedPhoto },
  );

  const photo = monthPhotosData?.[selectedPhoto?.index ?? 0];
  const src = photo?.fullResUrl;

  function nextPhoto() {
    if (!selectedPhoto || !photoCounts) return;
    const nextIndex = selectedPhoto.index + 1;
    const currMonthIndex = photoCounts.findIndex(
      (m) => m.month === selectedPhoto.month,
    );
    if (currMonthIndex === -1) return;

    if (nextIndex < photoCounts[currMonthIndex]!.count) {
      setSelectedPhoto({ month: selectedPhoto.month, index: nextIndex });
      return;
    }

    const nextMonth = photoCounts[currMonthIndex + 1]?.month;
    if (nextMonth) {
      setSelectedPhoto({ month: nextMonth, index: 0 });
    }
  }

  function prevPhoto() {
    if (!selectedPhoto || !photoCounts) return;
    const prevIndex = selectedPhoto.index - 1;
    const currMonthIndex = photoCounts.findIndex(
      (m) => m.month === selectedPhoto.month,
    );
    if (currMonthIndex === -1) return;

    if (prevIndex >= 0) {
      setSelectedPhoto({ month: selectedPhoto.month, index: prevIndex });
      return;
    }

    const prevMonth = photoCounts[currMonthIndex - 1]?.month;
    if (prevMonth) {
      setSelectedPhoto({
        month: prevMonth,
        index: photoCounts[currMonthIndex - 1]!.count - 1,
      });
    }
  }

  return (
    <Dialog
      open={!!selectedPhoto}
      onOpenChange={(open) => !open && setSelectedPhoto(null)}
    >
      <DialogContent
        className="inline-flex h-auto max-h-[80vh] w-auto max-w-[80vw] items-center justify-center overflow-hidden p-2 sm:max-w-[80vw]"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            nextPhoto();
          } else if (e.key === "ArrowLeft") {
            prevPhoto();
          }
        }}
      >
        {monthPhotosLoading ? (
          <div className="flex items-center justify-center">
            <Loader2 className="size-4 animate-spin" />
          </div>
        ) : monthPhotosError ? (
          <div className="flex items-center justify-center">
            <AlertTriangle className="size-4" />
            <Typography className="text-destructive">
              Failed to load photo
            </Typography>
          </div>
        ) : (
          <img
            src={src}
            className="block h-auto max-h-[calc(80vh-1rem)] w-auto max-w-[calc(80vw-1rem)] object-contain"
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
