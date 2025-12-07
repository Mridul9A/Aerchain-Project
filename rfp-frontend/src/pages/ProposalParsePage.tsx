import React, { useEffect, useState } from "react";

interface Rfp { id: number; title: string; }
interface Vendor { id: number; name: string; }

const ProposalParsePage: React.FC = () => {
  const [rfps, setRfps] = useState<Rfp[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [rfpId, setRfpId] = useState<number | null>(null);
  const [vendorId, setVendorId] = useState<number | null>(null);
  const [emailText, setEmailText] = useState("");
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const r1 = await fetch("http://localhost:4000/api/rfps");
      const d1 = await r1.json();
      setRfps(d1.rfps || []);
      const r2 = await fetch("http://localhost:4000/api/vendors");
      const d2 = await r2.json();
      setVendors(d2.vendors || []);
    })();
  }, []);

  async function handleParse() {
    if (!rfpId || !vendorId || !emailText.trim()) return;
    const res = await fetch("http://localhost:4000/api/proposals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rfpId, vendorId, rawText: emailText }),
    });
    const data = await res.json();
    setResult(data.proposal);
  }

  return (
    <div className="max-w-5xl mx-auto py-10 space-y-6">
      <h1 className="text-xl font-semibold">Parse Vendor Proposal</h1>
      <p className="text-gray-600 text-sm">
        Select the RFP and vendor, then paste the email response. The backend
        uses AI to extract price, delivery, warranty, and payment terms.
      </p>

      <div className="grid md:grid-cols-3 gap-4">
        <select
          className="border rounded p-2 text-sm"
          value={rfpId ?? ""}
          onChange={(e) => setRfpId(Number(e.target.value) || null)}
        >
          <option value="">Select RFP</option>
          {rfps.map((r) => (
            <option key={r.id} value={r.id}>
              #{r.id} — {r.title}
            </option>
          ))}
        </select>

        <select
          className="border rounded p-2 text-sm"
          value={vendorId ?? ""}
          onChange={(e) => setVendorId(Number(e.target.value) || null)}
        >
          <option value="">Select Vendor</option>
          {vendors.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
      </div>

      <textarea
        className="w-full border rounded p-3 min-h-[180px] text-sm"
        placeholder="Paste vendor email reply here..."
        value={emailText}
        onChange={(e) => setEmailText(e.target.value)}
      />

      <button
        onClick={handleParse}
        disabled={!rfpId || !vendorId || !emailText.trim()}
        className="px-4 py-2 rounded bg-green-600 text-white text-sm disabled:opacity-60"
      >
        Parse & Save Proposal
      </button>

      {result && (
        <div className="bg-white rounded shadow-sm border p-4 text-sm space-y-2">
          <h2 className="font-medium mb-1">Extracted Proposal</h2>
          <div>
            <span className="font-semibold">Total Price:</span>{" "}
            {result.totalPrice ?? "—"} {result.currency ?? ""}
          </div>
          <div>
            <span className="font-semibold">Delivery (days):</span>{" "}
            {result.deliveryDays ?? "—"}
          </div>
          <div>
            <span className="font-semibold">Warranty (years):</span>{" "}
            {result.warrantyYears ?? "—"}
          </div>
          <div>
            <span className="font-semibold">Payment Terms:</span>{" "}
            {result.paymentTerms ?? "—"}
          </div>
          {result.aiSummary && (
            <div>
              <span className="font-semibold">Summary:</span>{" "}
              {result.aiSummary}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProposalParsePage;
