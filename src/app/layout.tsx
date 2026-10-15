import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SEIZE ALERT — Active Epilepsy Technology | Closed-Loop Cervical-Auricular Band",
  description:
    "High-impact medical-grade showcase and pitch application for SEIZE ALERT: Active Epilepsy Technology. Closed-loop cervical-auricular non-watch band with tVNS vagus nerve micro-stimulation, biocompatible dry gold electrodes, and standalone GPS/LTE dispatch.",
  keywords: [
    "SEIZE ALERT",
    "Epilepsy Technology",
    "tVNS Vagus Nerve Stimulation",
    "Closed-Loop Seizure Intervention",
    "Cervical Auricular Band",
    "ISO 10993 Biocompatible",
    "TinyML Edge Seizure Detection",
    "Medical Device India"
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full overflow-hidden select-none">
      <body className="h-full w-full overflow-hidden m-0 p-0 bg-[#080d1a] text-slate-100 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
