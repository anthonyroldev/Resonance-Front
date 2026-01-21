"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth-context";
import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface AuthGateProps {
  children: (openAuth: () => void) => React.ReactNode;
}

/**
 * AuthGate is a wrapper component that protects interactions requiring authentication.
 */
export function AuthGate({ children }: AuthGateProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  const handleInteraction = () => {
    if (!isAuthenticated) {
      setIsOpen(true);
    } else {
      // If logged in, we would typically execute the passed action.
      // NOTE: In this specific implementation pattern, the child component uses this 
      // function as its primary onClick. If we wanted to support the actual action,
      // we might accept an `onAction` prop and call it here.
      console.log("User is authenticated, allowed to proceed.");
    }
  };

  const handleLoginRedirect = () => {
    router.push("/login");
  };

  return (
    <>
      {children(handleInteraction)}

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
