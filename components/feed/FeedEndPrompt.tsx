"use client";

import { BlurFade } from "@/components/ui/blur-fade";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";

export function FeedEndPrompt() {
  const router = useRouter();

  return (
    <div className="relative w-full h-dvh flex items-center justify-center overflow-hidden bg-black snap-start shrink-0">
      {/* Background gradient */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/80 to-black" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-6 flex flex-col items-center gap-8 text-center">
        <BlurFade delay={0.1} inView={true}>
          <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm ring-1 ring-white/20">
            <Lock className="w-10 h-10 text-white/80" />
          </div>
        </BlurFade>

        <BlurFade delay={0.2} inView={true} className="space-y-3">
          <h2 className="text-2xl font-bold text-white">
            Continuez votre decouverte
          </h2>
          <p className="text-white/60 text-lg">
            Connectez-vous pour acceder a plus de contenu et sauvegarder vos
            favoris.
          </p>
        </BlurFade>

        <BlurFade delay={0.3} inView={true} className="w-full space-y-3">
          <Button
            size="lg"
            className="w-full"
            onClick={() => router.push("/login")}
          >
            Se connecter / S&apos;inscrire
          </Button>
          <Button
            variant="ghost"
            className="w-full text-white/60 hover:text-white hover:bg-white/10"
            onClick={() => router.push("/register")}
          >
            Creer un compte
          </Button>
        </BlurFade>
      </div>
    </div>
  );
}
