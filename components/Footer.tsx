import React from "react";
import Link from "next/link";
import { Stethoscope, Heart, Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600">
                <Stethoscope className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-sm font-bold text-white tracking-tight">Smart Doctor</span>
                <span className="text-xs font-semibold text-blue-400 tracking-wide">CONNECT AI</span>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Pakistan&apos;s first AI-powered doctor discovery platform. Find specialists nationwide, book instantly.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">For Patients</h4>
            <ul className="space-y-2 text-sm">
              {["Find a Doctor", "Check Symptoms", "Book Appointment", "Online Consultation"].map((item) => (
                <li key={item}>
                  <Link href="/search" className="text-slate-400 hover:text-white transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Specializations */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Specializations</h4>
            <ul className="space-y-2 text-sm">
              {["Cardiology", "Orthopedics", "Dermatology", "Neurology", "Gynecology"].map((item) => (
                <li key={item}>
                  <Link href="/search" className="text-slate-400 hover:text-white transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2.5 text-slate-400">
                <Phone className="h-4 w-4 text-blue-400 shrink-0" />
                <span>+92 (21) 111-DOCTOR</span>
              </li>
              <li className="flex items-center gap-2.5 text-slate-400">
                <Mail className="h-4 w-4 text-blue-400 shrink-0" />
                <span>support@smartdoctor.pk</span>
              </li>
              <li className="flex items-start gap-2.5 text-slate-400">
                <MapPin className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                <span>NUST Innovation Hub, H-12, Islamabad</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500">
            © 2026 Smart Doctor Connect AI. All rights reserved.
          </p>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            Built with <Heart className="h-3 w-3 text-red-400" /> for Pakistan&apos;s healthcare
          </p>
        </div>
      </div>
    </footer>
  );
}
