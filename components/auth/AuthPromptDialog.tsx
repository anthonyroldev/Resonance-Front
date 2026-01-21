"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";

interface AuthPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

export function AuthPromptDialog({
  open,
  onOpenChange,
  title = "Connectez-vous a Resonance",
  description = "Pour acceder a cette fonctionnalite, veuillez vous connecter ou creer un compte.",
}: AuthPromptDialogProps) {
  const router = useRouter();

  const handleLoginRedirect = () => {
    router.push("/login");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <Button
            className="w-full gap-2"
            size="lg"
            onClick={handleLoginRedirect}
          >
            <LogIn className="w-4 h-4" />
            Se connecter / S&apos;inscrire
          </Button>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
