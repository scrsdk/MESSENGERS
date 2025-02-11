import type { Metadata } from "next";
import "../styles/globals.css";
import { ToastContainer } from "react-toastify";
export const metadata: Metadata = {
  title: "Telegram messenger",
  description: "FullStack NextJs Telegram messenger with socket.io",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <link
        rel="icon"
        type="image/png"
        href="./images/favicon-96x96.png"
        sizes="96x96"
      />
      <link rel="icon" type="image/svg+xml" href="./images/favicon.svg" />
      <link rel="shortcut icon" href="./images/favicon.ico" />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="./images/apple-touch-icon.png"
      />
      <meta name="apple-mobile-web-app-title" content="Telegram" />
      <link rel="manifest" href="/manifest.json" />
      <meta name="theme-color" content="#232735" />
      <body className="font-vazirRegular bg-leftBarBg h-full">
        <ToastContainer />
        {children}
      </body>
    </html>
  );
}
