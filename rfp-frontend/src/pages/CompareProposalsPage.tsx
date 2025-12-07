// src/pages/CompareProposalsPage.tsx
import React, { useEffect, useState } from "react";

interface Props {
  rfpId: number;
}

const CompareProposalsPage: React.FC<Props> = ({ rfpId }) => {
  const [data, setData] = useState<any>(null);

  async function load() {
    const res = await fetch(
      `http://localhost:4000/api/rfps/${rfpId}/compare`
    );
    const json = await res.json();
    setData(json);
  }

  useEffect(() => {
    load();
  }, [rfpId]);

  if (!data)
    return (
      <p className="p-4 text-sm text-gray-500">
        Loading proposals and AI comparison…
      </p>
    );

  const { rfp, proposals, bestVendorId, aiRanked, aiRecommendation } = data;

  return (
    <div className="max-w-5xl mx-auto py-10 space-y-6">
      <h1 className="text-xl font-semibold">
        Compare Proposals for: {rfp.title}
      </h1>

      <div className="bg-white rounded shadow-sm border p-4">
        <h2 className="font-medium mb-2">Vendor Proposals</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-gray-500">
              <th className="text-left px-3 py-2">Vendor</th>
              <th className="text-left px-3 py-2">Total Price</th>
              <th className="text-left px-3 py-2">Delivery (days)</th>
              <th className="text-left px-3 py-2">Warranty (years)</th>
              <th className="text-left px-3 py-2">Payment Terms</th>
              <th className="text-left px-3 py-2">Objective Score</th>
            </tr>
          </thead>
          <tbody>
            {proposals.map((p: any) => {
              const isBest = p.vendorId === bestVendorId;
              return (
                <tr
                  key={p.id}
                  className={`border-b last:border-0 ${
                    isBest ? "bg-green-50" : ""
                  }`}
                >
                  <td className="px-3 py-2">{p.vendor.name}</td>
                  <td className="px-3 py-2">
                    {p.totalPrice ?? "—"} {p.currency ?? ""}
                  </td>
                  <td className="px-3 py-2">{p.deliveryDays ?? "—"}</td>
                  <td className="px-3 py-2">{p.warrantyYears ?? "—"}</td>
                  <td className="px-3 py-2">{p.paymentTerms ?? "—"}</td>
                  <td className="px-3 py-2">{p.objectiveScore.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {aiRecommendation && (
        <div className="bg-green-50 border border-green-200 rounded p-4 text-sm">
          <div className="font-semibold mb-1">AI Recommendation</div>
          <p className="text-gray-800 whitespace-pre-wrap">
            {aiRecommendation}
          </p>
        </div>
      )}

      {aiRanked && (
        <div className="bg-white border rounded p-4 text-sm">
          <div className="font-semibold mb-2">AI Ranking</div>
          <ol className="list-decimal pl-5 space-y-1">
            {aiRanked.map((r: any, idx: number) => (
              <li key={idx}>
                Vendor #{r.vendorId} – Score {r.score} – {r.reason}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};

export default CompareProposalsPage;
