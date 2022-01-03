import "@/styles/globals.css";

import { SSRProvider } from "@react-aria/ssr";
import type { AppProps } from "next/app";
import Head from "next/head";

import { globalCss } from "@root/stitches.config";

const globalStyles = globalCss({
  "@font-face": [
    {
      fontFamily: "Lato100",
      src: "url(/fonts/Lato/Lato-Hairline.ttf)",
      fontDisplay: "swap",
    },
    {
      fontFamily: "Lato200",
      src: "url(/fonts/Lato/Lato-Thin.ttf)",
      fontDisplay: "swap",
    },
    {
      fontFamily: "Lato300",
      src: "url(/fonts/Lato/Lato-Light.ttf)",
      fontDisplay: "swap",
    },
    {
      fontFamily: "Lato400",
      src: "url(/fonts/Lato/Lato-Regular.ttf)",
      fontDisplay: "swap",
    },
    {
      fontFamily: "Lato500",
      src: "url(/fonts/Lato/Lato-Medium.ttf)",
      fontDisplay: "swap",
    },
    {
      fontFamily: "Lato600",
      src: "url(/fonts/Lato/Lato-Semibold.ttf)",
      fontDisplay: "swap",
    },
    {
      fontFamily: "Lato700",
      src: "url(/fonts/Lato/Lato-Bold.ttf)",
      fontDisplay: "swap",
    },
    {
      fontFamily: "Lato800",
      src: "url(/fonts/Lato/Lato-Heavy.ttf)",
      fontDisplay: "swap",
    },
    {
      fontFamily: "Lato900",
      src: "url(/fonts/Lato/Lato-Black.ttf)",
      fontDisplay: "swap",
    },
  ],
});

function MyApp({ Component, pageProps }: AppProps) {
  globalStyles();

  return (
    <>
      <Head>
        <title>subs2bank</title>
        <meta name="description" content="subs2bank" />
      </Head>

      <SSRProvider>
        <Component {...pageProps} />
      </SSRProvider>
    </>
  );
}

export default MyApp;
