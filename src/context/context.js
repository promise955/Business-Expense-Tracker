'use client'
import { createContext, useContext, useState } from 'react'

const AppContext = createContext(null)

export const AppWrapper =  ({ children }) => {
    const [isUser, setUser] = useState(null)
    return (
        <AppContext.Provider value={{ isUser, setUser }}>
            {children}
        </AppContext.Provider>
    )
}

export const useAppContext = () => {
    return useContext(AppContext)
}