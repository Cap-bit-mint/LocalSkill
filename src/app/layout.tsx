import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "LocalSkill - AI-Ready 商家 Skill 平台",
    template: "%s | LocalSkill",
  },
  description: "零代码生成 AI-Ready 商家 Skill。提交美团/大众点评链接，自动生成 MCP 标准的 Store Skill。",
  keywords: ["AI", "Store Skill", "MCP", "美团", "商家", "本地生活"],
  authors: [{ name: "LocalSkill Team" }],
  openGraph: {
    title: "LocalSkill - AI-Ready 商家 Skill 平台",
    description: "零代码生成 AI-Ready 商家 Skill",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
