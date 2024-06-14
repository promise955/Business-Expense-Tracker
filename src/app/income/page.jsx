'use client'
import DeleteIncomeModal from "@/components/Income/DeleteIncomeModal";
import EditIncomeModal from "@/components/Income/EditIncomeModal";
import IncomeCard from "@/components/Income/IncomeCard";
import Loader from "@/components/Layout/Loader";
import NavBar from "@/components/Layout/Nav";
import NoRecord from "@/components/Layout/NoRecord";
import Pagination from "@/components/Layout/Pagination";
import { useAppContext } from "@/context/context";
import { readUserSession } from "@/lib/action";
import DataService from "@/lib/fetch";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import React, { useState ,useEffect} from "react";

const Income = () => {
  const router = useRouter();
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState();
  const { isUser, setUser } = useAppContext();
  const [selectedIncome, setSelectedIncome] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const openEditModal = (item) => {
    setSelectedIncome(item);
    setEditModalOpen(true);
  };

  const openDeleteModal = (item) => {
    setSelectedIncome(item);
    setDeleteModalOpen(true);
  };

  const closeModals = () => {
    setEditModalOpen(false);
    setDeleteModalOpen(false);
  };

  const fetchIncomes = async () => {
    try {
      setLoading(true);
      const {incomes,totalCount} = await DataService.getDataNoAuth(
        `/income/api?page=${page}&pageSize=${pageSize}`
      );
      setIncomes(incomes);
      setTotalCount(totalCount);
      setLoading(false);
    } catch (error) {
      toast.error(error);
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!deleteModalOpen || !editModalOpen) {
      fetchIncomes();
    }
  }, [editModalOpen, deleteModalOpen, page, pageSize]);

  useEffect(() => {
    const getUserAndRedirect = async () => {
      if (!isUser) {
        try {
          const { user } = await readUserSession();
          Cookies.set("expense-user", user.email, { expires: 7 });
          router.prefetch("/incomes");
        } catch (error) {
          router.replace("/login");
        }
      }
    };

    getUserAndRedirect();
  }, [isUser, router]);

  const totalPages = Math.ceil(totalCount / pageSize);
  return (
    <>
      <NavBar isUser={Cookies.get("expense-user")} />
      <div className="w-full px-6 py-6 mx-auto min-h-screen flex flex-col bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="flex justify-start">
          <div className="w-full">
            <div className="flex justify-between mb-8">
              <h5 className="text-2xl font-semibold text-white">Your Incomes</h5>
              <button
                className="bg-purple-600 hover:bg-black-500 text-white font-semibold px-4 py-2 rounded-lg"
                onClick={() => openEditModal(null)}
              >
                Create New Income
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <Loader />
        ) : incomes?.length === 0 ? (
          <NoRecord />
        ) : (
          <div>
            {incomes?.length > 0 &&
              incomes?.map((income, index) => (
                <IncomeCard
                  income={income}
                  key={index}
                  openDeleteModal={openDeleteModal}
                  openEditModal={openEditModal}
                />
              ))}
            <Pagination page={page} setPage={setPage} totalPages={totalPages} />
          </div>
        )}

        {deleteModalOpen && (
          <DeleteIncomeModal income={selectedIncome} onClose={closeModals} />
        )}
        {editModalOpen && (
          <EditIncomeModal updatedIncome={selectedIncome} onClose={closeModals} />
        )}
      </div>
    </>
  );
};

export default Income;
