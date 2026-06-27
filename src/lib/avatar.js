import { AVATAR_COLORS } from "./constants";

export const getAvatar = (name) => {
  const letter = (name || '?')[0].toUpperCase();
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return {
    letter,
    color: AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length],
  };
};
