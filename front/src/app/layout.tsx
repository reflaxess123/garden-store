import { AuthProvider } from "@/features/auth/AuthContext";
import { QueryProvider } from "@/shared/lib/QueryProvider";
import { ThemeProvider } from "@/shared/lib/ThemeProvider";
import { Toaster } from "@/shared/ui/sonner";
import Footer from "@/widgets/Footer";
import Header from "@/widgets/Header";
import type { Metadata } from "next";
import { Inter, Onest } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const onest = Onest({
  subsets: ["latin", "cyrillic"],
  variable: "--font-onest",
});

export const metadata: Metadata = {
  title: "Garden Store v1",
  description:
    "Next 13 App Router + FSD + Python API + PostgreSQL + Auth + TanStack Query + TailwindCSS / shadcn-ui",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} ${onest.variable} font-sans flex flex-col min-h-screen`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <AuthProvider>
              <Header />
              <main className="flex-grow">{children}</main>
              <Footer />
            </AuthProvider>
          </QueryProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
