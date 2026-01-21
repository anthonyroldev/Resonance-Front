"use client";

import { AuthGate } from "@/components/auth/AuthGate";
import { BlurFade } from "@/components/ui/blur-fade";
import { Button } from "@/components/ui/button";
import { Marquee } from "@/components/ui/marquee";
import { addToFavorites } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Media } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { ExternalLink, Heart, Plus } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface FeedItemProps {
  item: Media;
  isActive: boolean;
}

export function FeedItem({ item, isActive }: FeedItemProps) {
  const imageUrl = item.imageUrl || "/placeholder.png";
  const { token } = useAuth();
  const [isLiked, setIsLiked] = useState(false);

  const likeMutation = useMutation({
    mutationFn: () => addToFavorites(token!, item.id),
    onSuccess: () => {
      setIsLiked(true);
    },
  });

  const handleLike = () => {
    if (!isLiked && !likeMutation.isPending) {
      likeMutation.mutate();
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-black snap-start shrink-0">
      <div className="absolute inset-0 z-0">
        <Image
          src={imageUrl}
          alt={item.title}
          fill
          className="object-cover opacity-40 blur-3xl scale-110"
          priority={isActive}
        />
        <div className="absolute inset-0 bg-linear-to-b from-black/30 via-transparent to-black/90" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6 flex flex-col items-center gap-8">
        <BlurFade
          delay={0.1}
          inView={isActive}
          className="relative aspect-square w-full max-w-[320px] shadow-2xl rounded-xl overflow-hidden ring-1 ring-white/10"
        >
          <Image
            src={imageUrl}
            alt={item.title}
            fill
            sizes="(max-width: 768px) 100vw, 320px"
            className="object-cover"
            priority={isActive}
          />
        </BlurFade>

        {item.itunesUrl && (
          <BlurFade delay={0.2} inView={isActive} className="w-full max-w-[320px]">
            <Button
              variant="outline"
              className="w-full gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm"
              onClick={() => window.open(item.itunesUrl!, "_blank")}
            >
              <ExternalLink className="w-4 h-4" />
              Ecouter sur Apple Music
            </Button>
          </BlurFade>
        )}

        <div className="w-full space-y-6">
          <div className="text-center space-y-2">
            <div className="h-8 overflow-hidden">
              {item.title.length > 25 ? (
                <Marquee pauseOnHover className="[--duration:20s]">
                  <h2 className="text-2xl font-bold text-white px-4">
                    {item.title}
                  </h2>
                </Marquee>
              ) : (
                <h2 className="text-2xl font-bold text-white">{item.title}</h2>
              )}
            </div>
            <p className="text-white/60 text-lg font-medium">
              {item.artistName}
            </p>
          </div>

          <div className="flex items-center justify-center gap-6">
            <AuthGate onAuthenticated={handleLike}>
              {(handleAction) => (
                <Button
                  size="icon"
                  variant="ghost"
                  className={cn(
                    "w-12 h-12 rounded-full backdrop-blur-sm transition-colors",
                    isLiked
                      ? "bg-red-500/20 text-red-500 hover:bg-red-500/30 hover:text-red-500"
                      : "bg-white/10 hover:bg-white/20 text-white"
                  )}
                  onClick={handleAction}
                  disabled={likeMutation.isPending}
                >
                  <Heart
                    className={cn("w-6 h-6", isLiked && "fill-current")}
                  />
                </Button>
              )}
            </AuthGate>

            <AuthGate>
              {(handleAction) => (
                <Button
                  size="icon"
                  variant="ghost"
                  className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
                  onClick={handleAction}
                >
                  <Plus className="w-6 h-6" />
                </Button>
              )}
            </AuthGate>
          </div>
        </div>
      </div>
    </div>
  );
}
