import type { Metadata } from "next";
import { Noto_Sans_TC } from "next/font/google";
import { Header } from "@/components/layout/Header";
import "./globals.css";

const notoSansTC = Noto_Sans_TC({
  variable: "--font-noto-sans-tc",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "粵語金融術語學堂",
  description: "上載 PDF，AI 幫你用廣東話拆解所有金融術語",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-HK" className={`${notoSansTC.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <Header />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
