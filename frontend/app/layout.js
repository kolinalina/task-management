import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
    subsets: ["latin"],
    variable: "--font-sans",
    weight: ['300', '400', '500', '600', '700', '800']
});

export const metadata = {
    title: "TaskFlow",
    description: "Task Management Platform",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" className="dark">
            <body className={`${inter.variable} antialiased`}>
                {children}
            </body>
        </html>
    );
}