"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createBrowserClient, hourKey, prettyHour, randomKicker } from "../lib/supabase";

export default function Home() {
  const [featured, setFeatured] = useState(null);
  const [wall, setWall] = useState([]);
  const [left, setLeft] = useState("");

  useEffect(() => {
    const sb = createBrowserClient();
    let alive = true;

    async function tick() {
      const key = hourKey();
      const end = new Date();
      end.setUTCMinutes(59, 59, 999);
      const ms = end - new Date();
      const m = Math.max(0, Math.floor(ms / 60000));
      const s = Math.max(0, Math.floor((ms % 60000) / 1000));
      if (alive) setLeft(`${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);

      let { data: hour } = await sb.from("dusk_hours").select("*").eq("hour_key", key).maybeSingle();
      if (!hour) {
        const { data: publics } = await sb.from("dusk_pieces").select("id").eq("is_public", true).order("created_at", { ascending: false }).limit(24);
        const pick = publics?.length ? publics[Math.floor(Math.random() * publics.length)].id : null;
        await sb.from("dusk_hours").insert({ hour_key: key, piece_id: pick, kicker: randomKicker() });
        const again = await sb.from("dusk_hours").select("*").eq("hour_key", key).maybeSingle();
        hour = again.data;
      }

      let piece = null;
      if (hour?.piece_id) {
        const { data } = await sb.from("dusk_pieces").select("id,title,body,created_at,author_id,is_public").eq("id", hour.piece_id).maybeSingle();
        piece = data;
        if (piece) {
          const { data: profile } = await sb.from("dusk_profiles").select("handle,display_name").eq("id", piece.author_id).maybeSingle();
          piece.author = profile;
        }
      }

      const { data: recent } = await sb.from("dusk_pieces").select("id,title,created_at,author_id").eq("is_public", true).order("created_at", { ascending: false }).limit(8);
      const authors = [...new Set((recent || []).map((p) => p.author_id))];
      let names = {};
      if (authors.length) {
        const { data: profiles } = await sb.from("dusk_profiles").select("id,handle,display_name").in("id", authors);
        (profiles || []).forEach((p) => { names[p.id] = p; });
      }
      if (alive) {
        setFeatured({ hour, piece });
        setWall((recent || []).map((p) => ({ ...p, author: names[p.author_id] })));
      }
    }

    tick();
    const t = setInterval(tick, 1000);
    return () => { alive = false; clearInterval(t); };
  }, []);

  return (
    <>
      <section className="hero">
        <div className="kicker">Open room · hourly edition</div>
        <h1>Write it down.<br />Keep it or pin it.</h1>
        <p className="lede">
          Duskrail is a small desk that also has a wall. Anything you mark public
          is readable by anyone. Every hour the room chooses one public piece and
          holds it in the window until the next hour arrives.
        </p>
      </section>
      <section className="grid">
        <article className="card">
          <div className="kicker">{featured?.hour?.kicker || "This hour"}</div>
          <h2>{featured?.piece?.title || "The window is empty"}</h2>
          <div className="meta">
            {featured?.piece
              ? `${featured.piece.author?.display_name || "someone"} · ${prettyHour(featured?.hour?.hour_key)}`
              : "Leave a public note and it can take this slot."}
            <span className="clock"> · turns in {left}</span>
          </div>
          <div className="body">{featured?.piece?.body || "No public pieces yet. Sit at the desk and write one."}</div>
        </article>
        <aside className="card">
          <h2>On the wall</h2>
          <div className="list">
            {wall.map((p) => (
              <div className="slip" key={p.id}>
                <strong>{p.title}</strong>
                <div><small>{p.author?.handle || "writer"}</small></div>
              </div>
            ))}
            {!wall.length && <p className="meta">Nothing public yet.</p>}
          </div>
          <div className="row" style={{ marginTop: 18 }}>
            <Link className="ink" href="/desk">Sit at the desk</Link>
            <Link className="ghost" href="/wall" style={{ padding: "10px 14px", border: "1px solid #c9b89a" }}>See the wall</Link>
          </div>
        </aside>
      </section>
    </>
  );
}
