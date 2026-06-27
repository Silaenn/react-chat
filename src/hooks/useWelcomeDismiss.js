import { useEffect } from "react";
import { WELCOME_DISMISS_MS } from "@/lib/constants";

export const useWelcomeDismiss = (chatId, welcomeDismissed, dismissWelcome) => {
  useEffect(() => {
    if (chatId || welcomeDismissed) return;
    const mql = window.matchMedia('(max-width: 768px)');
    if (mql.matches) {
      const timer = setTimeout(() => dismissWelcome(), WELCOME_DISMISS_MS);
      return () => clearTimeout(timer);
    }
    const handleChange = (e) => {
      if (e.matches) dismissWelcome();
    };
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, [chatId, welcomeDismissed, dismissWelcome]);
};
