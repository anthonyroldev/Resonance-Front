"use client";

import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { Marquee } from "@/components/ui/marquee";
import { Spinner } from "@/components/ui/spinner";
import { fetchUserFavorites, fetchUserLibrary } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { UserLibraryEntry } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Disc, Music2, Pause, Play, User as UserIcon } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

export function LibraryContent() {
  const { token, isAuthenticated } = useAuth();

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
    <div className="p-6 space-y-10 overflow-y-auto h-full pb-20">
      <section>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="bg-primary/20 p-1 rounded-md text-primary">
            <Disc className="w-6 h-6" />
          </span>
          Favorites
        </h2>
        {favorites.length > 0 ? (
          <div className="relative">
            <Marquee pauseOnHover className="[--duration:20s]">
              {favorites.map((entry) => (
                <FavoriteCard key={entry.id} entry={entry} />
              ))}
            </Marquee>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-linear-to-r from-black via-black/50 to-transparent dark:from-background" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-linear-to-l from-black via-black/50 to-transparent dark:from-background" />
          </div>
        ) : (
          <p className="text-white/50 text-sm">No favorites yet.</p>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="bg-primary/20 p-1 rounded-md text-primary">
            <Music2 className="w-6 h-6" />
          </span>
          Library
        </h2>
        {library.length > 0 ? (
          <BentoGrid>
            {library.map((entry) => (
              <LibraryCard key={entry.id} entry={entry} />
            ))}
          </BentoGrid>
        ) : (
          <p className="text-white/50 text-sm">Your library is empty.</p>
        )}
      </section>
    </div>
  );
}

function FavoriteCard({ entry }: { entry: UserLibraryEntry }) {
  return (
    <div className="relative w-48 h-64 overflow-hidden rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors mx-4 group">
      {entry.imageUrl ? (
        <Image
          src={entry.imageUrl}
          alt={entry.mediaTitle}
          fill
          sizes="192px"
          className="object-cover opacity-60 group-hover:opacity-80 transition-opacity"
        />
      ) : (
        <div className="absolute inset-0 bg-linear-to-br from-primary/20 to-purple-500/20" />
      )}
      <div className="absolute bottom-0 left-0 w-full p-4 bg-linear-to-t from-black to-transparent">
        <h3 className="font-semibold text-white truncate">{entry.mediaTitle}</h3>
        <p className="text-xs text-white/60 truncate">{entry.artistName}</p>
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
    <div className="relative">
      {entry.previewUrl && (
        <audio
          ref={audioRef}
          src={entry.previewUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
        />
      )}
      <BentoCard
        name={entry.mediaTitle}
        className={
          entry.mediaType === "ARTIST" ? "col-span-3 lg:col-span-1" : "col-span-3 lg:col-span-1"
        }
        background={
          <>
            {entry.imageUrl ? (
              <Image
                src={entry.imageUrl}
                alt={entry.mediaTitle}
                fill
                sizes="(max-width: 1024px) 100vw, 200px"
                className="object-cover opacity-50 transition-opacity duration-300 group-hover:opacity-30"
              />
            ) : (
              <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 to-purple-500/10" />
            )}
            
            {/* Play/Pause Overlay */}
            {entry.previewUrl && (
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
            {entry.previewUrl && (
              <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10 z-20">
                <div
                  className="h-full bg-white transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </>
        }
        Icon={Icon}
        description={entry.artistName}
        href="#"
        cta="View Details"
      />
    </div>
  );
}
