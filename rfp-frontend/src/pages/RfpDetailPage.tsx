import React, { useEffect, useState } from "react";

interface Rfp {
  id: number;
  title: string;
  budget: number | null;
  paymentTerms: string | null;
  warrantyMinMonths: number | null;
  items: any[];
  descriptionRaw: string;
}

interface Props {
  rfpId: number;
  onSend: (rfpId: number) => void;
  onCompare: (rfpId: number) => void;
}

const RfpDetailPage: React.FC<Props> = ({ rfpId, onSend, onCompare }) => {
  const [rfp, setRfp] = useState<Rfp | null>(null);

  async function loadRfp() {
    const res = await fetch(`http://localhost:4000/api/rfps/${rfpId}`);
    const data = await res.json();
    setRfp(data.rfp);
  }

  useEffect(() => {
    loadRfp();
  }, [rfpId]);

  if (!rfp) return <p className="p-4 text-sm text-gray-500">Loading RFP...</p>;

  return (
    <div className="max-w-5xl mx-auto py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{rfp.title}</h1>
        <div className="space-x-2">
          <button
            onClick={() => onSend(rfp.id)}
            className="px-3 py-1.5 text-sm rounded bg-blue-600 text-white"
          >
            Send to Vendors
          </button>
          <button
            onClick={() => onCompare(rfp.id)}
            className="px-3 py-1.5 text-sm rounded border border-gray-300"
          >
            Compare Proposals
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded shadow-sm p-4">
          <div className="text-xs text-gray-400 uppercase mb-1">Budget</div>
          <div>{rfp.budget ?? "—"}</div>
        </div>
        <div className="bg-white rounded shadow-sm p-4">
          <div className="text-xs text-gray-400 uppercase mb-1">
            Payment Terms
          </div>
          <div>{rfp.paymentTerms ?? "—"}</div>
        </div>
        <div className="bg-white rounded shadow-sm p-4">
          <div className="text-xs text-gray-400 uppercase mb-1">
            Warranty (months)
          </div>
          <div>{rfp.warrantyMinMonths ?? "—"}</div>
        </div>
      </div>

      <div className="bg-white rounded shadow-sm p-4">
        <h2 className="font-medium mb-2">Items</h2>
        <ul className="list-disc pl-4 text-sm space-y-1">
          {rfp.items?.map((item: any, i: number) => (
            <li key={i}>
              <span className="font-medium">{item.name}</span> ×{" "}
              {item.quantity}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white rounded shadow-sm p-4">
        <h2 className="font-medium mb-2">Original Description</h2>
        <p className="text-sm text-gray-700 whitespace-pre-wrap">
          {rfp.descriptionRaw}
        </p>
      </div>
    </div>
  );
};

export default RfpDetailPage;
