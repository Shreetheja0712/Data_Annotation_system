export const genId = () => Math.random().toString(36).slice(2, 9);

export const initials = (name) =>
  name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "U";

export const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });