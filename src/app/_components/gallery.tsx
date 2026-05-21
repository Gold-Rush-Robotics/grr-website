"use client";

import { Typography } from "@/app/_components/typography";
import { Card } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { AlertTriangle, ChevronRight, Loader2, MapPin } from "lucide-react";
import { DateTime } from "luxon";
import { useEffect, useMemo, useRef, useState } from "react";
import { GalleryFullscreen } from "./gallery-fullscreen";
import { Link } from "./link";
import {
  useGalleryPhotoUrl,
  type SelectedPhoto,
} from "@/app/_hooks/useGalleryPhotoUrl";

export type { SelectedPhoto };

interface MonthSectionProps {
  month: string;
  count: number;
  scrollAnchorClassName?: string;
  onPhotoClick: (photo: SelectedPhoto) => void;
}

interface PhotoPreviewProps {
  src?: string;
  description?: string | null;
  location?: string | null;
  index: number;
  loading?: boolean;
  error?: boolean;
  onClick: (index: number) => void;
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
  const { selectedPhoto, setSelectedPhoto } = useGalleryPhotoUrl();

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

      <GalleryFullscreen
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
        description={photosData?.[i]?.description}
        location={photosData?.[i]?.location}
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
  description,
  location,
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
          {(description || location) && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 space-y-1 bg-gradient-to-b from-transparent to-black/60 to-[2.5rem] p-2 pt-10 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              {description && (
                <Typography
                  variant="small"
                  className="line-clamp-2 sm:line-clamp-4"
                >
                  {description}
                </Typography>
              )}
              {location && (
                <Typography variant="small" className="line-clamp-1">
                  <MapPin className="mr-1 inline-block size-3.5" />
                  {location}
                </Typography>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center">
          <Typography>Missing photo source URL</Typography>
        </div>
      )}
    </Card>
  );
}
