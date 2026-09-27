"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "../../lib/supabase";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("in");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const sb = createBrowserClient();
    sb.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/desk");
    });
  }, [router]);

  async function submit(e) {
    e.preventDefault();
    setMsg("Working…");
    const sb = createBrowserClient();
    const fn = mode === "up" ? sb.auth.signUp : sb.auth.signInWithPassword;
    const { error } = await fn({ email, password });
    if (error) {
      setMsg(error.message);
      return;
    }
    setMsg(mode === "up" ? "Account made. If email confirm is on, check your inbox." : "In.");
    router.replace("/desk");
  }

  return (
    <section className="hero" style={{ maxWidth: 460 }}>
      <div className="kicker">The door</div>
      <h1>{mode === "up" ? "Make a desk" : "Come in"}</h1>
      <p className="lede">Email and password. Your private notes stay yours.</p>
      <form className="stack card" onSubmit={submit}>
        <input type="email" required placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" required minLength={6} placeholder="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <div className="row">
          <button className="ink" type="submit">{mode === "up" ? "Create account" : "Sign in"}</button>
          <button className="ghost" type="button" onClick={() => setMode(mode === "up" ? "in" : "up")}>
            {mode === "up" ? "I already have one" : "I need an account"}
          </button>
        </div>
        {msg && <div className="meta">{msg}</div>}
      </form>
    </section>
  );
}
