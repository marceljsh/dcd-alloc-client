"use client";

import { DnDPills } from "@/components/DnDPills";
import { useState } from "react";

export default function SandboxPage() {
  const [pills, setPills] = useState<string[]>([
    "Alpha",
    "Bravo",
    "Charlie",
    "Delta",
    "Echo",
    "Foxtrot",
    "Golf",
    "Hotel",
    "India",
  ]);

  return (
    <div className="mx-auto">
      <DnDPills pills={pills} onChange={setPills} />
      <button
        onClick={() => {
          console.log("Page order:", pills);
        }}
      >
        Show
      </button>
    </div>
  );
}
