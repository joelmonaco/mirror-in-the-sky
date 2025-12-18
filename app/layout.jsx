import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

const inter = Inter({
  subsets: ["latin"],
  // Include common weights for better typography
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

// Basis-Metadaten für die gesamte App
export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://mirror-in-the-sky.ai"
  ),
  title: {
    default: "MIRROR IN THE SKY",
    template: "%s | MIRROR IN THE SKY",
  },
  description:
    "Erstelle deinen eigenen AI Avatar und interagiere mit anderen Avataren. Die Zukunft der digitalen Identität.",
  keywords: [
    "Avatar",
    "KI",
    "AI",
    "AI Avatar",
    "Künstliche Intelligenz",
    "Digital Identity",
    "Virtual Avatar",
    "AI Plattform",
  ],
  authors: [{ name: "mirror-in-the-sky Team" }],
  creator: "mirror-in-the-sky",
  publisher: "mirror-in-the-sky",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icon.webp", type: "image/webp" },
    ],
    apple: [
      { url: "/icon.webp", sizes: "180x180", type: "image/webp" },
    ],
    shortcut: "/icon.webp",
  },
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: "mirror-in-the-sky",
    title: "mirror-in-the-sky - Deine AI Avatar Plattform",
    description:
      "Erstelle deinen eigenen AI Avatar und interagiere mit anderen Avataren. Die Zukunft der digitalen Identität.",
    images: [
      {
        url: "/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "mirror-in-the-sky - AI Avatar Plattform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "mirror-in-the-sky - Deine AI Avatar Plattform",
    description:
      "Erstelle deinen eigenen AI Avatar und interagiere mit anderen Avataren.",
    images: ["/og-default.jpg"],
    creator: "@mirror-in-the-sky",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function RootLayout({ children }) {
  // Get locale and messages using next-intl's built-in functions
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className="notranslate"
      translate="no"
      suppressHydrationWarning
    >
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
        <meta name="google" content="notranslate" />
      </head>
      <body
        className={`${inter.className} min-h-screen w-full antialiased overflow-x-hidden`}
        suppressHydrationWarning={true}
      >
        <div
          id="fixed-background"
          className="fixed inset-0 w-full h-full z-[-9999] pointer-events-none"
        ></div>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
        <Toaster
          toastOptions={{
            style: {
              background: "var(--color-gray-800)",
              color: "var(--color-white)",
              border: "1px solid var(--color-gray-700)",
            },
          }}
        />
      </body>
    </html>
  );
}
