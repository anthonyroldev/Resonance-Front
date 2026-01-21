"use client";

import { AuthProvider } from "@/lib/auth-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

interface ProvidersProps {
  children: React.ReactNode;
  initialToken: string | null;
}

export function Providers({ children, initialToken }: ProvidersProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider initialToken={initialToken}>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
}
