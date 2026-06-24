const colors = [
  '#2563EB',
  '#059669',
  '#D97706',
  '#DC2626',
  '#7C3AED',
  '#EC4899',
  '#0891B2',
  '#EA580C',
];

export const getAvatar = (name) => {
  const letter = (name || '?')[0].toUpperCase();
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return {
    letter,
    color: colors[Math.abs(hash) % colors.length],
  };
};
