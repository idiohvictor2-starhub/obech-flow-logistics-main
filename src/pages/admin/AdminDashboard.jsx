import React from "react";
import { ClipboardList, PackageCheck, Truck, Users } from "lucide-react";

const stats = [
  { label: "Total Bookings", value: "24", icon: ClipboardList },
  { label: "Pending Pickups", value: "8", icon: Truck },
  { label: "In Transit", value: "11", icon: PackageCheck },
  { label: "Customers", value: "18", icon: Users },
];

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-heading font-black text-navy">
        Dashboard
      </h1>
      <p className="text-muted-foreground mt-1">
        Overview of bookings, deliveries, customers and operations.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mt-8">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="bg-white rounded-2xl border border-steel p-6"
            >
              <Icon className="text-orange" size={26} />
              <p className="text-3xl font-heading font-black text-navy mt-4">
                {item.value}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {item.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}