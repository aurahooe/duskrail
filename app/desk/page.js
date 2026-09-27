"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "../../lib/supabase";

export default function Desk() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [pieces, setPieces] = useState([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const sb = createBrowserClient();
    sb.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        router.replace("/login");
        return;
      }
      setUser(data.session.user);
      const uid = data.session.user.id;
      let { data: prof } = await sb.from("dusk_profiles").select("*").eq("id", uid).maybeSingle();
      if (!prof) {
        const handle = (data.session.user.email || "writer").split("@")[0] + "-" + uid.slice(0, 4);
        await sb.from("dusk_profiles").insert({ id: uid, handle, display_name: handle.split("-")[0] });
        const again = await sb.from("dusk_profiles").select("*").eq("id", uid).maybeSingle();
        prof = again.data;
      }
      setProfile(prof);
      const { data: mine } = await sb.from("dusk_pieces").select("*").eq("author_id", uid).order("created_at", { ascending: false });
      setPieces(mine || []);
    });
  }, [router]);

  async function save(e) {
    e.preventDefault();
    if (!user) return;
    setMsg("Saving…");
    const sb = createBrowserClient();
    const { error } = await sb.from("dusk_pieces").insert({
      author_id: user.id,
      title: title.trim() || "Untitled",
      body: body.trim(),
      is_public: isPublic,
    });
    if (error) {
      setMsg(error.message);
      return;
    }
    setTitle("");
    setBody("");
    setMsg("Saved.");
    const { data: mine } = await sb.from("dusk_pieces").select("*").eq("author_id", user.id).order("created_at", { ascending: false });
    setPieces(mine || []);
  }

  async function togglePublic(piece) {
    const sb = createBrowserClient();
    await sb.from("dusk_pieces").update({ is_public: !piece.is_public, updated_at: new Date().toISOString() }).eq("id", piece.id);
    setPieces((xs) => xs.map((x) => (x.id === piece.id ? { ...x, is_public: !x.is_public } : x)));
  }

  async function remove(piece) {
    const sb = createBrowserClient();
    await sb.from("dusk_pieces").delete().eq("id", piece.id);
    setPieces((xs) => xs.filter((x) => x.id !== piece.id));
  }

  async function out() {
    const sb = createBrowserClient();
    await sb.auth.signOut();
    router.replace("/");
  }

  if (!user) return <section className="hero"><p className="lede">Opening the desk…</p></section>;

  return (
    <section className="grid" style={{ paddingTop: 40 }}>
      <form className="card stack" onSubmit={save}>
        <div className="kicker">Your desk · {profile?.handle}</div>
        <h2>New piece</h2>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="title" />
        <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="write the thing" required />
        <label className="check">
          <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
          Mark public — it will appear on the wall and can be featured
        </label>
        <div className="row">
          <button className="ink" type="submit">Save</button>
          <button className="ghost" type="button" onClick={out}>Leave</button>
        </div>
        {msg && <div className="meta">{msg}</div>}
      </form>
      <aside className="card">
        <h2>Kept here</h2>
        <div className="list">
          {pieces.map((p) => (
            <div className="slip" key={p.id}>
              <strong>{p.title}</strong>
              <div className="meta">{p.is_public ? "public" : "private"}</div>
              <div className="row">
                <button className="ghost" type="button" onClick={() => togglePublic(p)}>
                  {p.is_public ? "Make private" : "Make public"}
                </button>
                <button className="ghost" type="button" onClick={() => remove(p)}>Delete</button>
              </div>
            </div>
          ))}
          {!pieces.length && <p className="meta">Nothing saved yet.</p>}
        </div>
      </aside>
    </section>
  );
}
