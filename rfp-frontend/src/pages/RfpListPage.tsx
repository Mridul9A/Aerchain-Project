// src/pages/RfpListPage.tsx
import React, { useEffect, useState } from "react";

interface Rfp {
  id: number;
  title: string;
  budget: number | null;
  status: string;
  createdAt: string;
}

interface Props {
  onOpenDetail: (id: number) => void;
  onCompare: (id: number) => void;
}

const RfpListPage: React.FC<Props> = ({ onOpenDetail, onCompare }) => {
  const [rfps, setRfps] = useState<Rfp[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadRfps() {
    setLoading(true);
    const res = await fetch("http://localhost:4000/api/rfps");
    const data = await res.json();
    setRfps(data.rfps || []);
    setLoading(false);
  }

  useEffect(() => {
    loadRfps();
  }, []);

  return (
    <div className="max-w-5xl mx-auto py-10 space-y-4">
      <h1 className="text-xl font-semibold">RFPs</h1>

      <div className="bg-white rounded-lg shadow-sm border">
        {loading ? (
          <p className="p-4 text-sm text-gray-500">Loading...</p>
        ) : rfps.length === 0 ? (
          <p className="p-4 text-sm text-gray-500">
            No RFPs yet. Create one using the “New RFP” button.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-gray-500">
                <th className="text-left px-4 py-2">Title</th>
                <th className="text-left px-4 py-2">Budget</th>
                <th className="text-left px-4 py-2">Status</th>
                <th className="text-left px-4 py-2">Created</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {rfps.map((rfp) => (
                <tr key={rfp.id} className="border-b last:border-0">
                  <td className="px-4 py-2">{rfp.title}</td>
                  <td className="px-4 py-2">
                    {rfp.budget != null ? `$${rfp.budget}` : "—"}
                  </td>
                  <td className="px-4 py-2">
                    <span className="inline-flex text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                      {rfp.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {new Date(rfp.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 space-x-2 text-right">
                    <button
                      onClick={() => onOpenDetail(rfp.id)}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </button>
                    <button
                      onClick={() => onCompare(rfp.id)}
                      className="text-gray-700 hover:underline"
                    >
                      Compare
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default RfpListPage;
