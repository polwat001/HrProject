import { useState, createContext, useContext, type ReactNode } from "react";
import { companies, type Company } from "@/data/mockData";

interface CompanyContextType {
  selectedCompany: Company;
  setSelectedCompany: (company: Company) => void;
}

const CompanyContext = createContext<CompanyContextType | null>(null);

export const useCompany = () => {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error("useCompany must be used within CompanyProvider");
  return ctx;
};

export const CompanyProvider = ({ children }: { children: ReactNode }) => {
  const [selectedCompany, setSelectedCompany] = useState<Company>(companies[0]);
  return (
    <CompanyContext.Provider value={{ selectedCompany, setSelectedCompany }}>
      {children}
    </CompanyContext.Provider>
  );
};
