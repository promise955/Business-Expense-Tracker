'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import Cookies from "js-cookie";

const AppContext = createContext(null)

export const AppWrapper = ({ children }) => {
    const [currentUser, setUser] = useState({
        email: null,
        companyname: null,
        roles: null
    })

    // const now = new Date();
    // const expirationTime = new Date(now.getTime() + 30 * 60 * 1000); // expires in 30 minutes

    useEffect(() => {
        const { companyname, email, roles } = Cookies.get('user-details') ? JSON.parse(Cookies.get('user-details')) : {}
        setUser({ companyname, email, roles });
    }, []);


    return (
        <AppContext.Provider value={{ currentUser, setUser }}>
            {children}
        </AppContext.Provider>
    )
}

export const useAppContext = () => {
    return useContext(AppContext)
}