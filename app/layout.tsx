import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ??
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000"),
  ),
  title: "Historia Clínica — Stefany Muentes",
  description:
    "Registra tus datos personales, antropométricos y sociales en tu historia clínica con la terapeuta Stefany Muentes.",
  openGraph: {
    title: "Historia Clínica — Stefany Muentes",
    description:
      "Completa tu historia clínica en línea. Atención personalizada con la terapeuta Stefany Muentes.",
    type: "website",
    locale: "es_VE",
    images: [
      {
        url: "/terapeuta.jpg",
        width: 720,
        height: 1280,
        alt: "Stefany Muentes, terapeuta",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Historia Clínica — Stefany Muentes",
    description:
      "Completa tu historia clínica en línea con la terapeuta Stefany Muentes.",
    images: ["/terapeuta.jpg"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${plexSans.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
