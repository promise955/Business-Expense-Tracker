"use client";
import NavBar from "@/components/Layout/Nav";
import React from "react";
import { useAppContext } from "@/context/context";
import { readUserSession } from "@/lib/action";
import { useTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import DataService from "@/lib/fetch";
import Cookies from "js-cookie";
import ExpenseCard from "@/components/Expense/ExpenseCard";
import NoRecord from "@/components/Layout/NoRecord";
import Loader from "@/components/Layout/Loader";
import Pagination from "@/components/Layout/Pagination";
import ExpenseView from "@/components/Expense/ExpenseView";


const Dashboard = () => {
  const router = useRouter();
  const { currentUser, setUser } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [expenseModal, setExpenseModal] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedExpense, setSelectedExpense] = useState(null);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const { expenses, totalCount } = await DataService.getDataNoAuth(
        `/dashboard/api?page=${page}&pageSize=${pageSize}`
      );
      console.log(expenses);
      setExpenses(expenses);
      setTotalCount(totalCount);
      setLoading(false);
    } catch (error) {
      toast.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!expenseModal) {
      fetchExpenses();
    }
  }, [expenseModal]);

  const closeModals = () => {
    setExpenseModal(false);
  };

  const openExpenseModal = (item) => {
    setSelectedExpense(item);
    setExpenseModal(true);
  };

  useEffect(() => {

    const getUserAndRedirect = async () => {
      if (!currentUser.email) {
        try {
          const { user } = await readUserSession();

          router.prefetch("/");
        } catch (error) {
          router.replace("/login");
        }
      }
    };

    getUserAndRedirect();
  }, [router,currentUser]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <>
      <NavBar />
      <div className="w-full px-6 py-6 mx-auto min-h-screen flex flex-col bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="flex justify-start">
          <div className="w-full">
            <div className="flex justify-between mb-8">
              <h5 className="text-2xl font-semibold text-white">
                Your Expense
              </h5>
              <button
                className="bg-purple-600 hover:bg-black-500 text-white font-semibold px-4 py-2 rounded-lg"
                onClick={() => router.push("/create-expense")}
              >
                Create Expense
              </button>
            </div>
          </div>
        </div>
        {loading ? (
          <Loader />
        ) : expenses.length === 0 ? (
          <NoRecord />
        ) : (
          <div>
            {/* expense list */}
            <div>
              {expenses?.length > 0 &&
                expenses?.map((expense, index) => (
                  <ExpenseCard
                    expense={expense}
                    key={index}
                    openExpenseModal={openExpenseModal}
                  />
                ))}
              <Pagination
                page={page}
                setPage={setPage}
                totalPages={totalPages}
              />
            </div>

            {/* end of expense list */}
          </div>
        )}

        {expenseModal && (
          <ExpenseView expense={selectedExpense} onClose={closeModals} />
        )}
      </div>
    </>
  );
};

export default Dashboard;
