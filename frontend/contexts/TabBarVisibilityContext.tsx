import React, { createContext, useContext, useState } from "react";

interface TabBarVisibilityContextType {
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
}

const TabBarVisibilityContext = createContext<TabBarVisibilityContextType>({
  isVisible: true,
  setIsVisible: () => {},
});

export const useTabBarVisibility = () => {
  const context = useContext(TabBarVisibilityContext);
  if (!context) {
    throw new Error("useTabBarVisibility must be used within TabBarVisibilityProvider");
  }
  return context;
};

export function TabBarVisibilityProvider({ children }: { children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <TabBarVisibilityContext.Provider value={{ isVisible, setIsVisible }}>
      {children}
    </TabBarVisibilityContext.Provider>
  );
}