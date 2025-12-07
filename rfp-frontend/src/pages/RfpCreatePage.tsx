// src/pages/RfpCreatePage.tsx
import React, { useState } from "react";

interface Rfp {
  id: number;
  title: string;
  budget: number | null;
  paymentTerms: string | null;
  warrantyMinMonths: number | null;
  items: any[];
}

const RfpCreatePage: React.FC = () => {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [rfp, setRfp] = useState<Rfp | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:4000/api/rfps/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate RFP");
      }
      setRfp(data.rfp);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto py-10 space-y-6">
      <h1 className="text-xl font-semibold">Create RFP from Description</h1>
      <p className="text-gray-600 text-sm">
        Paste a natural language description of what you want to procure.
        The backend will convert it into a structured RFP and store it.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: input */}
        <div className="space-y-3">
          <textarea
            className="w-full border rounded-md p-3 min-h-[220px] text-sm"
            placeholder="Example: We need 20 laptops with 16GB RAM and 15 monitors..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded p-2">
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading || !description.trim()}
            className="inline-flex items-center px-4 py-2 rounded bg-blue-600 text-white text-sm font-medium disabled:opacity-60"
          >
            {loading ? "Generating..." : "Generate RFP"}
          </button>
        </div>

        {/* Right: preview */}
        <div className="bg-white border rounded-lg shadow-sm p-4 min-h-[220px]">
          <h2 className="text-sm font-semibold mb-2">Preview (last generated)</h2>
          {!rfp ? (
            <p className="text-gray-500 text-sm">
              Generate an RFP to see the structured view here.
            </p>
          ) : (
            <div className="space-y-2 text-sm">
              <div>
                <div className="text-xs uppercase text-gray-400">Title</div>
                <div className="font-medium">{rfp.title}</div>
              </div>
              <div className="flex gap-4">
                <div>
                  <div className="text-xs uppercase text-gray-400">Budget</div>
                  <div>{rfp.budget ?? "—"}</div>
                </div>
                <div>
                  <div className="text-xs uppercase text-gray-400">
                    Payment Terms
                  </div>
                  <div>{rfp.paymentTerms ?? "—"}</div>
                </div>
                <div>
                  <div className="text-xs uppercase text-gray-400">
                    Warranty (months)
                  </div>
                  <div>{rfp.warrantyMinMonths ?? "—"}</div>
                </div>
              </div>
              <div>
                <div className="text-xs uppercase text-gray-400 mb-1">
                  Items
                </div>
                <ul className="list-disc pl-4 space-y-1">
                  {rfp.items?.map((item: any, i: number) => (
                    <li key={i}>
                      {item.name} × {item.quantity}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RfpCreatePage;
