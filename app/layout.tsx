import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "우리팀 사주 오행 궁합",
  description: "팀 오행 밸런스를 시각화하는 분석 도구",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen">
        <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
