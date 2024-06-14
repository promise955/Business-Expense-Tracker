import React from 'react'
import Image from "next/image";

const NoRecord = () => {
  return (
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
  )
}

export default NoRecord