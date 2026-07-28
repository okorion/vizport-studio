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
  title: "VizPort Studio — 데이터에서 이식 가능한 그래프까지",
  description:
    "데이터를 로컬에서 분석하고 적합한 그래프를 추천해 React 코드, VizSpec, LLM 프롬프트로 내보내는 시각화 스튜디오입니다.",
  openGraph: {
    title: "VizPort Studio",
    description: "데이터에서 이식 가능한 그래프와 코드까지",
    type: "website",
    locale: "ko_KR",
    images: [
      {
        url: "/og.png",
        width: 1731,
        height: 909,
        alt: "데이터가 그래프와 코드로 변환되는 VizPort Studio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VizPort Studio",
    description: "데이터에서 이식 가능한 그래프와 코드까지",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
