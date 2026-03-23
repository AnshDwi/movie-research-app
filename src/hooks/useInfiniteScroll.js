import { useEffect, useRef } from "react";

export function useInfiniteScroll(onIntersect, enabled = true) {
  const targetRef = useRef(null);

  useEffect(() => {
    if (!enabled || !targetRef.current) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onIntersect();
        }
      },
      { rootMargin: "240px" }
    );

    observer.observe(targetRef.current);
    return () => observer.disconnect();
  }, [enabled, onIntersect]);

  return targetRef;
}
