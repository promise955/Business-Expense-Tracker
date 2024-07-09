"use client";
import React, { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import NavBar from "@/components/Layout/Nav";
import BudgetCard from "@/components/BudgetCategory/BudgetCard";
import EditBudgetModal from "@/components/BudgetCategory/EditBudgetModal";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/context";
import DataService from "@/lib/fetch";
import { readUserSession } from "@/lib/action";
import DeleteBudgetModal from "@/components/BudgetCategory/DeleteBudgetModal";
import Cookies from "js-cookie";
import Loader from "@/components/Layout/Loader";
import NoRecord from "@/components/Layout/NoRecord";

const BudgetCategory = () => {
  const router = useRouter();
  const { currentUser } = useAppContext();

  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const openEditModal = (budget) => {
    setSelectedBudget(budget);
    setEditModalOpen(true);
  };

  const openDeleteModal = (budget) => {
    setSelectedBudget(budget);
    setDeleteModalOpen(true);
  };

  const closeModals = () => {
    setEditModalOpen(false);
    setDeleteModalOpen(false);
  };

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const result = await DataService.getDataNoAuth(
        `/budget/api?page=${page}&pageSize=${pageSize}`
      );
      setBudgets(result.budgets);
      setTotalCount(result.totalCount);
      setLoading(false);
    } catch (error) {
      toast.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!deleteModalOpen || !editModalOpen) {
      fetchBudgets();
    }
  }, [editModalOpen, deleteModalOpen, page, pageSize]);

  useEffect(() => {
    const getUserAndRedirect = async () => {

      if (!currentUser.email) {
        try {
          const { user } = await readUserSession();
          router.push("/budget");
        } catch (error) {
          router.replace("/login");
        }
      }
    };

    getUserAndRedirect();
  }, [currentUser, router]);
  const totalPages = Math.ceil(totalCount / pageSize);
  return (
    <>
      <NavBar isUser={Cookies.get("expense-user")} />
      <div className="w-full px-6 py-6 mx-auto min-h-screen flex flex-col bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="flex justify-start">
          <div className="w-full">
            <div className="flex justify-between mb-8">
              <h5 className="text-2xl font-semibold text-white">
                Your Budgets
              </h5>
              <button
                className="bg-purple-600 hover:bg-black-500 text-white font-semibold px-4 py-2 rounded-lg"
                onClick={() => openEditModal(null)}
              >
                Create New Budget
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <Loader />
        ) : budgets.length === 0 ? (
          <NoRecord />
        ) : (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
              {budgets?.length > 0 &&
                budgets?.map((budget, index) => (
                  <BudgetCard
                    budget={budget}
                    key={index}
                    openDeleteModal={openDeleteModal}
                    openEditModal={openEditModal}
                  />
                ))}
            </div>
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {deleteModalOpen && (
          <DeleteBudgetModal budget={selectedBudget} onClose={closeModals} />
        )}
        {editModalOpen && (
          <EditBudgetModal
            updatedBudget={selectedBudget}
            onClose={closeModals}
          />
        )}
      </div>
    </>
  );
};

export default BudgetCategory;
