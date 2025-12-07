import { useEffect, useState } from "react";
import SendRfpPage from "./SendRfpPage";

interface Rfp {
  id: number;
  title: string;
  budget: number | null;
  paymentTerms: string | null;
  warrantyMinMonths: number | null;
  items: any[];
  descriptionRaw: string;
}

const RfpDetailPage = ({
  rfpId,
  onSend,
}: {
  rfpId: number;
  onSend: (id: number) => void;
}) => {
  const [rfp, setRfp] = useState<Rfp | null>(null);

  async function loadRfp() {
    const res = await fetch(`http://localhost:4000/api/rfps/${rfpId}`);
    const data = await res.json();
    setRfp(data.rfp);
  }

  useEffect(() => {
    loadRfp();
  }, [rfpId]);

  if (!rfp) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">{rfp.title}</h2>

      <div className="bg-white p-4 rounded shadow space-y-3">
        <div><strong>Budget:</strong> {rfp.budget ?? "N/A"}</div>
        <div><strong>Payment Terms:</strong> {rfp.paymentTerms ?? "N/A"}</div>
        <div><strong>Warranty:</strong> {rfp.warrantyMinMonths ?? "N/A"} months</div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Items</h3>
        <ul className="list-disc pl-6">
          {rfp.items.map((item, i) => (
            <li key={i}>
              <strong>{item.name}</strong> — {item.quantity}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Raw Description</h3>
        <p className="text-gray-700 whitespace-pre-wrap">{rfp.descriptionRaw}</p>
      </div>

      <button
        onClick={() => onSend(rfp.id)}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Send RFP to Vendors
      </button>
    </div>
  );
};

export default RfpDetailPage;
