"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "../../lib/supabase";

export default function Wall() {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    const sb = createBrowserClient();
    (async () => {
      const { data } = await sb.from("dusk_pieces").select("id,title,body,created_at,author_id").eq("is_public", true).order("created_at", { ascending: false }).limit(40);
      const ids = [...new Set((data || []).map((p) => p.author_id))];
      let names = {};
      if (ids.length) {
        const { data: profiles } = await sb.from("dusk_profiles").select("id,handle,display_name").in("id", ids);
        (profiles || []).forEach((p) => { names[p.id] = p; });
      }
      setPieces((data || []).map((p) => ({ ...p, author: names[p.author_id] })));
    })();
  }, []);

  return (
    <section className="hero">
      <div className="kicker">The wall</div>
      <h1>What people marked public</h1>
      <p className="lede">Private notes never land here. Public ones stay until their author takes them down.</p>
      <div className="list" style={{ marginTop: 32 }}>
        {pieces.map((p, i) => (
          <article className="card" key={p.id} style={{ animationDelay: `${i * 40}ms` }}>
            <h2>{p.title}</h2>
            <div className="meta">{p.author?.display_name || "writer"} · {new Date(p.created_at).toLocaleString()}</div>
            <div className="body">{p.body}</div>
          </article>
        ))}
        {!pieces.length && <p className="meta">The wall is still bare.</p>}
      </div>
    </section>
  );
}
