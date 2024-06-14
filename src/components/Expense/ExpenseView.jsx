import { currencyFormatter } from "@/utils/functions/utils";
import React from "react";

const ExpenseView = ({ expense, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex  text-gray-800 justify-center items-center">
      <div className="bg-white rounded-lg shadow-md w-screen h-screen p-4 md:p-8">
        <h2 className="text-lg font-semibold mb-4">View Expense</h2>

        <div className="flex justify-between items-center">
            <div className="flex-1">
              <p className="text-grey pl-2  truncate">Item Name</p>
            </div>
            {/* <div className="flex-1">
              <p className="text-grey pl-2  truncate">Item Group</p>
            </div> */}
            <div className="flex-1">
              <p className="text-grey ">Price</p>
            </div>
            <div className="flex-1">
              <p className="text-grey">Quantity</p>
            </div>
            <div className="flex-1">
              <p className="text-grey">Total</p>
            </div>
          </div>
       
       {
        expense?.Expense.map((item) => (
          <>
          <div className="bg-gray-800 rounded-lg shadow-md p-1 w-full mb-1">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <p className="text-white pl-2  truncate">{item.expensename}</p>
            </div>
            {/* <div className="flex-1">
              <p className="text-white pl-2  truncate">{''}</p>
            </div> */}
            <div className="flex-1">
              <p className="text-white ">{currencyFormatter(item.amount)}</p>
            </div>
            <div className="flex-1">
              <p className="text-white ">{item.quantity}</p>
            </div>
            <div className="flex-1">
              <p className="text-white ">{currencyFormatter(item.total)}</p>
            </div>
          </div>
        </div>
        </>

        ))
       }
    
        <button
          type="button"
          onClick={onClose}
          className="mr-2 px-4 py-2 text-sm rounded-md bg-gray-300 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ExpenseView;
