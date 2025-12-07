// src/pages/RfpListPage.tsx
import React, { useEffect, useState } from "react";
import { listRfps } from "../api/rfpApi";
import type { Rfp } from "../api/rfpApi";

interface Props {
  onSelectRfp: (id: number) => void;
}

const RfpListPage: React.FC<Props> = ({ onSelectRfp }) => {
  const [rfps, setRfps] = useState<Rfp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setError(null);
        setLoading(true);
        const res = await listRfps();
        setRfps(res.rfps);
      } catch (err: any) {
        console.error(err);
        setError("Failed to fetch RFPs");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p>Loading RFPs...</p>;
  if (error) return <p className="text-red-600 text-sm">{error}</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">All RFPs</h2>
      {rfps.length === 0 ? (
        <p className="text-sm text-gray-600">No RFPs yet. Try creating one.</p>
      ) : (
        <table className="w-full text-sm bg-white border rounded overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-3 py-2">ID</th>
              <th className="text-left px-3 py-2">Title</th>
              <th className="text-left px-3 py-2">Budget</th>
              <th className="text-left px-3 py-2">Status</th>
              <th className="text-left px-3 py-2">Created</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {rfps.map((rfp) => (
              <tr key={rfp.id} className="border-t">
                <td className="px-3 py-2">{rfp.id}</td>
                <td className="px-3 py-2">{rfp.title}</td>
                <td className="px-3 py-2">
                  {rfp.budget != null ? `$${rfp.budget}` : "N/A"}
                </td>
                <td className="px-3 py-2">{rfp.status}</td>
                <td className="px-3 py-2">
                  {new Date(rfp.createdAt).toLocaleString()}
                </td>
                <td className="px-3 py-2 text-right">
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => onSelectRfp(rfp.id)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default RfpListPage;
