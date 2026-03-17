import { useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const EXIT_CLASS = "route-fade-scale-exit";
const ENTER_CLASS = "route-fade-scale-enter";
const TRANSITION_MS = 280;

function getRootNode() {
  return document.getElementById("root");
}

export function useTransitionNavigate() {
  const navigate = useNavigate();
  const isNavigatingRef = useRef(false);

  return useCallback(
    (to, options = {}) => {
      if (isNavigatingRef.current) return;
      isNavigatingRef.current = true;

      const root = getRootNode();
      if (!root) {
        navigate(to, options);
        isNavigatingRef.current = false;
        return;
      }

      root.classList.remove(ENTER_CLASS);
      root.classList.add(EXIT_CLASS);

      window.setTimeout(() => {
        navigate(to, options);
        isNavigatingRef.current = false;
      }, TRANSITION_MS);
    },
    [navigate]
  );
}

export function usePageEnterTransition() {
  useEffect(() => {
    const root = getRootNode();
    if (!root) return;

    root.classList.remove(EXIT_CLASS);
    root.classList.add(ENTER_CLASS);

    const timer = window.setTimeout(() => {
      root.classList.remove(ENTER_CLASS);
    }, TRANSITION_MS + 40);

    return () => {
      window.clearTimeout(timer);
      root.classList.remove(ENTER_CLASS);
    };
  }, []);
}
