import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NeverEnding Party 🎉",
  description: "The AI-powered adult party game that never runs out of questions",
  manifest: "/manifest.json",
  themeColor: "#ec4899",
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" style={{ colorScheme: "dark" }}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎉</text></svg>" />
      </head>
      <body style={{ background: "#0a0a0f" }}>
        {children}
      </body>
    </html>
  );
}
