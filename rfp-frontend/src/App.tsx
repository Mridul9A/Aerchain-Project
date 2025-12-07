import React, { useState } from "react";
import Layout from "./components/Layout";
import RfpCreatePage from "./pages/RfpCreatePage";
import RfpListPage from "./pages/RfpListPage";
import VendorsPage from "./pages/VendorsPage";

type Page = "create" | "rfps" | "vendors";

const App: React.FC = () => {
  const [page, setPage] = useState<Page>("create");

  return (
    <Layout current={page} onNavigate={(p) => setPage(p as Page)}>
      {page === "create" && <RfpCreatePage />}
      {page === "rfps" && (
        <RfpListPage
          onSelectRfp={(id) => {
            // For Day 2, you can just log it.
            // On Day 3, you can navigate to a detail view.
            console.log("RFP selected:", id);
          }}
        />
      )}
      {page === "vendors" && <VendorsPage />}
    </Layout>
  );
};

export default App;
