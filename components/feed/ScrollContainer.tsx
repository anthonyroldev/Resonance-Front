"use client";

import { AuthPromptDialog } from "@/components/auth/AuthPromptDialog";
import { getDiscoveryFeed } from "@/lib/api";
import { Media } from "@/lib/types";
import { getAuthToken } from "@/lib/utils";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Spinner } from "../ui/spinner";
import { FeedEndPrompt } from "./FeedEndPrompt";
import { FeedItem } from "./FeedItem";

const GUEST_AUTH_PROMPT_INDEX = 3; // Show prompt after viewing 3 items (when scrolling to 4th)
const GUEST_MAX_INDEX = 4; // Block at 5th item (index 4)
const PAGE_SIZE = 10;

export function ScrollContainer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const hasSeenPromptRef = useRef(false);

  const token = getAuthToken() || "";
  const isAuthenticated = !!token;

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
      getDiscoveryFeed(token, pageParam, PAGE_SIZE),
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.page + 1,
    initialPageParam: 0,
  });

  // Flatten paginated data into a single array
  const feed: Media[] = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.content);
  }, [data]);

  // Check if we've reached the end of content for guests
  const isGuestAtEnd = !isAuthenticated && activeIndex >= GUEST_MAX_INDEX;

  // Handle active index change - check if auth prompt should show
  const handleActiveIndexChange = useCallback(
    (index: number) => {
      setActiveIndex(index);

      // Show auth prompt for guests after viewing 3 items
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

  // Intersection observer to track active item
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

  // Prevent scrolling past the limit for guests
  useEffect(() => {
    const container = containerRef.current;
    if (!container || isAuthenticated) return;

    const handleScroll = () => {
      if (isGuestAtEnd) {
        const maxScrollTop = GUEST_MAX_INDEX * window.innerHeight;
        if (container.scrollTop > maxScrollTop) {
          container.scrollTop = maxScrollTop;
        }
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [isAuthenticated, isGuestAtEnd]);

  if (isLoading) {
    return (
      <div className="h-dvh w-full flex items-center justify-center bg-black">
        <Spinner className="size-8" />
      </div>
    );
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
            key={item.id}
            data-index={index}
            className="feed-item h-dvh w-full snap-start"
          >
            <FeedItem item={item} isActive={activeIndex === index} />
          </div>
        ))}

        {/* Loading spinner for authenticated users fetching next page */}
        {isAuthenticated && isFetchingNextPage && (
          <div className="h-dvh w-full flex items-center justify-center bg-black snap-start">
            <Spinner className="size-8" />
          </div>
        )}

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
