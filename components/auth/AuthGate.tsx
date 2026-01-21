"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth-context";
import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface AuthGateProps {
  children: (handleAction: () => void) => React.ReactNode;
  onAuthenticated?: () => void;
}

/**
 * AuthGate is a wrapper component that protects interactions requiring authentication.
 * If authenticated, calls onAuthenticated callback. Otherwise, shows login dialog.
 */
export function AuthGate({ children, onAuthenticated }: AuthGateProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  const handleAction = () => {
    if (!isAuthenticated) {
      setIsOpen(true);
    } else {
      onAuthenticated?.();
    }
  };

  const handleLoginRedirect = () => {
    router.push("/login");
  };

  return (
    <>
      {children(handleAction)}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connectez-vous à Resonance</DialogTitle>
            <DialogDescription>
              Pour accéder à cette fonctionnalité, veuillez vous connecter ou créer un compte.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <Button className="w-full gap-2" size="lg" onClick={handleLoginRedirect}>
              <LogIn className="w-4 h-4" />
              Se connecter / S&apos;inscrire
            </Button>
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
