import React from "react";
import { Target, Eye, Compass, Shield, Users, Globe2, Zap, Heart, Award, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const VALUES = [
  { icon: Shield, title: "Reliability", desc: "We deliver on every promise. Our clients trust us because we consistently meet deadlines and exceed expectations." },
  { icon: Globe2, title: "Global Reach", desc: "Established trade corridors connecting Africa to Asia, Europe, the Americas, and beyond with seamless logistics." },
  { icon: Zap, title: "Innovation", desc: "Technology-driven documentation, real-time tracking, and digital-first supply chain management solutions." },
  { icon: Users, title: "Customer Focus", desc: "Dedicated account management with personalized service tailored to each client's unique shipping needs." },
  { icon: Heart, title: "Integrity", desc: "Transparent pricing, honest communication, and ethical business practices in every transaction." },
  { icon: Award, title: "Excellence", desc: "Continuous improvement in service delivery, industry knowledge, and operational efficiency." },
];

const TIMELINE = [
  { year: "2016", title: "Founded", desc: "Obech Global Logistics established in Lagos, Nigeria with a vision to transform African trade logistics." },
  { year: "2018", title: "Asian Trade Corridors", desc: "Expanded operations to cover major Asia-Africa shipping routes including China, India, and Southeast Asia." },
  { year: "2020", title: "Digital Transformation", desc: "Launched real-time tracking, digital documentation, and online quote systems for enhanced customer experience." },
  { year: "2022", title: "DDP Services", desc: "Introduced comprehensive Door-to-Door Delivered Duty Paid logistics for seamless international deliveries." },
  { year: "2024", title: "Continental Expansion", desc: "Extended service coverage across West Africa, East Africa, and established European trade partnerships." },
];

export default function About() {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-orange">
            About Us
          </span>
          <h1 className="text-4xl lg:text-5xl font-heading font-black text-white mt-3">
            Moving Africa Forward
          </h1>
          <p className="text-white/60 max-w-2xl mt-4 leading-relaxed">
            For over 8 years, Obech Global Logistics has been the trusted logistics partner for African businesses trading with the world — delivering precision, transparency, and reliability at every mile.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-navy rounded-2xl p-10 lg:p-14"
            >
              <div className="w-14 h-14 rounded-xl bg-orange/10 flex items-center justify-center mb-6">
                <Target size={28} className="text-orange" />
              </div>
              <h2 className="text-2xl font-heading font-bold text-white">Our Mission</h2>
              <p className="text-white/60 mt-4 leading-relaxed">
                To provide smart, reliable, and technology-driven logistics solutions that empower African businesses to trade seamlessly with the world — delivering every shipment with precision, transparency, and care.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-steel rounded-2xl p-10 lg:p-14"
            >
              <div className="w-14 h-14 rounded-xl bg-orange/10 flex items-center justify-center mb-6">
                <Eye size={28} className="text-orange" />
              </div>
              <h2 className="text-2xl font-heading font-bold text-navy">Our Vision</h2>
              <p className="text-muted-foreground mt-4 leading-relaxed">
                To become Africa's most trusted and innovative global logistics company — setting the standard for freight forwarding, customs clearance, and supply chain solutions across international trade corridors.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-24 bg-steel">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="max-w-3xl mx-auto text-center">
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-orange">
              Our Story
            </span>
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-navy mt-3">
              Built for African Trade
            </h2>
            <p className="text-muted-foreground mt-6 leading-relaxed text-lg">
              Obech Global Logistics was founded with a clear purpose: to bridge the logistics gap that African businesses face when trading internationally. From a single office in Lagos, we've grown into a full-service logistics partner with established trade corridors spanning Asia, Europe, the Americas, and beyond.
            </p>
            <p className="text-muted-foreground mt-4 leading-relaxed text-lg">
              Our deep understanding of African trade dynamics, combined with global logistics expertise, positions us uniquely to serve businesses that need reliable, transparent, and cost-effective shipping solutions. Every container we move, every customs declaration we process, and every delivery we complete reflects our commitment to moving Africa forward.
            </p>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center mb-16">
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-orange">
              Our Journey
            </span>
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-navy mt-3">
              Key Milestones
            </h2>
          </div>

          <div className="max-w-3xl mx-auto">
            {TIMELINE.map((item, i) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex gap-6 relative"
              >
                {/* Line */}
                {i < TIMELINE.length - 1 && (
                  <div className="absolute left-[27px] top-14 w-0.5 h-full bg-steel" />
                )}

                {/* Year dot */}
                <div className="shrink-0 relative z-10">
                  <div className="w-14 h-14 rounded-full bg-navy flex items-center justify-center">
                    <span className="text-orange text-xs font-mono font-bold">{item.year}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="pb-12">
                  <h3 className="font-heading font-bold text-navy text-lg">{item.title}</h3>
                  <p className="text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 bg-steel">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center mb-16">
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-orange">
              What Drives Us
            </span>
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-navy mt-3">
              Our Core Values
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {VALUES.map((val, i) => (
              <motion.div
                key={val.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="bg-white rounded-2xl p-8 border border-transparent hover:border-orange/20 transition-all group hover:translate-x-1"
              >
                <div className="w-12 h-12 rounded-lg bg-navy flex items-center justify-center mb-5">
                  <val.icon size={22} className="text-orange" />
                </div>
                <h3 className="font-heading font-bold text-navy text-lg">{val.title}</h3>
                <p className="text-muted-foreground text-sm mt-2 leading-relaxed">{val.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-navy">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-10 text-center">
          <h2 className="text-3xl lg:text-4xl font-heading font-bold text-white">
            Ready to Partner With Us?
          </h2>
          <p className="text-white/50 mt-4 leading-relaxed">
            Join hundreds of businesses that trust Obech Global Logistics for their international shipping needs.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Link
              to="/booking"
              className="flex items-center gap-2 px-8 py-3.5 bg-orange text-white font-semibold text-sm uppercase tracking-wider rounded hover:bg-orange-light transition-all hover:translate-x-1"
            >
              Book Now <ArrowRight size={16} />
            </Link>
            <Link
              to="/contact"
              className="px-8 py-3.5 border-2 border-white/20 text-white font-semibold text-sm uppercase tracking-wider rounded hover:border-orange hover:text-orange transition-all hover:translate-x-1"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}