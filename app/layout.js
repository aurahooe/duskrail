import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Duskrail",
  description: "A quiet writing room. Public notes stay on the wall. One piece is featured every hour.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="wrap">
          <header className="top">
            <Link className="mark" href="/">Duskrail</Link>
            <nav className="topnav">
              <Link href="/wall">Wall</Link>
              <Link href="/desk">Desk</Link>
              <Link href="/login">Door</Link>
            </nav>
          </header>
          {children}
          <footer className="foot">
            Public pieces stay visible. Private ones stay at your desk. The featured slot turns over on the hour.
          </footer>
        </div>
      </body>
    </html>
  );
}
