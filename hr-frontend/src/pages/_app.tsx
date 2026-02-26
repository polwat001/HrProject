"use client";

import type { AppProps } from "next/app";
import "@/app/globals.css";
import "@/index.css";
import "@/App.css";

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
