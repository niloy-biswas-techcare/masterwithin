"use client";

import * as React from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * NProgress-style top progress bar for the admin app.
 * Intercepts <a> clicks to start; completes when pathname/searchParams change.
 * Must be wrapped in <Suspense> in the parent layout.
 */
export function RouteProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = React.useState(0);
  const [visible, setVisible] = React.useState(false);
  const intervalRef = React.useRef<ReturnType<typeof setInterval>>(undefined);
  const activeRef = React.useRef(false);

  React.useEffect(() => {
    if (!activeRef.current) return;
    clearInterval(intervalRef.current);
    setProgress(100);
    const t = setTimeout(() => {
      setVisible(false);
      setProgress(0);
      activeRef.current = false;
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest("a");
      if (!link) return;
      const href = link.getAttribute("href");
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("javascript:") ||
        link.target === "_blank" ||
        link.getAttribute("download") !== null
      )
        return;

      activeRef.current = true;
      setVisible(true);
      setProgress(15);

      clearInterval(intervalRef.current);
      let p = 15;
      intervalRef.current = setInterval(() => {
        if (!activeRef.current) return;
        p = Math.min(p + Math.random() * 10, 75);
        setProgress(p);
      }, 250);
    };

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
      clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none"
    >
      <div
        className="h-[3px] bg-primary"
        style={{
          width: `${progress}%`,
          opacity: visible ? 1 : 0,
          transition: visible
            ? "width 200ms ease-out, opacity 150ms ease"
            : "opacity 200ms ease",
        }}
      />
    </div>
  );
}
