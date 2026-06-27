import { MESSAGE_EDIT_WINDOW_MS } from "./constants";

const getMsgTime = (ts) =>
  ts?.toMillis ? ts.toMillis() : new Date(ts).getTime();

const formatTime = (ts) => {
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const canModify = (createdAt) => {
  const elapsed = Date.now() - getMsgTime(createdAt);
  return elapsed < MESSAGE_EDIT_WINDOW_MS;
};

const formatLastSeen = (ts) => {
  if (!ts) return "Offline";
  const diff = Date.now() - getMsgTime(ts);
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
};

const formatDetailLastSeen = (ts) => {
  if (!ts) return "Offline";
  const diff = Date.now() - getMsgTime(ts);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "last seen just now";
  if (minutes < 60) return `last seen ${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `last seen ${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `last seen ${days} day${days > 1 ? "s" : ""} ago`;
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return `last seen ${d.toLocaleDateString("id-ID", { day: "numeric", month: "short" })}`;
};

export { getMsgTime, formatTime, canModify, formatLastSeen, formatDetailLastSeen };
