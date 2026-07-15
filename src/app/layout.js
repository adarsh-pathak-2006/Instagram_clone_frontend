import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata = {
  title: "Instagram Clone",
  description: "A premium Instagram clone",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
