import { currencyFormatter } from "@/utils/functions/utils";
import dayjs from "dayjs";
import React from "react";

const ExpenseCard = ({ expense, openExpenseModal }) => {
  return (
    <div className="bg-gray-800 rounded-lg shadow-md p-1 w-full mb-1">
      <div className="flex  justify-between items-start sm:items-center">
  
        <div className="flex-1 mb-2 sm:mb-0">
          <p className="text-white">
            {dayjs(expense.date).format("DD-MMMM-YYYY")}
          </p>
        </div>
        <div className="flex-1 mb-2 sm:mb-0">
          <p className="text-white">{currencyFormatter(expense.totalamount)}</p>
        </div>
        <div className="space-x-2 flex">
          <button
            className="p-2 px-3 py-1 text-sm rounded-full bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500"
            onClick={() => openExpenseModal(expense)}
          >
            view
          </button>
    
        </div>
      </div>
    </div>
  );
};

export default ExpenseCard;
