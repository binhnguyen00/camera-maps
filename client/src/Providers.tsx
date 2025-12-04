import { useHref, useNavigate } from "react-router-dom";
import type { NavigateOptions } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HeroUIProvider } from "@heroui/system";

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NavigateOptions;
  }
}

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    <QueryClientProvider client={queryClient}>
      <HeroUIProvider navigate={navigate} useHref={useHref}>
        {children}
      </HeroUIProvider>
    </QueryClientProvider>
  );
}
