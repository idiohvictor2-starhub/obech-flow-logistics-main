import React from "react";
import { Link } from "react-router-dom";
import { Plane, Ship, Truck, FileCheck, MapPin, PackageCheck, Warehouse, Briefcase, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { usePhotoUrl } from "@/utils/photoStorage";

export default function Services() {
  const bikeImg = usePhotoUrl("service_bike");
  const vanImg = usePhotoUrl("service_van");
  const truckImg = usePhotoUrl("service_truck");
  const businessImg = usePhotoUrl("service_business");

  const services = [
    {
      icon: Truck,
      title: "Bike Dispatch",
      desc: "Fast pickup and delivery for documents, small parcels, food items, fashion orders, and lightweight goods.",
      features: ["Same-day pickup", "Fast city delivery", "Small parcels", "Documents & light goods"],
      image: bikeImg,
    },
    {
      icon: PackageCheck,
      title: "Van Delivery",
      desc: "Reliable delivery for medium-sized goods, cartons, fragile items, office supplies, and business packages.",
      features: ["Medium goods", "Fragile handling", "Carton delivery", "Business supplies"],
      image: vanImg,
    },
    {
      icon: Truck,
      title: "Truck Logistics",
      desc: "Truck pickup and delivery for bulk goods, furniture, appliances, equipment, and heavy commercial items.",
      features: ["Bulk movement", "Furniture delivery", "Equipment transport", "Heavy goods"],
      image: truckImg,
    },
    {
      icon: MapPin,
      title: "Pickup & Delivery Booking",
      desc: "Customers can book pickups for goods even when they do not know the exact weight. Our team reviews and recommends the best vehicle.",
      features: ["Easy booking", "Bike, van or truck", "Weight optional", "Customer support"],
      image: null,
    },
    {
      icon: FileCheck,
      title: "Delivery Tracking",
      desc: "Track deliveries from booking confirmation to pickup, transit, arrival, and final delivery.",
      features: ["Tracking number", "Status updates", "Delivery timeline", "Admin updates"],
      image: null,
    },
    {
      icon: Warehouse,
      title: "Business Logistics Support",
      desc: "Logistics support for vendors, online sellers, SMEs, offices, stores, and corporate clients.",
      features: ["Vendor delivery", "SME logistics", "Regular pickups", "Business accounts"],
      image: businessImg,
    },
  ];

  return (
    <>
      {/* Hero */}
      <section className="bg-navy pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-orange">
            Our Services
          </span>
          <h1 className="text-4xl lg:text-5xl font-heading font-black text-white mt-3">
            Logistics Solutions
          </h1>
          <p className="text-white/60 max-w-xl mt-4 leading-relaxed">
            Comprehensive, technology-driven logistics services engineered for African businesses competing on the global stage.
          </p>
        </div>
      </section>

      {/* Services */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 space-y-8">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className={`group grid ${service.image ? "lg:grid-cols-2" : "lg:grid-cols-1"} gap-0 bg-white border border-steel rounded-2xl overflow-hidden hover:border-orange/30 transition-all`}
            >
              {service.image && (
                <div className="relative h-64 lg:h-auto overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-navy/20" />
                </div>
              )}
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-navy flex items-center justify-center">
                    <service.icon size={22} className="text-orange" />
                  </div>
                  <h3 className="text-xl font-heading font-bold text-navy">{service.title}</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">{service.desc}</p>
                <ul className="grid grid-cols-2 gap-2 mt-6">
                  {service.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-navy">
                      <div className="w-1.5 h-1.5 bg-orange rounded-full shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/booking"
                  className="inline-flex items-center gap-2 mt-8 text-orange text-sm font-semibold uppercase tracking-wider hover:translate-x-1 transition-transform"
                >
                  Book Now <ArrowRight size={14} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}