import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged listens for the user session from Firebase
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); // Authentication check is finished
    });

    return () => unsubscribe();
  }, []);

  return (
    // We pass both 'user' and 'loading' so App.jsx can make smart routing decisions
    <AuthContext.Provider value={{ user, loading }}>
      {!loading ? children : (
        <div style={loadingContainer}>
          <p>Initializing TaxPal...</p>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// Simple loading style
const loadingContainer = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
  fontFamily: 'Arial, sans-serif'
};