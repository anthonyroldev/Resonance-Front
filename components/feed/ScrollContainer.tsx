"use client";

import { getDiscoveryFeed } from "@/lib/api";
import { getAuthToken } from "@/lib/utils";
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from "react";
import { Spinner } from "../ui/spinner";
import { FeedItem } from "./FeedItem";

export function ScrollContainer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const { data: feed = [], isLoading, error } = useQuery({
    queryKey: ['discoveryFeed'],
    queryFn: () => {
      const token = getAuthToken() || '';
      return getDiscoveryFeed(token);
    },
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-index"));
            setActiveIndex(index);
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
  }, [feed]);

  if (isLoading) {
    return (
      <div className="h-dvh w-full flex items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-dvh w-full flex items-center justify-center">
        <div className="text-red-400">Failed to load feed</div>
      </div>
    );
  }

  return (
    <div 
        ref={containerRef}
        className="h-dvh w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar"
    >
      {feed.map((item, index) => (
        <div key={item.id} data-index={index} className="feed-item h-dvh w-full snap-start">
            <FeedItem item={item} isActive={activeIndex === index} />
        </div>
      ))}
    </div>
  );
}
