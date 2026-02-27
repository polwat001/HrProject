"use client";

import { useEffect, useState } from "react";
import { useCompany } from "@/contexts/CompanyContexts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2 } from "lucide-react";

// สร้าง Interface ให้ตรงกับที่ API ส่งออกมา
interface Company {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  color: string;
}

const CompanySwitcher = () => {
  const { selectedCompany, setSelectedCompany } = useCompany();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        // อย่าลืมใส่ Token เพราะ API ของเราต้องการการตรวจสอบสิทธิ์
        const token = localStorage.getItem("token"); 
        const response = await fetch("http://localhost:5000/api/companies", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (response.status === 401) {
          console.error("Token หมดอายุ กรุณา Login ใหม่");
          return;
        }

        const data = await response.json();
        setCompanies(data);

        // ถ้ายังไม่ได้เลือกบริษัท ให้เลือกบริษัทแรกเป็นค่าเริ่มต้น
        if (data.length > 0 && !selectedCompany.id) {
          setSelectedCompany(data[0]);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies();
  }, [setSelectedCompany, selectedCompany.id]);

  if (isLoading) return <div className="w-[220px] h-10 bg-muted animate-pulse rounded-md" />;

  return (
    <Select
      value={selectedCompany.id}
      onValueChange={(val) => {
        const c = companies.find((c) => c.id === val);
        if (c) setSelectedCompany(c);
      }}
    >
      <SelectTrigger className="w-[220px] bg-card border-border">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-primary" />
          <SelectValue placeholder="เลือกบริษัท" />
        </div>
      </SelectTrigger>
  <SelectContent>
  {/* เพิ่มการเช็ค Array.isArray เพื่อความปลอดภัย 100% */}
   {Array.isArray(companies) && companies.map((c) => (
      <SelectItem key={c.id} value={c.id}>
      <span className="flex items-center gap-2">
        <span>{c.logo}</span>
        <span>{c.name}</span>
      </span>
    </SelectItem>
  ))}
</SelectContent>
    </Select>
  );
};

export default CompanySwitcher;