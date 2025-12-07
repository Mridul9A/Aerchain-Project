import React from "react";

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">AI RFP Manager</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 shadow rounded">
          <h3 className="font-medium">Create RFP</h3>
          <p className="text-gray-600 text-sm">Generate an RFP using AI.</p>
        </div>

        <div className="bg-white p-4 shadow rounded">
          <h3 className="font-medium">Vendors</h3>
          <p className="text-gray-600 text-sm">Manage vendor database.</p>
        </div>

        <div className="bg-white p-4 shadow rounded">
          <h3 className="font-medium">Proposals</h3>
          <p className="text-gray-600 text-sm">
            Compare vendor proposals intelligently.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
