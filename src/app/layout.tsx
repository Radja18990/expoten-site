import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EXPOTEN — лендинг",
  description: "Демо-страница EXPOTEN: галерея, логотип-оверлей, экспорт JPG/PDF",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-white text-zinc-800">
        {children}
      </body>
    </html>
  );
}
