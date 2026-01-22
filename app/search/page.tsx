"use client";

import { AppShell } from "@/components/AppShell";
import { AuthGate } from "@/components/auth/AuthGate";
import { AddToLibraryDialog } from "@/components/feed/AddToLibraryDialog";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { BlurFade } from "@/components/ui/blur-fade";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { addToFavorites, addToLibrary, searchMedia } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Media } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Disc, Heart, Music2, Pause, Play, Plus, Search as SearchIcon, User } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: results, isLoading } = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: () => searchMedia(debouncedQuery),
    enabled: debouncedQuery.length > 3,
  });

  return (
    <AppShell>
      <div className="p-6 space-y-8 h-full overflow-y-auto pb-20">
        <div className="flex flex-col gap-4">
          <BlurFade delay={0.1}>
            <h1 className="text-3xl font-bold text-white">Rechercher</h1>
          </BlurFade>
          <BlurFade delay={0.2}>
            <div className="relative max-w-md">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher des titres, albums, artistes..."
                className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus-visible:ring-primary/50"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </BlurFade>
          <BlurFade delay={0.3}>
            <p className="text-sm text-white/40">
              Tapez au moins 4 caractères pour rechercher
            </p>
          </BlurFade>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner className="size-8 text-primary" />
          </div>
        ) : results ? (
          <div className="space-y-6">
            <BlurFade delay={0.4}>
              <h2 className="text-xl font-semibold text-white">
                Résultats ({results.totalElements})
              </h2>
            </BlurFade>
            {results.content.length > 0 ? (
              <BentoGrid>
                {results.content.map((item, index) => (
                  <BlurFade 
                    key={item.id} 
                    delay={0.4 + index * 0.05} 
                    inView 
                    className="col-span-3 lg:col-span-1"
                  >
                    <ResultCard item={item} />
                  </BlurFade>
                ))}
              </BentoGrid>
            ) : (
              <p className="text-white/50">
                Aucun résultat trouvé pour &quot;{debouncedQuery}&quot;
              </p>
            )}
          </div>
        ) : debouncedQuery.length > 3 ? (
          <div className="flex justify-center py-12">
            <p className="text-white/50">Aucun résultat trouvé.</p>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}

function ResultCard({ item }: { item: Media }) {
  let Icon = Music2;
  if (item.type === "ALBUM") Icon = Disc;
  if (item.type === "ARTIST") Icon = User;

  const { token } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Interaction States
  const [isLiked, setIsLiked] = useState(false);
  const [isInLibrary, setIsInLibrary] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
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
    <>
      {item.previewUrl && (
        <audio
          ref={audioRef}
          src={item.previewUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
        />
      )}

      <BentoCard
        name={item.title}
        className="h-full min-h-[14rem]"
        background={
          <div className="absolute inset-0 w-full h-full">
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                className="object-cover opacity-50 transition-opacity duration-300 group-hover:opacity-30"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 to-purple-500/10" />
            )}
            
            {/* Action Buttons - Top Right */}
            <div className="absolute top-2 right-2 flex flex-col gap-2 z-20">
              <AuthGate onAuthenticated={handleLike}>
                {(handleAction) => (
                  <Button
                    size="icon"
                    variant="ghost"
                    className={cn(
                      "w-8 h-8 rounded-full backdrop-blur-sm transition-colors",
                      isLiked
                        ? "bg-red-500/20 text-red-500 hover:bg-red-500/30 hover:text-red-500"
                        : "bg-white/10 hover:bg-white/20 text-white"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAction();
                    }}
                    disabled={likeMutation.isPending}
                  >
                    <Heart
                      className={cn("w-4 h-4", isLiked && "fill-current")}
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
                      "w-8 h-8 rounded-full backdrop-blur-sm transition-colors",
                      isInLibrary
                        ? "bg-green-500/20 text-green-500 hover:bg-green-500/30 hover:text-green-500"
                        : "bg-white/10 hover:bg-white/20 text-white"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAction();
                    }}
                    disabled={libraryMutation.isPending}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                )}
              </AuthGate>
            </div>

            {/* Play/Pause Overlay */}
            {item.previewUrl && (
              <div
                className={cn(
                  "absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity duration-300 cursor-pointer z-10",
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
            
            {/* Progress Bar */}
            {item.previewUrl && (
              <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10 z-20">
                <div
                  className="h-full bg-white transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        }
        Icon={Icon}
        description={item.artistName}
        href="#"
        cta=""
      />

      <AddToLibraryDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onConfirm={handleConfirmAddToLibrary}
        media={item}
        isPending={libraryMutation.isPending}
      />
    </>
  );
}

