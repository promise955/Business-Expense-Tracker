import { currencyFormatter } from '@/utils/functions/utils'
import dayjs from 'dayjs'
import React from 'react'

const IncomeCard = ({income, openDeleteModal, openEditModal }) => {
  return (
  
    <div className="bg-gray-800 rounded-lg shadow-md p-1 w-full mb-1">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div className="flex-1  mb-2 sm:mb-0">
          <p className="text-white pl-2  truncate">{income.incomename}</p>
        </div>
        <div className="flex-1 mb-2 sm:mb-0">
          <p className="text-white">{dayjs(income.date).format('MMMM YYYY')}</p>
        </div>
        <div className="flex-1 mb-2 sm:mb-0">
          <p className="text-white">{currencyFormatter(income.amount)}</p>
        </div>
        <div className="space-x-2 flex">
          <button
            className="p-2 px-3 py-1 text-sm rounded-full bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500"
            onClick={() => openEditModal(income)}
          >
            Edit
          </button>
          <button
            className="px-3 py-1 text-sm rounded-full bg-red-500 text-white hover:bg-red-600 focus:outline-none focus:ring-4 focus:ring-red-500"
            onClick={() => openDeleteModal(income)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>

  )
}

export default IncomeCard