import { currencyFormatter } from "@/utils/functions/utils";
import React, { useState } from "react";

const ItemCard = ({ item, openDeleteModal, openEditModal }) => {
  return (
    <div>
      <div className="bg-gray-800 rounded-lg shadow-md p-1 w-full mb-1">
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <p className="text-white pl-2  truncate">{item.itemname}</p>
          </div>
          <div className="flex-1">
            <p className="text-white ">{item.itemGroup.itemgroupname}</p>
          </div>
          <div className="flex-1">
            <p className="text-white ">{currencyFormatter(item.price)}</p>
          </div>
          <div className="space-x-2">
            <button
              className="p-2 px-3 py-1 text-sm rounded-full bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500"
              onClick={() => openEditModal(item)}
            >
              Edit
            </button>
            <button
              className="px-3 py-1 text-sm rounded-full bg-red-500 text-white hover:bg-red-600 focus:outline-none focus:ring-4 focus:ring-red-500"
              onClick={() => openDeleteModal(item)}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
