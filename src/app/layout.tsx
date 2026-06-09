import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

const themeScript = `
  (function() {
    try {
      var theme = localStorage.getItem('theme');
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      var isDark = theme === 'dark' || (!theme && prefersDark);
      if (isDark) {
        document.documentElement.classList.add('dark');
      }
    } catch (e) {}
  })();
`

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a1a" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "LocalSkill - 让AI帮你找好店",
    template: "%s | LocalSkill",
  },
  description: "5分钟让你的店铺被AI主动推荐。提交美团/大众点评链接，AI自动生成店铺介绍，让顾客问AI就能找到你。",
  keywords: ["AI商家", "智能店铺", "本地商家", "美团", "大众点评", "AI推荐"],
  authors: [{ name: "LocalSkill Team" }],
  openGraph: {
    title: "LocalSkill - 让AI帮你找好店",
    description: "5分钟让你的店铺被AI主动推荐",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col font-sans [&_*]:font-sans">
        <ThemeProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
