import "./globals.css";
import type { Metadata } from "next";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Breadcrumbs from "../components/Breadcrumbs";
import NavMemory from "../components/NavMemory";

export const metadata: Metadata = {
  title: "CSE2CWA Assessment 1 – Next.js Web App",
  description: "Generates HTML + JS",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* Accessible skip link */}
        <a href="#main">Skip to content</a>

        <NavMemory />
        <Header />
        <Breadcrumbs />

        <main
          id="main"
          style={{
            maxWidth: 1000,
            margin: "0 auto",
            padding: 16,
            width: "100%",
          }}
        >
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}
