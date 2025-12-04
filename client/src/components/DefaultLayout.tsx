import { Navbar, Footer } from "@components";
import { cn } from "@heroui/react";

interface DefaultLayoutProps {
  children: React.ReactNode;
}
export default function DefaultLayout(props: DefaultLayoutProps) {
  const { children } = props;

  return (
    <div className="flex flex-col h-screen">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:bg-white focus:text-black focus:p-2 focus:rounded">Skip to content</a>
      <Navbar />
      <main
        id="main-content"
        role="main"
        tabIndex={-1}
        className={cn(
          "mx-auto", "max-w-7xl", "p-6", "outline-none",
          "flex", "flex-col", "flex-1",
          "overflow-y-auto",
        )}
      >
        {children}
      </main>
      <Footer />
    </div>
  )
}
