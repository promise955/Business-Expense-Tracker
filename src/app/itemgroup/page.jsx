"use client";
import React, { useEffect, useState } from "react";
import NavBar from "@/components/Layout/Nav";
import Cookies from "js-cookie";
import Image from "next/image";
import DataService from "@/lib/fetch";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/context";
import { readUserSession } from "@/lib/action";
import { toast } from "sonner";
import ItemCardGroup from "@/components/ItemGroup/ItemCardGroup";
import EditItemGroupModal from "@/components/ItemGroup/EditItemGroupModal";
import DeleteItemGroupModal from "@/components/ItemGroup/DeleteItemGroupModal";

const ItemGroup = () => {
  const router = useRouter();
  const [items, setitems] = useState([]);
  const [loading, setLoading] = useState();
  const { isUser, setUser } = useAppContext();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedItem, setSelecteditem] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const openEditModal = (item) => {
    setSelecteditem(item);
    setEditModalOpen(true);
  };

  const openDeleteModal = (item) => {
    setSelecteditem(item);
    setDeleteModalOpen(true);
  };

  const closeModals = () => {
    setEditModalOpen(false);
    setDeleteModalOpen(false);
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      const result = await DataService.getDataNoAuth(
        `/itemgroup/api?page=${page}&pageSize=${pageSize}`
      );
      setitems(result.itemgroups);
      setTotalCount(result.totalCount);
      setLoading(false);
    } catch (error) {
      toast.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!deleteModalOpen || !editModalOpen) {
      fetchItems();
    }
  }, [editModalOpen, deleteModalOpen, page, pageSize]);

  useEffect(() => {
    const getUserAndRedirect = async () => {
      if (!isUser) {
        try {
          const { user } = await readUserSession();
          Cookies.set("expense-user", user.email, { expires: 7 });
          router.prefetch("/itemgroup");
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
              <h5 className="text-2xl font-semibold text-white">
                Your Items Groups
              </h5>
              <button
                className="bg-purple-600 hover:bg-black-500 text-white font-semibold px-4 py-2 rounded-lg"
                onClick={() => openEditModal(null)}
              >
                Create New Item Group
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center flex-grow">
            <div className="flex flex-col items-center justify-center flex-grow">
              <svg
                className="animate-spin h-10 w-10 text-blue-500 mb-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 4.418 3.582 8 8 8v-4zm14-1.162A7.963 7.963 0 0120 12h4c0 4.418-3.582 8-8 8v-4z"
                ></path>
              </svg>
              <p className="text-white text-4xl font-bold">Loading...</p>
            </div>
          </div>
        ) : items?.length === 0 ? (
          <header className="flex flex-col items-center justify-center flex-grow">
            <div className="w-2/3 text-center">
              <h1 className="text-white text-4xl font-bold mb-4">
                No Record Found
              </h1>
            </div>
            <div className="relative w-2/3 h-80">
              <Image
                src={`/expense.svg`}
                alt="Expense Tracker"
                layout="fill"
                objectFit="contain"
              />
            </div>
          </header>
        ) : (
          <div>
            {items?.length > 0 &&
              items?.map((item, index) => (
                <ItemCardGroup
                  item={item}
                  key={index}
                  openDeleteModal={openDeleteModal}
                  openEditModal={openEditModal}
                />
              ))}

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
          <DeleteItemGroupModal item={selectedItem} onClose={closeModals} />
        )}
        {editModalOpen && (
          <EditItemGroupModal
            updatedItem={selectedItem}
            onClose={closeModals}
          />
        )}
      </div>
    </>
  );
};

export default ItemGroup;
