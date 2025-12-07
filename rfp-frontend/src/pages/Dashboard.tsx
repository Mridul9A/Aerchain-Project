import React from "react";

interface DashboardProps {
  onNavigate: (page: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const cards = [
    {
      title: "Create RFP",
      description: "Turn a natural language need into a structured RFP using AI.",
      page: "create-rfp",
    },
    {
      title: "Vendors",
      description: "Manage your vendor master data (name, email, category).",
      page: "vendors",
    },
    {
      title: "Parse Proposals",
      description: "Paste vendor email replies and let AI extract key terms.",
      page: "parse-proposal",
    },
    {
      title: "Compare Proposals",
      description: "See vendors side-by-side and get an AI recommendation.",
      page: "compare",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">AI RFP Manager</h1>
        <p className="text-gray-600 mt-1">
          End-to-end workflow: create RFPs, send to vendors, parse responses,
          and compare proposals with AI assistance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((card) => (
          <button
            key={card.title}
            onClick={() => onNavigate(card.page)}
            className="text-left bg-white rounded-lg shadow-sm border hover:shadow-md transition p-4"
          >
            <h2 className="font-medium mb-1">{card.title}</h2>
            <p className="text-sm text-gray-600">{card.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
