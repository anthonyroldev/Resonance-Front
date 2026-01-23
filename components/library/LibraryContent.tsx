"use client";

import { FilterCombobox } from "@/components/FilterCombobox";
import { BlurFade } from "@/components/ui/blur-fade";
import { MagicCard } from "@/components/ui/magic-card";
import { Marquee } from "@/components/ui/marquee";
import { Spinner } from "@/components/ui/spinner";
import { fetchUserFavorites, fetchUserLibrary } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { MediaType, UserLibraryEntry } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Disc, Music2, Pause, Play, User as UserIcon } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

export function LibraryContent() {
  const { token, isAuthenticated } = useAuth();
  const [filterType, setFilterType] = useState<MediaType | "ALL">("ALL");

  const {
    data: library = [],
    isLoading: isLibraryLoading,
  } = useQuery({
    queryKey: ["userLibrary", token],
    queryFn: () => fetchUserLibrary(token!),
    enabled: isAuthenticated && !!token,
  });

  const {
    data: favorites = [],
    isLoading: isFavoritesLoading,
  } = useQuery({
    queryKey: ["userFavorites", token],
    queryFn: () => fetchUserFavorites(token!),
    enabled: isAuthenticated && !!token,
  });

  const filteredLibrary = library.filter(
    (entry) => filterType === "ALL" || entry.mediaType === filterType
  );

  const filteredFavorites = favorites.filter(
    (entry) => filterType === "ALL" || entry.mediaType === filterType
  );

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-white/50">Please login to view your library.</p>
      </div>
    );
  }

  if (isLibraryLoading || isFavoritesLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner className="size-8" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 overflow-y-auto h-full pb-20">
      <div className="flex items-center justify-between">
        <BlurFade delay={0.1}>
          <h1 className="text-3xl font-bold text-white">Ma Bibliothèque</h1>
        </BlurFade>
        <BlurFade delay={0.1}>
          <FilterCombobox value={filterType} onChange={setFilterType} />
        </BlurFade>
      </div>

      <section>
        <BlurFade delay={0.2}>
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <span className="bg-red-500/20 p-1.5 rounded-lg text-red-500">
              <Disc className="w-5 h-5" />
            </span>
            Favoris
          </h2>
        </BlurFade>
        {filteredFavorites.length > 0 ? (
          <BlurFade delay={0.3}>
            <div className="relative">
              <Marquee pauseOnHover className="[--duration:30s] py-4">
                {filteredFavorites.map((entry) => (
                  <FavoriteCard key={entry.id} entry={entry} />
                ))}
              </Marquee>
              <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-linear-to-r from-black via-black/20 to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-linear-to-l from-black via-black/20 to-transparent" />
            </div>
          </BlurFade>
        ) : (
          <BlurFade delay={0.3}>
            <p className="text-white/40 text-sm italic">Aucun favori trouvé.</p>
          </BlurFade>
        )}
      </section>

      <section>
        <BlurFade delay={0.4}>
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <span className="bg-primary/20 p-1.5 rounded-lg text-primary">
              <Music2 className="w-5 h-5" />
            </span>
            Ma Collection
          </h2>
        </BlurFade>
        {filteredLibrary.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredLibrary.map((entry, index) => (
              <BlurFade key={entry.id} delay={0.5 + index * 0.05} inView>
                <LibraryCard entry={entry} />
              </BlurFade>
            ))}
          </div>
        ) : (
          <BlurFade delay={0.5}>
            <p className="text-white/40 text-sm italic">Votre bibliothèque est vide.</p>
          </BlurFade>
        )}
      </section>
    </div>
  );
}

function FavoriteCard({ entry }: { entry: UserLibraryEntry }) {
  return (
    <div className="relative w-40 h-56 overflow-hidden rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300 mx-3 group">
      {entry.imageUrl ? (
        <Image
          src={entry.imageUrl}
          alt={entry.mediaTitle}
          fill
          sizes="160px"
          className="object-cover opacity-50 group-hover:opacity-70 transition-opacity duration-500"
        />
      ) : (
        <div className="absolute inset-0 bg-linear-to-br from-primary/30 to-purple-600/30" />
      )}
      <div className="absolute bottom-0 left-0 w-full p-4 bg-linear-to-t from-black via-black/80 to-transparent">
        <h3 className="font-bold text-white text-sm truncate mb-0.5">{entry.mediaTitle}</h3>
        <p className="text-xs text-white/70 truncate">{entry.artistName}</p>
      </div>
    </div>
  );
}

function LibraryCard({ entry }: { entry: UserLibraryEntry }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  let Icon = Music2;
  if (entry.mediaType === "ALBUM") Icon = Disc;
  if (entry.mediaType === "ARTIST") Icon = UserIcon;

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!entry.previewUrl || !audioRef.current) return;

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
    <MagicCard className="h-full min-h-[240px] cursor-default overflow-hidden border-white/5 rounded-xl" gradientColor="#3b82f620">
      {entry.previewUrl && (
        <audio
          ref={audioRef}
          src={entry.previewUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
        />
      )}
      
      <div className="relative h-full flex flex-col p-3">
        {/* Image / Icon Container */}
        <div className="relative aspect-square w-full rounded-lg overflow-hidden mb-3 bg-white/5 group/media">
          {entry.imageUrl ? (
            <Image
              src={entry.imageUrl}
              alt={entry.mediaTitle}
              fill
              sizes="(max-width: 1024px) 100vw, 300px"
              className="object-cover transition-transform duration-500 group-hover/media:scale-110"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Icon className="w-16 h-16 text-white/20" />
            </div>
          )}

          {/* Play/Pause Overlay */}
          {entry.previewUrl && (
            <div
              className={cn(
                "absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity duration-300 cursor-pointer",
                isPlaying ? "opacity-100" : "opacity-0 group-hover/media:opacity-100"
              )}
              onClick={togglePlay}
            >
              <div className="p-4 rounded-full bg-primary/80 backdrop-blur-sm hover:scale-110 transition-transform">
                {isPlaying ? (
                  <Pause className="w-6 h-6 text-white fill-current" />
                ) : (
                  <Play className="w-6 h-6 text-white fill-current ml-0.5" />
                )}
              </div>
            </div>
          )}

          {/* Progress Bar */}
          {entry.previewUrl && isPlaying && (
            <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
              <div
                className="h-full bg-primary transition-all duration-100 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
          
          <div className="absolute top-2 right-2 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white uppercase tracking-wider">
            {entry.mediaType}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white truncate text-lg">{entry.mediaTitle}</h3>
          <p className="text-sm text-white/50 truncate mb-2">{entry.artistName}</p>
          
          {entry.comment && (
            <div className="mt-auto">
              <p className="text-xs text-white/30 line-clamp-2 italic border-l-2 border-white/10 pl-2">
                &ldquo;{entry.comment}&rdquo;
              </p>
            </div>
          )}
        </div>
      </div>
    </MagicCard>
  );
}
