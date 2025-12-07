import { useState } from "react";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import VendorsPage from "./pages/VendorsPage";
import CreateRfpPage from "./pages/RfpCreatePage";
import SendRfpPage from "./pages/SendRfpPage";

function App() {
  const [page, setPage] = useState("dashboard");
  const [selectedRfpId, setSelectedRfpId] = useState<number | null>(null);

  function renderPage() {
    if (page === "dashboard") return <Dashboard />;
    if (page === "vendors") return <VendorsPage />;
    if (page === "create") return <CreateRfpPage />;
    if (page === "send" && selectedRfpId)
      return <SendRfpPage rfpId={selectedRfpId} />;

    return <Dashboard />;
  }

  return (
    <Layout current={page} onNavigate={setPage}>
      {renderPage()}
    </Layout>
  );
}

export default App;
