import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dukani Ledger",
  description: "Inventory and sales management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(){try{var e=localStorage.getItem("theme");"dark"===e?document.documentElement.classList.add("dark"):document.documentElement.classList.remove("dark")}catch(e){}}();`,
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
