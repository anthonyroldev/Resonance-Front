"use client";

import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { Marquee } from "@/components/ui/marquee";
import { Spinner } from "@/components/ui/spinner";
import { fetchUserFavorites, fetchUserLibrary } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { UserLibraryEntry } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { Disc, Music2, User as UserIcon } from "lucide-react";
import Image from "next/image";

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
  let Icon = Music2;
  if (entry.mediaType === "ALBUM") Icon = Disc;
  if (entry.mediaType === "ARTIST") Icon = UserIcon;

  return (
    <BentoCard
      name={entry.mediaTitle}
      className={
        entry.mediaType === "ARTIST" ? "col-span-3 lg:col-span-1" : "col-span-3 lg:col-span-1"
      }
      background={
        entry.imageUrl ? (
          <Image
            src={entry.imageUrl}
            alt={entry.mediaTitle}
            fill
            className="object-cover opacity-50 transition-opacity duration-300 group-hover:opacity-30"
          />
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 to-purple-500/10" />
        )
      }
      Icon={Icon}
      description={entry.artistName}
      href="#"
      cta="View Details"
    />
  );
}