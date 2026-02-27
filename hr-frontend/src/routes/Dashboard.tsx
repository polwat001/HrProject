import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useCompany } from "@/contexts/CompanyContexts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users, FileWarning, Clock, TrendingUp,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";
import { apiGet } from "@/lib/api";

const ATTENDANCE_COLORS = [
  "hsl(145 60% 42%)", "hsl(38 92% 50%)", "hsl(0 72% 55%)", "hsl(205 80% 55%)",
];

const Dashboard = () => {
  const { selectedCompany } = useCompany();
  const router = useRouter();
  const isAll = selectedCompany.id === "all";

  // States
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [otCostData, setOtCostData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // ดึง current user
        try {
          const userData = await apiGet<any>("/users/current");
          setCurrentUser(userData);
        } catch (error) {
          console.error("Failed to fetch current user:", error);
        }
        
        // ดึง employees
        const empData = await apiGet<any[]>("/employees");
        setEmployees(empData || []);

        // ดึง contracts
        const contractData = await apiGet<any[]>("/contracts");
        setContracts(contractData || []);

        // ดึง attendance (mock สำหรับตอนนี้)
        setAttendanceData([
          { name: "Present", value: 150 },
          { name: "Late", value: 25 },
          { name: "Absent", value: 10 },
          { name: "WFH", value: 65 },
        ]);

        // ดึง OT Cost (mock สำหรับตอนนี้)
        setOtCostData([
          { month: "Sep", amount: 85000 },
          { month: "Oct", amount: 92000 },
          { month: "Nov", amount: 78000 },
          { month: "Dec", amount: 110000 },
          { month: "Jan", amount: 98000 },
          { month: "Feb", amount: 105000 },
        ]);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter data by selected company
  const filteredEmployees = isAll
    ? employees
    : employees.filter((e) => e.companyId === selectedCompany.id);

  const filteredContracts = isAll
    ? contracts
    : contracts.filter((c) => {
        const emp = employees.find((e) => e.id === c.employeeId);
        return emp?.companyId === selectedCompany.id;
      });

  // Prepare bar chart data
  const barData = isAll
    ? employees.reduce((acc: any[], emp: any) => {
        const existing = acc.find((item) => item.company === emp.companyId);
        if (existing) {
          existing.count += 1;
        } else {
          acc.push({ company: emp.companyId, count: 1, companyId: emp.companyId });
        }
        return acc;
      }, [])
    : employees
        .filter((e) => e.companyId === selectedCompany.id)
        .reduce((acc: any[], emp: any) => {
          const existing = acc.find((item) => item.department === emp.department);
          if (existing) {
            existing.count += 1;
          } else {
            acc.push({ department: emp.department, count: 1 });
          }
          return acc;
        }, []);

  const totalHeadcount = filteredEmployees.length;

  const statCards = [
    { label: "Total Headcount", value: totalHeadcount, icon: Users, color: "text-primary" },
    { label: "Contract Expiring", value: filteredContracts.length, icon: FileWarning, color: "text-warning" },
    { label: "Attendance Today", value: "92%", icon: Clock, color: "text-success" },
    { label: "OT Cost (Month)", value: "฿198K", icon: TrendingUp, color: "text-accent" },
  ];

  if (loading) {
    return <div className="p-6 text-center">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* User Welcome Header */}
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-grey-900">
          {currentUser ? `Welcome back, ${currentUser.username || currentUser.name || "User"}` : "Welcome to Dashboard"}
        </h1>
        <p className="text-sm text-grey-600 mt-1">
          {selectedCompany.id === "all" ? "All Companies" : selectedCompany.shortName}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="shadow-card hover:shadow-card-hover transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`h-10 w-10 rounded-lg bg-muted flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Headcount Bar Chart */}
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              {isAll ? "Headcount by Company" : `Headcount - ${selectedCompany.shortName}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 90%)" />
                <XAxis
                  dataKey={isAll ? "company" : "department"}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 12 }} tickLine={false} />
                <Tooltip />
                <Bar
                  dataKey="count"
                  fill="hsl(215 70% 45%)"
                  radius={[4, 4, 0, 0]}
                  cursor="pointer"
                  onClick={(data: any) => {
                    if (isAll && data?.companyId) {
                      router.push(`/employees?company=${data.companyId}`);
                    }
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Attendance Pie */}
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Daily Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={attendanceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {attendanceData.map((_, i) => (
                    <Cell key={i} fill={ATTENDANCE_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* OT Cost */}
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">OT Cost Summary (6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={otCostData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 90%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} tickLine={false} tickFormatter={(v) => `฿${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={((v: number) => [`฿${v.toLocaleString()}`, "OT Cost"]) as any} />
                <Line type="monotone" dataKey="amount" stroke="hsl(175 60% 40%)" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Contract Expiring */}
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Contract Expiring Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredContracts.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No expiring contracts</p>
              ) : (
                filteredContracts.map((c) => (
                  <div key={c.employeeId} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="text-sm font-medium">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.company}</p>
                    </div>
                    <Badge variant={c.daysLeft <= 7 ? "destructive" : "secondary"} className="text-xs">
                      {c.daysLeft} days left
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
