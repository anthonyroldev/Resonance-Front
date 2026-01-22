"use client";

import { AuthPromptDialog } from "@/components/auth/AuthPromptDialog";
import { getDiscoveryFeed } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Media } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { FeedEndPrompt } from "./FeedEndPrompt";
import { FeedItem } from "./FeedItem";

const GUEST_AUTH_PROMPT_INDEX = 3;
const PAGE_SIZE = 10;

export function ScrollContainer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const hasSeenPromptRef = useRef(false);

  const { token, isAuthenticated } = useAuth();

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["discoveryFeed", token],
    queryFn: ({ pageParam = 0 }) =>
      getDiscoveryFeed(token ?? "", pageParam, PAGE_SIZE),
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.page + 1,
    initialPageParam: 0,
  });

  const feed: Media[] = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.content);
  }, [data]);

  const handleActiveIndexChange = useCallback(
    (index: number) => {
      setActiveIndex(index);

      if (
        !isAuthenticated &&
        index >= GUEST_AUTH_PROMPT_INDEX &&
        !hasSeenPromptRef.current
      ) {
        hasSeenPromptRef.current = true;
        setShowAuthPrompt(true);
      }
    },
    [isAuthenticated]
  );

  // Fetch next page for authenticated users when approaching end
  useEffect(() => {
    if (
      isAuthenticated &&
      hasNextPage &&
      !isFetchingNextPage &&
      activeIndex >= feed.length - 3
    ) {
      fetchNextPage();
    }
  }, [
    activeIndex,
    feed.length,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isAuthenticated,
  ]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-index"));
            if (!isNaN(index)) {
              handleActiveIndexChange(index);
            }
          }
        });
      },
      {
        root: container,
        threshold: 0.6,
      }
    );

    const items = container.querySelectorAll(".feed-item");
    items.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, [feed, handleActiveIndexChange]);

  if (isLoading) {
    return <FeedItemSkeleton />;
  }

  if (error) {
    return (
      <div className="h-dvh w-full flex items-center justify-center bg-black">
        <div className="text-red-400">Failed to load feed</div>
      </div>
    );
  }

  return (
    <>
      <div
        ref={containerRef}
        className="h-dvh w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar"
      >
        {feed.map((item, index) => (
          <div
            key={`${item.type}-${item.id}`}
            data-index={index}
            className="feed-item h-dvh w-full snap-start"
          >
            <FeedItem item={item} isActive={activeIndex === index} />
          </div>
        ))}

        {/* Loading skeleton for authenticated users fetching next page */}
        {isAuthenticated && isFetchingNextPage && <FeedItemSkeleton />}

        {/* End prompt for guests */}
        {!isAuthenticated && feed.length > 0 && (
          <div
            data-index={feed.length}
            className="feed-item h-dvh w-full snap-start"
          >
            <FeedEndPrompt />
          </div>
        )}
      </div>

      {/* Auth prompt dialog */}
      <AuthPromptDialog
        open={showAuthPrompt}
        onOpenChange={setShowAuthPrompt}
        title="Vous aimez ce que vous voyez ?"
        description="Connectez-vous pour continuer a decouvrir plus de musique et sauvegarder vos favoris."
      />
    </>
  );
}

function FeedItemSkeleton() {
  return (
    <div className="h-dvh w-full flex items-center justify-center overflow-hidden bg-black snap-start shrink-0">
      <div className="relative z-10 w-full max-w-md px-6 flex flex-col items-center gap-8 animate-pulse">
        {/* Image Skeleton */}
        <Skeleton className="aspect-square w-full max-w-[320px] rounded-xl bg-neutral-800" />

        {/* Button Skeleton */}
        <Skeleton className="h-10 w-full max-w-[320px] rounded-md bg-neutral-800" />

        <div className="w-full space-y-6">
          <div className="text-center space-y-2 flex flex-col items-center">
            {/* Title Skeleton */}
            <Skeleton className="h-8 w-3/4 bg-neutral-800" />
            {/* Artist Skeleton */}
            <Skeleton className="h-6 w-1/2 bg-neutral-800" />
          </div>

          <div className="flex items-center justify-center gap-6">
            {/* Action Buttons Skeleton */}
            <Skeleton className="w-12 h-12 rounded-full bg-neutral-800" />
            <Skeleton className="w-12 h-12 rounded-full bg-neutral-800" />
          </div>
        </div>
      </div>
    </div>
  );
}