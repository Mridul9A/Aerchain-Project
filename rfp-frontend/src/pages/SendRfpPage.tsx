import { useEffect, useState } from "react";

interface Vendor {
  id: number;
  name: string;
  email: string;
}

const SendRfpPage = ({ rfpId }: { rfpId: number }) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [message, setMessage] = useState("");

  async function loadVendors() {
    const res = await fetch("http://localhost:4000/api/vendors");
    const data = await res.json();
    setVendors(data.vendors || []);
  }

  async function sendRfp() {
    const res = await fetch(`http://localhost:4000/api/rfps/${rfpId}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vendorIds: selected,
        message,
      }),
    });

    const data = await res.json();
    alert(JSON.stringify(data, null, 2));
  }

  useEffect(() => {
    loadVendors();
  }, []);

  function toggleVendor(id: number) {
    if (selected.includes(id)) {
      setSelected(selected.filter((x) => x !== id));
    } else {
      setSelected([...selected, id]);
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Send RFP #{rfpId}</h2>

      <div className="bg-white shadow p-4 rounded">
        <h3 className="font-medium mb-2">Select Vendors</h3>

        {vendors.map((v) => (
          <label
            key={v.id}
            className="flex items-center gap-2 py-2 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selected.includes(v.id)}
              onChange={() => toggleVendor(v.id)}
            />
            <span>{v.name} — {v.email}</span>
          </label>
        ))}
      </div>

      <textarea
        placeholder="Message to vendors (optional)"
        className="border w-full p-3 rounded"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <button
        onClick={sendRfp}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Send RFP
      </button>
    </div>
  );
};

export default SendRfpPage;
