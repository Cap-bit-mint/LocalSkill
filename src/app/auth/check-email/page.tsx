'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, ArrowLeft, RefreshCw } from 'lucide-react'

export default function CheckEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-blue-100 rounded-full">
              <Mail className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">验证邮件已发送</CardTitle>
          <CardDescription className="text-base">
            我们已向您的邮箱发送了一封验证邮件。<br />
            请点击邮件中的链接完成注册。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-zinc-50 rounded-lg p-4 text-sm text-zinc-600">
            <p className="font-medium text-zinc-700 mb-2">没收到邮件？</p>
            <ul className="text-left space-y-1">
              <li>1. 检查垃圾邮件文件夹</li>
              <li>2. 确认邮箱地址填写正确</li>
              <li>3. 可能需要等待 1-2 分钟</li>
            </ul>
          </div>
          <div className="flex flex-col gap-2">
            <Button href="/auth/login">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回登录
            </Button>
            <Button href="/auth/signup" variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              使用其他邮箱注册
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
