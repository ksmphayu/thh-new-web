import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";

const prompt = Prompt({
  variable: "--font-prompt",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Simply Healthy - แผนประกันผู้ป่วยใน ไทยประกันสุขภาพ",
  description: "แผนประกันภัยสุขภาพเริ่มต้นที่คุ้มครองอุ่นใจและราคาเข้าถึงได้",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${prompt.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100">
        {children}
      </body>
    </html>
  );
}

