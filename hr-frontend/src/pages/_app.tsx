"use client";

import type { AppProps } from "next/app";
import "@/globals.css";
import "@/index.css";
import "@/App.css";

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
