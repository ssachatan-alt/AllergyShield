"use client";

import React from "react";

export default function HomePage() {
  return (
    <main className="w-screen h-screen overflow-hidden bg-[#0B0F19] m-0 p-0">
      <iframe
        src="/index.html"
        title="SEIZE ALERT — Active Epilepsy Technology Showcase"
        className="w-full h-full border-none m-0 p-0 block"
        allow="serial; autoplay; accelerometer; gyroscope"
      />
    </main>
  );
}
