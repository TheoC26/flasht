import AuthProvider from "@/components/AuthProvider";
import { Cabin_Sketch } from "next/font/google";
import "./globals.css";

const cabinSketch = Cabin_Sketch({ subsets: ["latin"], weight: ["400", "700"] });

export const metadata = {
  title: "Flasht",
  description: "A flashcard app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={cabinSketch.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
