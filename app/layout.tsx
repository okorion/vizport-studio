import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

const FALLBACK_ORIGIN = "https://vizport-studio.okorion.chatgpt.site";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const forwardedProtocol = requestHeaders.get("x-forwarded-proto");
  const protocol = forwardedProtocol === "http" || forwardedProtocol === "https"
    ? forwardedProtocol
    : host?.startsWith("localhost")
      ? "http"
      : "https";
  const origin = host && /^[a-z0-9.-]+(?::\d+)?$/i.test(host)
    ? `${protocol}://${host}`
    : FALLBACK_ORIGIN;
  const socialImage = new URL("/og.png", origin).toString();

  return {
    metadataBase: new URL(origin),
    title: "VizPort Studio — 데이터에서 이식 가능한 그래프까지",
    description:
      "데이터를 로컬에서 분석하고 적합한 그래프를 추천해 React 코드, VizSpec, LLM 프롬프트로 내보내는 시각화 스튜디오입니다.",
    openGraph: {
      title: "VizPort Studio",
      description: "데이터에서 이식 가능한 그래프와 코드까지",
      type: "website",
      locale: "ko_KR",
      url: origin,
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
}

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
