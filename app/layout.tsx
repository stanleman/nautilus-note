import { Libre_Franklin } from "next/font/google";
import { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/sidebar";

const libreFranklin = Libre_Franklin({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nautilus Note",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark bg-[#020817]">
      <body className={libreFranklin.className}>
        <Sidebar />
        <main className="sm:ml-[300px] mx-5 sm:mt-3 mt-16 h-screen ">
          {children}
        </main>
      </body>
    </html>
  );
}
