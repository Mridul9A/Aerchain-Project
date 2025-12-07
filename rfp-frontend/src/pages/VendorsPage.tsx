import React, { useEffect, useState } from "react";
import { createVendor, listVendors } from "../api/vendorApi";
import type { Vendor } from "../api/vendorApi";

const VendorsPage: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    category: "",
    notes: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadVendors = async () => {
    try {
      setError(null);
      setLoading(true);
      const res = await listVendors();
      setVendors(res.vendors);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load vendors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendors();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      if (!form.name || !form.email) {
        setError("Name and email are required");
        return;
      }
      await createVendor(form);
      setForm({ name: "", email: "", category: "", notes: "" });
      await loadVendors();
    } catch (err: any) {
      console.error(err);
      setError("Failed to create vendor");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Vendors</h2>
        {loading ? (
          <p>Loading vendors...</p>
        ) : vendors.length === 0 ? (
          <p className="text-sm text-gray-600">No vendors yet.</p>
        ) : (
          <ul className="space-y-1 text-sm bg-white border rounded p-3">
            {vendors.map((v) => (
              <li key={v.id}>
                <span className="font-medium">{v.name}</span> — {v.email}
                {v.category && <span className="text-gray-500"> ({v.category})</span>}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border rounded bg-white p-4">
        <h3 className="font-semibold mb-2 text-sm">Add Vendor</h3>
        {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
        <form className="space-y-2" onSubmit={handleSubmit}>
          <input
            className="w-full border rounded px-3 py-1 text-sm"
            placeholder="Name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="w-full border rounded px-3 py-1 text-sm"
            placeholder="Email *"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="w-full border rounded px-3 py-1 text-sm"
            placeholder="Category (optional)"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
          <textarea
            className="w-full border rounded px-3 py-1 text-sm"
            placeholder="Notes (optional)"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
          <button
            type="submit"
            disabled={saving}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Vendor"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VendorsPage;
