import { PawPrint, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-orange-500 p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300">
                <PawPrint className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">PetConnect</span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-400">
              Connecting pet lovers with their perfect companions. Our platform ensures a safe and transparent marketplace for buying and selling pets.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-orange-500 transition-colors"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="hover:text-orange-500 transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="hover:text-orange-500 transition-colors"><Instagram className="w-5 h-5" /></a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-4 text-sm">
              <li><Link to="/browse" className="hover:text-orange-500 transition-colors">Browse Pets</Link></li>
              <li><Link to="/sell" className="hover:text-orange-500 transition-colors">List a Pet</Link></li>
              <li><Link to="/about" className="hover:text-orange-500 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-orange-500 transition-colors">Contact Support</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-6">Pet Categories</h3>
            <ul className="space-y-4 text-sm">
              <li><Link to="/browse?species=Dog" className="hover:text-orange-500 transition-colors">Dogs & Puppies</Link></li>
              <li><Link to="/browse?species=Cat" className="hover:text-orange-500 transition-colors">Cats & Kittens</Link></li>
              <li><Link to="/browse?species=Bird" className="hover:text-orange-500 transition-colors">Birds</Link></li>
              <li><Link to="/browse?species=Fish" className="hover:text-orange-500 transition-colors">Fish & Aquarium</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-6">Contact Info</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-center gap-3"><Mail className="w-4 h-4 text-orange-500" /> support@petconnect.com</li>
              <li className="flex items-center gap-3"><Phone className="w-4 h-4 text-orange-500" /> +1 (555) 000-0000</li>
              <li className="flex items-center gap-3"><MapPin className="w-4 h-4 text-orange-500" /> 123 Pet Lane, Animal City</li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-800 text-center text-xs text-gray-500">
          <p>© {new Date().getFullYear()} PetConnect Marketplace. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
