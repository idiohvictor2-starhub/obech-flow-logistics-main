import React, { useState } from "react";
import { Users, Search, UserCheck, Mail, Phone, Calendar } from "lucide-react";

const INITIAL_CUSTOMERS = [
  { id: "CUST-001", name: "David Kojo", email: "david@example.com", phone: "+233 24 123 4567", company: "Kojo Exports", bookings: 12, status: "Active" },
  { id: "CUST-002", name: "Amara Nwachukwu", email: "amara@example.com", phone: "+234 80 987 6543", company: "Nwa Retail", bookings: 8, status: "Active" },
  { id: "CUST-003", name: "Kofi Mensah", email: "kofi@example.com", phone: "+233 27 555 1234", company: "Mensah Tech", bookings: 24, status: "Active" },
  { id: "CUST-004", name: "Fatoumata Diallo", email: "fatou@example.com", phone: "+221 77 654 3210", company: "Diallo Fabrics", bookings: 5, status: "Inactive" },
  { id: "CUST-005", name: "Emmanuel Boateng", email: "emmanuel@example.com", phone: "+233 50 111 2222", company: "Boateng Farms", bookings: 19, status: "Active" },
  { id: "CUST-006", name: "Sarah Alao", email: "sarah@example.com", phone: "+234 81 222 3333", company: "Alao Logistics", bookings: 15, status: "Active" }
];

export default function AdminCustomers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [customers] = useState(INITIAL_CUSTOMERS);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-black text-navy">Customers</h1>
        <p className="text-muted-foreground mt-1">
          Manage user accounts, client companies and booking histories.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-steel flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange/10 flex items-center justify-center text-orange shrink-0">
            <Users size={22} />
          </div>
          <div>
            <div className="text-2xl font-heading font-black text-navy">{customers.length}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Clients</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-steel flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-600 shrink-0">
            <UserCheck size={22} />
          </div>
          <div>
            <div className="text-2xl font-heading font-black text-navy">
              {customers.filter((c) => c.status === "Active").length}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Active Accounts</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-steel flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
            <Calendar size={22} />
          </div>
          <div>
            <div className="text-2xl font-heading font-black text-navy">3</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">New this month</div>
          </div>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="bg-white rounded-2xl border border-steel overflow-hidden shadow-sm">
        <div className="p-5 border-b border-steel flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3.5 top-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search customers by name, company or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-steel rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-steel/30 text-navy font-semibold text-xs uppercase tracking-wider border-b border-steel">
                <th className="px-6 py-4">Customer Details</th>
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4 text-center">Total Bookings</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-steel">
              {filtered.length > 0 ? (
                filtered.map((customer) => (
                  <tr key={customer.id} className="hover:bg-steel/10 transition-colors text-sm text-navy">
                    <td className="px-6 py-4">
                      <div className="font-bold">{customer.name}</div>
                      <div className="text-xs text-muted-foreground font-mono mt-0.5">{customer.id}</div>
                    </td>
                    <td className="px-6 py-4 font-medium">{customer.company}</td>
                    <td className="px-6 py-4 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Mail size={12} className="text-orange" />
                        {customer.email}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Phone size={12} className="text-orange" />
                        {customer.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-semibold">{customer.bookings}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                          customer.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-orange hover:text-orange-light font-bold text-xs uppercase tracking-wider">
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-muted-foreground">
                    No customers found matching "{searchTerm}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
