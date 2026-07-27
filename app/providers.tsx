"use client"
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/lib/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import { useAuthStore } from "@/store/auth-store";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  const hydrate = useAuthStore((s) => s.hydrate);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    hydrate();
    setMounted(true);
  }, [hydrate]);

  if (!mounted) return null;

  return (
    <ThemeProvider defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          {children}
          <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            duration: 4000,
          }}
        />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
