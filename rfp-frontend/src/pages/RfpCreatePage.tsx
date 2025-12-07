import React, { useState } from "react";
import { generateRfp } from "../api/rfpApi";
import type { Rfp } from "../api/rfpApi";

const RfpCreatePage: React.FC = () => {
  const [description, setDescription] = useState(
    "Need 20 laptops with 16GB RAM and 15 monitors 27-inch, budget 50000, delivery 30 days, net 30, 1 year warranty."
  );
  const [loading, setLoading] = useState(false);
  const [rfp, setRfp] = useState<Rfp | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    try {
      setError(null);
      setLoading(true);
      setRfp(null);
      const res = await generateRfp(description);
      setRfp(res.rfp);
    } catch (err: any) {
      console.error(err);
      setError("Failed to generate RFP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Create RFP from Description</h2>
      <p className="text-sm text-gray-600">
        Paste a natural language description of what you want to procure. The backend will convert it
        into a structured RFP and store it in the database.
      </p>

      <textarea
        className="w-full min-h-[140px] border rounded px-3 py-2 text-sm"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <button
        className="px-4 py-2 bg-blue-600 text-white text-sm rounded disabled:opacity-60"
        onClick={handleGenerate}
        disabled={loading || !description.trim()}
      >
        {loading ? "Generating..." : "Generate RFP"}
      </button>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {rfp && (
        <div className="mt-4 border rounded p-4 bg-white">
          <h3 className="font-semibold text-lg mb-2">{rfp.title}</h3>
          <p className="text-sm text-gray-600 mb-1">
            <span className="font-medium">Budget:</span>{" "}
            {rfp.budget != null ? `$${rfp.budget}` : "N/A"}
          </p>
          <p className="text-sm text-gray-600 mb-1">
            <span className="font-medium">Payment Terms:</span>{" "}
            {rfp.paymentTerms || "N/A"}
          </p>
          <p className="text-sm text-gray-600 mb-2">
            <span className="font-medium">Warranty (months):</span>{" "}
            {rfp.warrantyMinMonths ?? "N/A"}
          </p>

          <h4 className="font-semibold text-sm mt-3 mb-1">Items</h4>
          <ul className="text-sm list-disc pl-5 space-y-1">
            {(rfp.items || []).map((item: any, idx: number) => (
              <li key={idx}>
                {item.name} × {item.quantity}{" "}
                {item.specs && (
                  <span className="text-gray-500">
                    ({Object.entries(item.specs)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(", ")}
                    )
                  </span>
                )}
              </li>
            ))}
          </ul>

          <h4 className="font-semibold text-sm mt-4 mb-1">
            Original Description
          </h4>
          <p className="text-xs text-gray-500 whitespace-pre-wrap">
            {rfp.descriptionRaw}
          </p>
        </div>
      )}
    </div>
  );
};

export default RfpCreatePage;
