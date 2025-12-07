import React, { useEffect, useState } from "react";

const CompareProposalsPage = ({ rfpId }: { rfpId: number }) => {
  const [result, setResult] = useState<any>(null);

  async function loadData() {
    const res = await fetch(`http://localhost:4000/api/rfps/${rfpId}/compare`);
    const data = await res.json();
    setResult(data);
  }

  useEffect(() => {
    loadData();
  }, []);

  if (!result) return <p>Loading comparison...</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Comparison for RFP #{rfpId}</h2>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold">Vendor Scores</h3>

        <ul className="divide-y mt-2">
          {result.ranked.map((r: any, i: number) => (
            <li key={i} className="py-3">
              <div className="font-medium">
                {r.vendor} — Score: {r.score}
              </div>
              <div className="text-sm text-gray-600">{r.reason}</div>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-green-50 p-4 rounded border border-green-300">
        <h3 className="font-semibold mb-2">AI Recommendation</h3>
        <p className="text-gray-700">{result.recommendation}</p>
      </div>
    </div>
  );
};

export default CompareProposalsPage;
