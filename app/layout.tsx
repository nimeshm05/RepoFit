import type { Metadata } from "next";

import { figtree } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "RepoFit",
  description:
    "Find open-source projects that fit your skills, interests, and goals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${figtree.variable} ${figtree.className} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <div className="mx-auto w-full max-w-[500px]">{children}</div>
      </body>
    </html>
  );
}
