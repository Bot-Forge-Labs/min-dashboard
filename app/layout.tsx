import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/contexts/authContext";

/**
 *
 *   MAIN FILE FOR LAYOUT
 *
 */

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  themeColor: "#71b489ff",
  robots: "noindex, nofollow",
  title: "Minbot Dashboard",
  description: "Comprehensive Discord bot management dashboard",
  authors: [
    {
      name: "Minbot Developers - Minies Cottage",
      url: "https://dashboard.miniescottage.com",
    },
  ],
  generator: "Next.js",
  openGraph: {
    title: "Minbot Dashboard",
    description: "Manage Minies Cottage with the secure Minbot Dashboard",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Minbot Dashboard",
    description: "Manage Minies Cottage with the secure Minbot Dashboard",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster
              theme="dark"
              position="top-right"
              toastOptions={{
                style: {
                  background: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(34, 197, 94, 0.2)",
                  color: "white",
                },
              }}
            />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}