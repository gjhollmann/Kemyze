import React from 'react'
import { createContext, useContext, useState, ReactNode } from 'react'

// Define types for active user and context for application use.
type ActiveUser = {
    userID: number;
    accessLevel: number;
}; // type ActiveUser

type TypeUserContext = {
    activeUser: ActiveUser | null;
    setActiveUser: React.Dispatch<React.SetStateAction<ActiveUser | null>>;
}; // type UserContext

// Create context object from context type defined above. 
const UserContext = createContext<TypeUserContext | undefined>(undefined);

type UserProviderProps = {
    children: ReactNode
}; // type UserProviderProps

//
export function UserProvider({ children }: UserProviderProps) {
    const[activeUser, setActiveUser] = useState<ActiveUser | null>(null);

    return (
        <UserContext.Provider value={{ activeUser, setActiveUser }}>
            {children}
        </UserContext.Provider>
    );
} // export function UserProvider

// Attempt particular user.
export const useUser = () => {
    const context = useContext(UserContext);

    if (context == undefined) {
        throw new Error("Fn: useUser must be invoked within UserProvider.");
    }
    return useContext(UserContext);
}; // export const useUser







