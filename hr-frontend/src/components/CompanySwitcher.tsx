import { useCompany } from "@/contexts/CompanyContexts";
import { companies } from "@/data/mockData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2 } from "lucide-react";

const CompanySwitcher = () => {
  const { selectedCompany, setSelectedCompany } = useCompany();

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
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent>
        {companies.map((c) => (
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