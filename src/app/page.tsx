import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRight,
  Zap,
  Link2,
  Sparkles,
  MapPin,
  Clock,
  Phone,
  Star,
  Users,
  Bot,
  CheckCircle2,
  Store,
  GitBranch,
  ChevronRight,
} from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <nav className="h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Store className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="text-lg font-semibold tracking-tight">LocalSkill</span>
            </Link>
            <div className="flex items-center gap-1">
              <Link href="/auth/login" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                登录
              </Link>
              <Link href="/auth/signup">
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20">
                  免费入驻
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section - Asymmetric Split */}
      <section className="relative pt-32 pb-20 lg:pb-32 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-[40%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[50%] h-[50%] rounded-full bg-amber-500/5 blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left - Content */}
            <div className="lg:col-span-7 space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-sm font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                </span>
                已有 1,200+ 本地商家入驻
              </div>

              {/* Headline */}
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight leading-[1.1]">
                  <span className="text-foreground">5分钟让你的店铺</span>
                  <br />
                  <span className="text-emerald-600 dark:text-emerald-500">被AI主动推荐</span>
                </h1>
                <p className="text-lg sm:text-xl text-muted-foreground max-w-xl leading-relaxed">
                  提交美团/大众点评链接，AI自动生成店铺介绍，让顾客问AI就能找到你、联系你。
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/auth/signup" className="inline-flex">
                  <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 h-12 text-base shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/30 transition-all group">
                    我是商家，立即入驻
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/master-skill" className="inline-flex">
                  <Button size="lg" variant="outline" className="px-8 h-12 text-base">
                    安装全城查询助手
                  </Button>
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  无需技术背景
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  完全免费
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  3分钟完成
                </span>
              </div>
            </div>

            {/* Right - Visual */}
            <div className="lg:col-span-5 relative">
              {/* Phone mockup */}
              <div className="relative mx-auto max-w-[280px]">
                {/* Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/30 to-amber-500/20 rounded-[3rem] blur-2xl" />

                {/* Phone frame */}
                <div className="relative bg-zinc-900 dark:bg-black rounded-[2.5rem] p-3 shadow-2xl shadow-black/50">
                  <div className="bg-zinc-950 rounded-[2rem] overflow-hidden">
                    {/* Status bar */}
                    <div className="h-8 bg-zinc-900 flex items-end justify-center pb-1">
                      <div className="w-20 h-5 bg-black rounded-full" />
                    </div>

                    {/* Chat content */}
                    <div className="p-4 space-y-4">
                      {/* User message */}
                      <div className="flex gap-2 justify-end">
                        <div className="bg-emerald-600 text-white rounded-2xl rounded-tr-md px-4 py-2.5 max-w-[200px]">
                          <p className="text-sm">附近有什么川菜馆？</p>
                        </div>
                      </div>

                      {/* AI response */}
                      <div className="flex gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                          <Bot className="h-3.5 w-3.5 text-white" />
                        </div>
                        <div className="bg-zinc-800 rounded-2xl rounded-tl-md px-4 py-2.5">
                          <p className="text-sm text-zinc-200">找到3家川菜馆</p>
                        </div>
                      </div>

                      {/* Result card */}
                      <div className="flex gap-2">
                        <div className="w-7 h-7" />
                        <div className="bg-zinc-800/80 border border-zinc-700/50 rounded-xl p-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-zinc-100">川味坊</span>
                            <div className="flex items-center gap-0.5">
                              <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                              <span className="text-xs text-zinc-400">4.8</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-zinc-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              海淀区
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              10:00-22:00
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works - Bento grid style */}
      <section className="py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              简单3步，让AI认识你的店
            </h2>
            <p className="text-muted-foreground">
              不需要写代码，不需要懂技术
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 lg:gap-6">
            {/* Step 1 */}
            <Card className="group relative overflow-hidden bg-gradient-to-br from-card to-card/80 border-2 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10">
              <CardContent className="p-6 lg:p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Link2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-4xl font-bold text-muted-foreground/20">01</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">提交店铺链接</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  复制美团、大众点评或高德地图的店铺页面链接，粘贴进来
                </p>
                <div className="mt-6 p-3 bg-muted/50 rounded-xl">
                  <code className="text-xs text-muted-foreground break-all">
                    meituan.com/shop/123456
                  </code>
                </div>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card className="group relative overflow-hidden bg-gradient-to-br from-card to-card/80 border-2 hover:border-amber-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10">
              <CardContent className="p-6 lg:p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Sparkles className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span className="text-4xl font-bold text-muted-foreground/20">02</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">AI自动分析</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  我们的AI自动解析链接内容，提取店铺名称、地址、菜单等信息
                </p>
                <div className="mt-6 flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                  <Zap className="h-4 w-4" />
                  <span>30秒内完成解析</span>
                </div>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card className="group relative overflow-hidden bg-gradient-to-br from-card to-card/80 border-2 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 md:col-span-1">
              <CardContent className="p-6 lg:p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <GitBranch className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-4xl font-bold text-muted-foreground/20">03</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">一键发布上线</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  确认信息无误后，一键发布到云端，AI助手就能推荐你的店
                </p>
                <div className="mt-6 flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>实时同步到全网</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Demo Conversation - Realistic UI */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              顾客会这样找到你
            </h2>
            <p className="text-muted-foreground">
              当顾客向AI询问时，你的店铺会自动出现在推荐中
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Card className="bg-zinc-900 dark:bg-black border-zinc-800 overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-zinc-800 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">全城商家查询助手</p>
                  <p className="text-zinc-500 text-xs">AI powered</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5 text-xs text-emerald-400">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  在线
                </div>
              </div>

              {/* Chat content */}
              <CardContent className="p-6 space-y-5">
                {/* User */}
                <div className="flex gap-3 justify-end">
                  <div className="bg-zinc-800 rounded-2xl rounded-tr-md px-4 py-3 max-w-sm">
                    <p className="text-zinc-100 text-sm">附近有什么好吃的川菜馆？</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center flex-shrink-0">
                    <Users className="h-4 w-4 text-zinc-300" />
                  </div>
                </div>

                {/* AI Thinking */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-zinc-800/50 rounded-2xl rounded-tl-md px-4 py-3">
                    <p className="text-zinc-300 text-sm">
                      正在查询附近的川菜馆...
                    </p>
                  </div>
                </div>

                {/* Results */}
                <div className="space-y-3">
                  <p className="text-zinc-400 text-sm px-1">找到3家附近的川菜馆：</p>

                  {/* Restaurant 1 */}
                  <div className="bg-zinc-800/70 border border-zinc-700/50 rounded-xl p-4 hover:bg-zinc-800 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-medium">川味坊</span>
                          <Badge variant="secondary" className="text-[10px] h-4 px-1.5 bg-emerald-500/20 text-emerald-400 border-0">
                            推荐
                          </Badge>
                        </div>
                        <p className="text-zinc-400 text-sm mb-2">招牌毛血旺、水煮鱼</p>
                        <div className="flex items-center gap-4 text-xs text-zinc-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            海淀区中关村
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            10:00-22:00
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            010-8888****
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-amber-400">
                          <Star className="h-4 w-4 fill-amber-400" />
                          <span className="text-white font-medium">4.8</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Restaurant 2 */}
                  <div className="bg-zinc-800/40 border border-zinc-700/30 rounded-xl p-4 hover:bg-zinc-800/60 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-zinc-200 font-medium">老成都火锅</span>
                        </div>
                        <p className="text-zinc-500 text-sm mb-2">正宗成都风味</p>
                        <div className="flex items-center gap-4 text-xs text-zinc-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            朝阳区望京
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                            4.6
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Input hint */}
                <div className="pt-4 border-t border-zinc-800">
                  <div className="flex items-center gap-3 text-zinc-500 text-sm">
                    <div className="flex-1 bg-zinc-800 rounded-full px-4 py-2.5 text-zinc-400">
                      输入你的问题...
                    </div>
                    <Button size="icon" variant="ghost" className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white h-10 w-10">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Success Stories - Grid with avatars */}
      <section className="py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              商家案例
            </h2>
            <p className="text-muted-foreground">
              听听他们怎么说
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Story 1 */}
            <Card className="group hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  "以前顾客想了解我们店都要去大众点评翻，现在直接问AI就行了。上线第一周就多了20多个咨询电话。"
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-medium">
                    李
                  </div>
                  <div>
                    <p className="font-medium text-sm">李老板</p>
                    <p className="text-xs text-muted-foreground">川味坊 · 成都</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Story 2 */}
            <Card className="group hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  "操作太简单了，我把店里十几道招牌菜的信息填进去，5分钟就搞定了。AI回答的比我还准确。"
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white font-medium">
                    王
                  </div>
                  <div>
                    <p className="font-medium text-sm">王经理</p>
                    <p className="text-xs text-muted-foreground">粤式茶餐厅 · 深圳</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Story 3 */}
            <Card className="group hover:shadow-lg transition-shadow duration-300 md:col-span-2 lg:col-span-1">
              <CardContent className="p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  "最惊喜的是营业时间这个功能，顾客问的最多的就是'几点关门'，现在AI直接告诉他们，不用打电话了。"
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-medium">
                    张
                  </div>
                  <div>
                    <p className="font-medium text-sm">张老板</p>
                    <p className="text-xs text-muted-foreground">深夜拉面馆 · 上海</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section - Bold */}
      <section className="py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="relative rounded-3xl overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />

            {/* Content */}
            <div className="relative px-8 py-12 lg:px-16 lg:py-16 text-center">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 tracking-tight">
                让AI成为你的金牌销售
              </h2>
              <p className="text-emerald-100 mb-8 max-w-xl mx-auto text-lg">
                每天有大量用户在问AI"附近有什么好吃的"、"哪家店几点关门"...
                现在，你可以让AI主动推荐你的店铺。
              </p>
              <Link href="/auth/signup" className="inline-flex">
                <Button size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50 px-10 h-14 text-lg font-semibold shadow-2xl">
                  立即入驻，开启AI获客
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                <Store className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-sm">LocalSkill - 让AI帮你找好店</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/master-skill" className="hover:text-foreground transition-colors flex items-center gap-1">
                全城商家查询助手
                <ChevronRight className="h-3 w-3" />
              </Link>
              <Link href="/auth/login" className="hover:text-foreground transition-colors">
                登录
              </Link>
              <Link href="/auth/signup" className="hover:text-foreground transition-colors">
                免费入驻
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
