'use client'
import Footer from "@/components/Layout/Footer";
import Header from "@/components/Layout/Header";
import NavBar from "@/components/Layout/Nav";
import { useAppContext } from "@/context/context";
import { readUserSession } from "@/lib/action";
import { useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";


export default function Home() {
  const { currentUser } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    const getUserAndRedirect = async () => {
      if (!currentUser.email) {
        try {
          const { user } = await readUserSession();
          router.push("/dashboard");
        } catch (error) {
          router.replace("/login");
        }
      }
    };

    getUserAndRedirect();
  }, [currentUser, router]);
  return (
    <>

      <NavBar />
      <main className="min-h-screen flex flex-col bg-gradient-to-r from-purple-600 to-indigo-600">
        <Header />
        |<Footer />
      </main>

    </>
  );
}
