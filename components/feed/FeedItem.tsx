"use client";

import { AuthGate } from "@/components/auth/AuthGate";
import { AddToLibraryDialog } from "@/components/feed/AddToLibraryDialog";
import { BlurFade } from "@/components/ui/blur-fade";
import { Button } from "@/components/ui/button";
import { Marquee } from "@/components/ui/marquee";
import { addToFavorites, addToLibrary } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Media } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { ExternalLink, Heart, Pause, Play, Plus } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface FeedItemProps {
  item: Media;
  isActive: boolean;
}

export function FeedItem({ item, isActive }: FeedItemProps) {
  const imageUrl = item.imageUrl || "/placeholder.png";
  const { token } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [isInLibrary, setIsInLibrary] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const likeMutation = useMutation({
    mutationFn: () => addToFavorites(token!, item.id),
    onSuccess: () => {
      setIsLiked(true);
    },
  });

  const libraryMutation = useMutation({
    mutationFn: (comment: string) => 
      addToLibrary(token!, item.id, item.type, comment),
    onSuccess: () => {
      setIsInLibrary(true);
      setIsDialogOpen(false);
    },
  });

  const handleLike = () => {
    if (!isLiked && !likeMutation.isPending) {
      likeMutation.mutate();
    }
  };

  const handleAddToLibrary = () => {
    if (!libraryMutation.isPending && !isInLibrary) {
      setIsDialogOpen(true);
    }
  };

  const handleConfirmAddToLibrary = (comment: string) => {
    libraryMutation.mutate(comment);
  };

  // Stop audio when scrolled away
  useEffect(() => {
    if (!isActive && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setProgress(0);
    }
  }, [isActive]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!item.previewUrl || !audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.volume = 0.25;
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.error("Playback failed", err);
          setIsPlaying(false);
        });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration || 30;
      setProgress((current / duration) * 100);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    if (audioRef.current) audioRef.current.currentTime = 0;
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-black snap-start shrink-0">
      {/* Background Image */}
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

      {/* Audio Player Logic */}
      {item.previewUrl && (
        <audio
          ref={audioRef}
          src={item.previewUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
        />
      )}

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md px-6 flex flex-col items-center gap-8">
        <BlurFade
          delay={0.1}
          inView={isActive}
          className="relative aspect-square w-full max-w-[320px] shadow-2xl rounded-xl overflow-hidden ring-1 ring-white/10 group"
        >
          <Image
            src={imageUrl}
            alt={item.title}
            fill
            sizes="(max-width: 768px) 100vw, 320px"
            className="object-cover"
            priority={isActive}
          />
          
          {/* Play/Pause Overlay */}
          {item.previewUrl && (
            <div
              className={cn(
                "absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity duration-300 cursor-pointer",
                isPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}
              onClick={togglePlay}
            >
              <div className="p-4 rounded-full bg-white/20 backdrop-blur-sm hover:scale-110 transition-transform">
                {isPlaying ? (
                  <Pause className="w-8 h-8 text-white fill-current" />
                ) : (
                  <Play className="w-8 h-8 text-white fill-current ml-1" />
                )}
              </div>
            </div>
          )}
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

            <AuthGate onAuthenticated={handleAddToLibrary}>
              {(handleAction) => (
                <Button
                  size="icon"
                  variant="ghost"
                  className={cn(
                    "w-12 h-12 rounded-full backdrop-blur-sm transition-colors",
                    isInLibrary
                      ? "bg-green-500/20 text-green-500 hover:bg-green-500/30 hover:text-green-500"
                      : "bg-white/10 hover:bg-white/20 text-white"
                  )}
                  onClick={handleAction}
                  disabled={libraryMutation.isPending}
                >
                  <Plus className="w-6 h-6" />
                </Button>
              )}
            </AuthGate>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {item.previewUrl && (
        <div className="absolute bottom-0 left-0 w-full h-1.5 bg-white/10">
          <div
            className="h-full bg-white transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(255,255,255,0.5)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Add to Library Dialog */}
      <AddToLibraryDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onConfirm={handleConfirmAddToLibrary}
        media={item}
        isPending={libraryMutation.isPending}
      />
    </div>
  );
}