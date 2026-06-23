const colors = [
  'linear-gradient(135deg, #f59e0b, rgba(180, 83, 9, 0.85))',
  'linear-gradient(135deg, #d97706, rgba(120, 53, 15, 0.80))',
  'linear-gradient(135deg, #b45309, rgba(245, 158, 11, 0.70))',
  'linear-gradient(135deg, #92400e, rgba(251, 191, 36, 0.70))',
  'linear-gradient(135deg, #f59e0b, rgba(180, 83, 9, 0.65))',
  'linear-gradient(135deg, #d97706, rgba(245, 158, 11, 0.75))',
  'linear-gradient(135deg, #b45309, rgba(120, 53, 15, 0.80))',
  'linear-gradient(135deg, #fbbf24, rgba(180, 83, 9, 0.70))',
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
