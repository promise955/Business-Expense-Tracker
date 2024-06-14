import React from 'react'

const Pagination = ({page,setPage,totalPages}) => {
  return (
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
  )
}

export default Pagination