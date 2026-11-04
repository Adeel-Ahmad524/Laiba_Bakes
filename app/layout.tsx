import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { Toaster } from "sonner";
import { CartProvider } from "@/components/site/cart-provider";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Laiba Bakes | Premium Bakery & Custom Cakes in Dera Ismail Khan",
    template: "%s | Laiba Bakes",
  },
  description:
    "Beautifully baked cakes, cupcakes and pastries in Dera Ismail Khan. Order online or design a custom cake with Laiba Bakes.",
  keywords: [
    "Laiba Bakes",
    "bakery Dera Ismail Khan",
    "custom cakes Dera Ismail Khan",
    "cake delivery DI Khan",
    "birthday cakes Pakistan",
  ],
  openGraph: {
    title: "Laiba Bakes | Premium Cakes & Bakes",
    description:
      "Baked with love for your celebrations. Order cakes, cupcakes and pastries online in Dera Ismail Khan.",
    type: "website",
    locale: "en_PK",
    images: [{ url: "/images/hero-cake.jpg", width: 1800, height: 1324 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Laiba Bakes",
    description: "Premium cakes and bakes in Dera Ismail Khan.",
    images: ["/images/hero-cake.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#49352D",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${manrope.variable}`}>
      <body className="font-sans antialiased">
        <CartProvider>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: "#49352D",
                color: "#FDFAF6",
                border: "1px solid rgba(213,177,122,0.35)",
                borderRadius: "16px",
              },
            }}
          />
        </CartProvider>
      </body>
    </html>
  );
}
