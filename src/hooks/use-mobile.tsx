import { useEffect, useState } from "react";

export default function useMobile() {
  const [isMobile, setIsMobile] = useState<boolean>(() => typeof window !== "undefined" && window.innerWidth < 768);

  useEffect(() => {
    function onResize() {
      setIsMobile(window.innerWidth < 768);
    }
    if (typeof window !== "undefined") {
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }
  }, []);

  return { isMobile };
}
