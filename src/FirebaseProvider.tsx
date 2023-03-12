import React, { useEffect } from "react";
import { FirebaseApp, initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

import { createContext,  useContext, useState } from "react";

const firebaseConfig = {
  apiKey: "AIzaSyD4Vi4GOuHCFIpAqaYOsUh0NGfYAvESgaQ",
  authDomain: "terpmap-fc83a.firebaseapp.com",
  projectId: "terpmap-fc83a",
  storageBucket: "terpmap-fc83a.appspot.com",
  messagingSenderId: "562048803342",
  appId: "1:562048803342:web:1014d2ffec7e4a5bce125f",
  measurementId: "G-5JXQ1BG8RZ",
};

type FirebaseProviderProps = {
    children?: React.ReactNode
}

type FirebaseProviderContext = {
    app: FirebaseApp
}

export function useFirebase(): FirebaseProviderContext {
    let context = useContext(FirebaseContext)
    if (!context)
        throw new Error("Firebase is not initialized!");

    return context;
}

const FirebaseContext = createContext<FirebaseProviderContext | undefined>(undefined);
export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({children}) => {
    const [ context, setContext ] = useState<FirebaseProviderContext | undefined>(undefined);

    useEffect(() => {
        // Initialize Firebase
        try {
            const app = initializeApp(firebaseConfig);
            const analytics = getAnalytics(app);
            setContext({ app })
        } catch {
            console.error("Could not load")
        }
    }, []);

    return (
        <FirebaseContext.Provider value={context}>
            { context ? children : null }
        </FirebaseContext.Provider>
    );
}