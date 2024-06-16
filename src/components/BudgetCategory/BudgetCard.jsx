import { currencyFormatter, dateFormatter } from "@/utils/functions/utils";
import React, { useState } from "react";
import dayjs from "dayjs";

const BudgetCard = ({ budget ,openDeleteModal,openEditModal}) => {
 
  return (
    <div>
      <div className="bg-gray-800 rounded-lg shadow-md p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-blue-300">Budget Name</h2>
            <h2 className="text-lg font-bold text-white">
              {budget.categoryname}
            </h2>
          </div>
          <div className="space-x-2">
            <button
              className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500"
              onClick={() => openEditModal(budget)}
            >
              Edit
            </button>
            <button
              className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 focus:outline-none focus:ring-4 focus:ring-red-500"
              onClick={() => openDeleteModal(budget)}
            >
              Delete
            </button>
          </div>
        </div>
        <div className="flex justify-between">
          <p className="text-lg font-bold text-blue-300">Budget Amount</p>
          <p className="text-lg font-semibold text-white">
            {currencyFormatter(budget.budgetamount)}
          </p>
        </div>
        <div className="flex justify-between">
          <p className="text-lg font-bold text-blue-300">Income Amount</p>
          <p className="text-lg font-semibold text-white">
            {currencyFormatter(budget.totalincome)}
          </p>
        </div> 
        <div className="flex justify-between">
          <p className="text-lg font-bold text-blue-300">Expense Amount</p>
          <p className="text-lg font-semibold text-white">
            {currencyFormatter(budget.totalexpense)}
          </p>
        </div>
        <div className="flex justify-between">
          <p className="text-lg font-bold text-blue-300">Profit Amount</p>
          <p className="text-lg font-semibold text-white">
            {currencyFormatter(budget.totalincome - budget.totalexpense)}
          </p>
        </div>
        <div className="flex justify-between">
          <p className="text-lg font-bold text-blue-300">Month</p>
          <p className="text-lg font-semibold text-white">
            {dayjs(budget.monthyear).format('MMMM YYYY')}
          </p>
        </div>

      </div>

 
    </div>
  );
};

export default BudgetCard;
