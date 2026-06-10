"use client";

import { useEffect } from "react";

const SATOSHI_HREF = "https://api.fontshare.com/v2/css?f[]=satoshi@500,700&display=swap";

export function FontLoader() {
  useEffect(() => {
    if (document.querySelector(`link[href="${SATOSHI_HREF}"]`)) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = SATOSHI_HREF;
    document.head.appendChild(link);
  }, []);

  return null;
}
