import React, { createContext, useContext, useEffect, useState } from "react";

// 1. Create the context
const UserContext = createContext(undefined);

// 2. Provider Component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const updateUser = (newUserData) => {
    setUser(newUserData);
    if (newUserData) {
      localStorage.setItem("userData", JSON.stringify(newUserData));
    } else {
      localStorage.removeItem("userData");
    }
  };

  return (
    <UserContext.Provider value={{ user, updateUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};

// 3. Custom Hook
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
