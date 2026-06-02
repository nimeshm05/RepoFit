import type { Metadata } from "next";

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
      className="h-full antialiased"
    >
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
