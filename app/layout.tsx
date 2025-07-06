import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Albion Online Weapon ZvZ Stats",
  description: "Weapon win‑rates in recent Albion ZvZ battles"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-gray-900 text-white min-h-screen">{children}</body>
    </html>
  );
}