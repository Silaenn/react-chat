const colors = [
  '#c8784a', '#5a8a5a', '#4a7a9a', '#9a7a4a',
  '#7a5a8a', '#8a6a4a', '#4a8a7a', '#9a6a5a',
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
