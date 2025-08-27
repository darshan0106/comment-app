import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { NotificationsProvider } from "@/context/NotificationsContext"; // Import the new provider

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "PostThread",
  description: "A minimalistic and highly scalable discussion platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-100 text-slate-800`}>
        <AuthProvider>
          <NotificationsProvider> {children}</NotificationsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
