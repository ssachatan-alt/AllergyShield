import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AllergyShield — Intelligent Allergy Detection & Ingredient Safety Scanner",
  description:
    "Clinical-grade patient allergy matrix, multi-year reaction progression tracker, physical lab report OCR parser, and real-time camera-based ingredient safety scanner.",
  keywords: [
    "allergy detection",
    "ingredient scanner",
    "food allergy safety",
    "ImmunoCAP OCR",
    "anaphylaxis tracker",
    "cross-reactivity",
    "clinical health records"
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-[#F8FAFC] dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 transition-colors">
        {children}
      </body>
    </html>
  );
}
