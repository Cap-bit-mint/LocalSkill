import type { Metadata, Viewport } from "next";
import "./globals.css";

// Use CSS variables for fonts - define in globals.css
// This avoids network dependencies during build

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a1a" },
  ],
};

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
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
