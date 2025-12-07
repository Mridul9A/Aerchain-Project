import { useState } from "react";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import RfpCreatePage from "./pages/RfpCreatePage";
import RfpListPage from "./pages/RfpListPage";
import RfpDetailPage from "./pages/RfpDetailPage";
import VendorsPage from "./pages/VendorsPage";
import ProposalParsePage from "./pages/ProposalParsePage";
import CompareProposalsPage from "./pages/CompareProposalsPage";

function App() {
  const [page, setPage] = useState<{
    name: string;
    rfpId?: number;
  }>({ name: "dashboard" });

  function renderPage() {
    switch (page.name) {
      case "dashboard":
        return <Dashboard onNavigate={(name) => setPage({ name })} />;
      case "create-rfp":
        return <RfpCreatePage />;
      case "rfps":
        return (
          <RfpListPage
            onOpenDetail={(id) => setPage({ name: "rfp-detail", rfpId: id })}
            onCompare={(id) => setPage({ name: "compare", rfpId: id })}
          />
        );
      case "rfp-detail":
        return (
          <RfpDetailPage
            rfpId={page.rfpId!}
            onSend={(id) => setPage({ name: "send", rfpId: id })}
            onCompare={(id) => setPage({ name: "compare", rfpId: id })}
          />
        );
      case "vendors":
        return <VendorsPage />;
      case "parse-proposal":
        return <ProposalParsePage />;
      case "compare":
        return <CompareProposalsPage rfpId={page.rfpId!} />;
      default:
        return <Dashboard onNavigate={(name) => setPage({ name })} />;
    }
  }

  return (
    <Layout current={page.name} onNavigate={(name) => setPage({ name })}>
      {renderPage()}
    </Layout>
  );
}

export default App;
