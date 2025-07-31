import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers"; // Import the Providers component
import Header from "@/components/Header";
export const metadata: Metadata = {
  title: "TSender",
  description: "A simple ERC20 token sender dApp", // Example description
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {/* Wrap the entire body content with Providers */}
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}