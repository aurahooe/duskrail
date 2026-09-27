import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function createBrowserClient() {
  return createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
}

export function hourKey(date = new Date()) {
  const d = new Date(date);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  const h = String(d.getUTCHours()).padStart(2, "0");
  return `${y}-${m}-${day}T${h}`;
}

export function prettyHour(key) {
  if (!key) return "";
  const [date, hour] = key.split("T");
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, Number(hour)));
  return dt.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    timeZoneName: "short",
  });
}

const KICKERS = [
  "Held up to the light",
  "What the hour kept",
  "Pinned to the rail",
  "Read while the kettle boiled",
  "A note that did not stay private",
  "The piece that found the room",
];

export function randomKicker() {
  return KICKERS[Math.floor(Math.random() * KICKERS.length)];
}
