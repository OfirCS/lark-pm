import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { CompanyProvider } from "@/components/providers/CompanyProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

export const metadata: Metadata = {
  title: "Lark - AI Customer Intelligence for Product Managers",
  description: "The AI that listens to every customer conversation. Monitor Reddit, Twitter, support tickets, and sales calls to know exactly what to build next.",
  keywords: ["product management", "customer feedback", "AI", "social listening", "feature requests", "roadmap", "Lark"],
  authors: [{ name: "Lark" }],
  openGraph: {
    title: "Lark - AI Customer Intelligence for Product Managers",
    description: "Rising with insights. Your roadmap, powered by customer voice.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lark - AI Customer Intelligence",
    description: "Never miss a feature request again. Monitor Reddit, Twitter, calls, and tickets with AI.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const stored = JSON.parse(localStorage.getItem('lark-theme') || '{}');
                const theme = stored.state?.theme || 'light';
                document.documentElement.setAttribute('data-theme', theme);
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="antialiased">
        <AuthProvider>
          <CompanyProvider>
            <ThemeProvider>
              {children}
            </ThemeProvider>
          </CompanyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
