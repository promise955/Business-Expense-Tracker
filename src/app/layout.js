import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster} from "sonner";
const inter = Inter({ subsets: ["latin"] });
import { AppWrapper } from "@/context/context";
import 'react-datepicker/dist/react-datepicker.css';

export const metadata = {
  title: "Expense Tracker",
  description: "Track your expenses",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="">
    <body className={inter.className}>
      <AppWrapper>{children}</AppWrapper>
    </body>
    <Toaster richColors />
  </html>
  );
}
