import type { Metadata } from "next"
import "react-big-calendar/lib/css/react-big-calendar.css"

import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "スケジュール管理アプリ",
    template: "%s | スケジュール管理アプリ",
  },
  description: "スケジュールの管理と自然言語での予定作成ができるアプリケーション",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
