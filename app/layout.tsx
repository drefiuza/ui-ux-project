import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UI/UX Project Fair Voting",
  description: "Vote for your favorite projects!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}
