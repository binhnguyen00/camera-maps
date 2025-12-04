import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { Spinner } from "@heroui/react";

const Home = lazy(() => import("@pages/Home"));
const Page = lazy(() => import("@pages/Page"));
const Features = lazy(() => import("@pages/Features"));
const NotFound = lazy(() => import("@pages/NotFound"));

export function App() {
  return (
    <Suspense fallback={<div className="p-6 flex items-center justify-center"><Spinner /></div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/features" element={<Features />} />
        <Route path="/page" element={<Page />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}