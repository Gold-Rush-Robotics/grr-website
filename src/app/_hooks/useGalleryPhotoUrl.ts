"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface SelectedPhoto {
  month: string;
  index: number;
}

const PHOTO_PARAM = "photo";
const MONTH_INDEX_RE = /^(\d{4}-(?:0[1-9]|1[0-2])):(\d+)$/;

function parsePhotoParam(value: string | null) {
  if (!value) return null;
  const match = MONTH_INDEX_RE.exec(value);
  if (!match) return null;
  const month = match[1];
  const index = Number(match[2]);
  if (!month || !Number.isInteger(index) || index < 0) return null;
  return { month, index };
}

function formatPhotoParam(photo: SelectedPhoto) {
  return `${photo.month}:${photo.index}`;
}

function readPhotoFromLocation() {
  if (typeof window === "undefined") return null;
  return parsePhotoParam(
    new URLSearchParams(window.location.search).get(PHOTO_PARAM),
  );
}

function writePhotoToHistory(
  photo: SelectedPhoto | null,
  method: "push" | "replace",
) {
  const url = new URL(window.location.href);
  if (photo) {
    url.searchParams.set(PHOTO_PARAM, formatPhotoParam(photo));
  } else {
    url.searchParams.delete(PHOTO_PARAM);
  }
  const state = { galleryPhoto: photo };
  if (method === "push") {
    window.history.pushState(state, "", url);
  } else {
    window.history.replaceState(state, "", url);
  }
}

export function useGalleryPhotoUrl() {
  const [selectedPhoto, setSelectedPhotoState] = useState<SelectedPhoto | null>(
    null,
  );
  const selectedRef = useRef<SelectedPhoto | null>(null);
  const didPushPhotoRef = useRef(false);

  useEffect(() => {
    const initial = readPhotoFromLocation();
    selectedRef.current = initial;
    setSelectedPhotoState(initial);
    didPushPhotoRef.current = initial != null;
  }, []);

  useEffect(() => {
    const onPopState = () => {
      const photo = readPhotoFromLocation();
      selectedRef.current = photo;
      setSelectedPhotoState(photo);
      didPushPhotoRef.current = photo != null;
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const setSelectedPhoto = useCallback((next: SelectedPhoto | null) => {
    const current = selectedRef.current;

    if (next === null) {
      if (current === null) return;
      selectedRef.current = null;
      setSelectedPhotoState(null);
      if (didPushPhotoRef.current) {
        didPushPhotoRef.current = false;
        window.history.back();
      } else {
        writePhotoToHistory(null, "replace");
      }
      return;
    }

    const method = current === null ? "push" : "replace";
    if (method === "push") {
      didPushPhotoRef.current = true;
    }

    selectedRef.current = next;
    setSelectedPhotoState(next);
    writePhotoToHistory(next, method);
  }, []);

  return { selectedPhoto, setSelectedPhoto };
}
