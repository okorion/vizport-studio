import type { Metadata } from "next";
import "./globals.css";

const SITE_ORIGIN = "https://vizport-studio.okorion.chatgpt.site";
const socialImage = `${SITE_ORIGIN}/og.png`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: "VizPort Studio — 데이터에서 이식 가능한 그래프까지",
  description:
    "데이터를 로컬에서 분석하고 적합한 그래프를 추천해 React 코드, VizSpec, LLM 프롬프트로 내보내는 시각화 스튜디오입니다.",
  openGraph: {
    title: "VizPort Studio",
    description: "데이터에서 이식 가능한 그래프와 코드까지",
    type: "website",
    locale: "ko_KR",
    url: SITE_ORIGIN,
    images: [
      {
        url: socialImage,
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
    images: [socialImage],
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
      <body>{children}</body>
    </html>
  );
}
