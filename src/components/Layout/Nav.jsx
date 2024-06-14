"use client";
import React, { useEffect, useState, useTransition } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Cookies from "js-cookie";

const NavBar = ({ isUser }) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [loggedOut, setLoggedOut] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (loggedOut) {
      router.replace("/login");
      router.refresh();
    }
  }, [loggedOut, router]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    const confirmed = confirm("Are you sure you want to log out?");
    if (confirmed) {
      try {
        const supabase = createClient();
        await supabase.auth.signOut();
        setLoggedOut(true);
        Cookies.remove("expense-user");
      } catch (error) {
        toast.error("Log out failed. Please try again.");
      }
    }
  };

  if (!isClient) return null;

  return (
    <nav className="flex items-center justify-between flex-wrap bg-gray-800 p-6">
      <div className="flex items-center flex-shrink-0 text-white mr-6">
        <span className="font-semibold text-xl tracking-tight">
          Expense Tracker
        </span>
      </div>
      <div className="block lg:hidden">
        <button
          className="flex items-center px-3 py-2 border rounded text-white-200 border-grey-400 hover:text-white hover:border-white"
          onClick={handleToggle}
        >
          <svg
            className="fill-current h-3 w-3"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>Menu</title>
            <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
          </svg>
        </button>
      </div>

      <div
        className={`${
          isOpen ? "block" : "hidden"
        } w-full flex-grow lg:flex lg:items-center lg:w-auto`}
      >
        {isUser ? (
          <>
            <div className="text-sm lg:flex-grow">
              <a
                href="/dashboard"
                className="block mt-4 lg:inline-block lg:mt-0 text-white hover:text-white mr-4"
              >
                Expenses
              </a>
              <a
                href="/budget"
                className="block mt-4 lg:inline-block lg:mt-0 text-white hover:text-white mr-4"
              >
                Budget
              </a>
              <a
                href="/income"
                className="block mt-4 lg:inline-block lg:mt-0 text-white hover:text-white mr-4"
              >
                Income
              </a>
              <a
                href="/item"
                className="block mt-4 lg:inline-block lg:mt-0 text-white hover:text-white mr-4"
              >
                Item
              </a>
              <a
                href="/itemgroup"
                className="block mt-4 lg:inline-block lg:mt-0 text-white hover:text-white mr-4"
              >
                Item Group
              </a>
            </div>
            <div>
              <a
                href="#"
                className="inline-block text-sm px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-gray-500 mt-4 lg:mt-0"
              >
                {isUser}
              </a>
            </div>
            <div className="lg:ml-6">
              <button
                onClick={handleLogout}
                className="inline-block text-sm px-4 py-2 leading-none border rounded text-white mt-4 lg:mt-0"
              >
                Logout
              </button>
            </div>
          </>
        ) : (
          <div className="lg:flex lg:w-full lg:flex-wrap lg:justify-end">
            <div>
              <a
                href="/login"
                className="inline-block text-sm px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-gray-50 mt-4 lg:mt-0"
              >
                Login
              </a>
            </div>
            <div className="lg:ml-6">
              <a
                href="/register"
                className="inline-block text-sm px-4 py-2 leading-none border rounded text-white mt-4 lg:mt-0"
              >
                Register
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
