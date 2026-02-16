"use client";

import React, { useEffect, useState } from "react";
import CourtroomPreview from "@/components/CourtroomPreview";
import type { Scenario } from "@/lib/types";

export default function ClientPreview({ scenario }: { scenario: Scenario }) {
  // startKey forces the preview to (re)start when the scenario changes
  const [startKey, setStartKey] = useState(0);

  useEffect(() => {
    setStartKey((k) => k + 1);
  }, [scenario?.id]);

  return <CourtroomPreview config={scenario} startKey={startKey} />;
}
