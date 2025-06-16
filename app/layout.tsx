import { Libre_Franklin, Roboto } from "next/font/google";
import { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/sidebar";

const libreFranklin = Libre_Franklin({ subsets: ["latin"] });
const roboto = Roboto({ weight: ["400"], subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nautilus Note",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="">
      <body className={roboto.className}>
        <Sidebar />
        <main>{children}</main>
      </body>
    </html>
  );
}
// bg-[#020817]
