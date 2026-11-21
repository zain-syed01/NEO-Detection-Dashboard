import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";

import { AuthProvider } from "@/components/AuthProvider";
import { SiteHeader } from "@/components/SiteHeader";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import "./globals.css";

const sans = Space_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
});

const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "NEO Detection & Alert Dashboard",
  description:
    "Mission-control dashboard for NASA near-Earth object close-approach data — filter, rank, and visualize asteroid threats.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const supabaseConfigured = isSupabaseConfigured();

  return (
    <html
      lang="en"
      className={`${sans.variable} ${display.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <AuthProvider configured={supabaseConfigured}>
          <SiteHeader />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
