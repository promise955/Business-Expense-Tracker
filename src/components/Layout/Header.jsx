
import Image from 'next/image'
import React from 'react'

const Header = () => {
  return (
    <header className="flex flex-col items-center justify-center flex-grow">
    <div className="w-2/3 text-center">
      <h1 className="text-white text-4xl font-bold mb-4">
        Your Expense Tracker
      </h1>
      <p className="text-white text-lg mb-8">
        Track your expenses with ease and stay on top of your finances.
      </p>
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

export default Header
