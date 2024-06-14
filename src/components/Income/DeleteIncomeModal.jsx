import DataService from '@/lib/fetch';
import React, { useState } from 'react'
import { toast } from "sonner";
const DeleteIncomeModal = ({income,onClose}) => {


    const [isSubmitting, setSubmitting] = useState(false);

    const handleDelete = async (income) => {
      try {
        setSubmitting(true);
        const response = await DataService.deleteDataNoAuth(
          `/income/api?id=${income.id}`
        );
  
        toast.success(response);
        setSubmitting(false);
        onClose();
      } catch (error) {
        toast.error(error);
        setSubmitting(false);
  
        onClose();
      }
    };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
    <div className="bg-white rounded-lg shadow-md p-8">
      <h2 className="text-lg font-semibold mb-4">Delete Income </h2>
      <p className="text-sm text-gray-700 mb-4">
        Are you sure you want to delete these Income <b> {income.incomename} </b> ?
      </p>
      <div className="flex justify-end">
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="mr-2 px-4 py-2 text-sm rounded-md bg-gray-300 text-gray-700 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Cancel
        </button>
        <button
          onClick={() => handleDelete(income)}
          className="px-4 py-2 text-sm rounded-md bg-red-500 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Deleting ..." : "Delete"}
        </button>
      </div>
    </div>
  </div>
  )
}

export default DeleteIncomeModal