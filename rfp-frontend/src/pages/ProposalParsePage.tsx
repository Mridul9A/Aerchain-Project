import React, { useState } from "react";

const ProposalParsePage = ({ rfpId, vendorId }: { rfpId: number; vendorId: number }) => {
  const [emailText, setEmailText] = useState("");
  const [result, setResult] = useState<any>(null);

  async function submit() {
    const res = await fetch("http://localhost:4000/api/proposals/parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vendorId, rfpId, emailText }),
    });

    const data = await res.json();
    setResult(data.proposal);
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Parse Vendor Proposal</h2>

      <textarea
        className="border w-full p-3 rounded h-48"
        placeholder="Paste vendor email reply here..."
        value={emailText}
        onChange={(e) => setEmailText(e.target.value)}
      />

      <button
        onClick={submit}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Parse Proposal
      </button>

      {result && (
        <div className="bg-white shadow p-4 rounded">
          <h3 className="font-semibold mb-2">Extracted Proposal</h3>

          <pre className="bg-gray-100 p-3 rounded text-sm">
            {JSON.stringify(result.parsed, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ProposalParsePage;
