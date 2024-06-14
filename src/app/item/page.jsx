"use client";
import React, { useEffect, useState } from "react";
import NavBar from "@/components/Layout/Nav";
import Cookies from "js-cookie";
import DataService from "@/lib/fetch";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/context";
import { readUserSession } from "@/lib/action";
import { toast } from "sonner";
import ItemCard from "@/components/Item/ItemCard";
import EditItemModal from "@/components/Item/EditItemModal";
import DeleteItemModal from "@/components/Item/DeleteItemModal";
import Loader from "@/components/Layout/Loader";
import NoRecord from "@/components/Layout/NoRecord";
import Pagination from "@/components/Layout/Pagination";

const Item = () => {
  const router = useRouter();
  const [items, setitems] = useState([]);
  const [loading, setLoading] = useState();
  const { isUser, setUser } = useAppContext();
  const [selectedItem, setSelecteditem] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

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
        `/item/api?page=${page}&pageSize=${pageSize}`
      );
      setitems(result.items);
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
          router.prefetch("/item");
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
              <h5 className="text-2xl font-semibold text-white">Your Items</h5>
              <button
                className="bg-purple-600 hover:bg-black-500 text-white font-semibold px-4 py-2 rounded-lg"
                onClick={() => openEditModal(null)}
              >
                Create New Item
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <Loader />
        ) : items?.length === 0 ? (
          <NoRecord />
        ) : (
          <div>
            {items?.length > 0 &&
              items?.map((item, index) => (
                <ItemCard
                  item={item}
                  key={index}
                  openDeleteModal={openDeleteModal}
                  openEditModal={openEditModal}
                />
              ))}
              <Pagination  page={page} setPage={setPage} totalPages={totalPages}/>
     
          </div>
        )}

        {deleteModalOpen && (
          <DeleteItemModal item={selectedItem} onClose={closeModals} />
        )}
        {editModalOpen && (
          <EditItemModal updatedItem={selectedItem} onClose={closeModals} />
        )}
      </div>
    </>
  );
};

export default Item;
