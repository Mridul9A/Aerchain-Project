import React, { useEffect, useState } from "react";

interface Vendor {
  id: number;
  name: string;
  email: string;
  category?: string;
  notes?: string;
}

const VendorsPage: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    category: "",
    notes: "",
  });

  async function fetchVendors() {
    const res = await fetch("http://localhost:4000/api/vendors");
    const data = await res.json();
    setVendors(data.vendors || []);
  }

  async function createVendor(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("http://localhost:4000/api/vendors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setForm({ name: "", email: "", category: "", notes: "" });
      fetchVendors();
    }
  }

  useEffect(() => {
    fetchVendors();
  }, []);

  return (
    <div className="max-w-5xl mx-auto py-10 space-y-6">
      <h2 className="text-xl font-semibold">Vendors</h2>

      {/* CREATE VENDOR FORM */}
      <form
        onSubmit={createVendor}
        className="bg-white shadow p-4 rounded space-y-3"
      >
        <h3 className="font-medium">Add Vendor</h3>

        <input
          required
          placeholder="Vendor name"
          className="border p-2 w-full rounded"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          required
          placeholder="Email"
          className="border p-2 w-full rounded"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          placeholder="Category"
          className="border p-2 w-full rounded"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        />

        <textarea
          placeholder="Notes"
          className="border p-2 w-full rounded"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />

        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Create Vendor
        </button>
      </form>

      {/* VENDORS LIST */}
      <div className="bg-white shadow p-4 rounded">
        <h3 className="font-medium mb-3">Vendor List</h3>

        {vendors.length === 0 ? (
          <p className="text-gray-500">No vendors yet.</p>
        ) : (
          <ul className="divide-y">
            {vendors.map((v) => (
              <li key={v.id} className="py-3">
                <div className="font-medium">{v.name}</div>
                <div className="text-sm text-gray-600">{v.email}</div>
                {v.category && (
                  <div className="text-xs text-gray-500">{v.category}</div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default VendorsPage;
