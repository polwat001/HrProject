import dynamic from "next/dynamic";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const App = dynamic(() => import("@/App"), { ssr: false });

export default function HomePage() {
  return (
    <ProtectedRoute>
      <App />
    </ProtectedRoute>
  );
}
