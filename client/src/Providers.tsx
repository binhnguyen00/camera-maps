import PocketBase from "pocketbase";

import { useHref, useNavigate } from "react-router-dom";
import type { NavigateOptions } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HeroUIProvider } from "@heroui/system";
import { PBProvider } from "@components";

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NavigateOptions;
  }
}

const queryClient = new QueryClient();
const pocketBaseClient = new PocketBase("http://127.0.0.1:8090")

export function Providers({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    <QueryClientProvider client={queryClient}>
      <HeroUIProvider navigate={navigate} useHref={useHref}>
        <PBProvider client={pocketBaseClient}>
          {children}
        </PBProvider>
      </HeroUIProvider>
    </QueryClientProvider>
  );
}
