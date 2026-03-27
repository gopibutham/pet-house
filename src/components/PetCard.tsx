import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, DollarSign, Heart } from 'lucide-react';
import { Pet } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface PetCardProps {
  pet: Pet;
}

const PetCard: React.FC<PetCardProps> = ({ pet }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group"
    >
      <Link to={`/pet/${pet.id}`} className="block relative aspect-[4/3] overflow-hidden">
        <img
          src={pet.images[0] || 'https://picsum.photos/seed/pet/800/600'}
          alt={pet.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-white/90 backdrop-blur-sm text-orange-600 px-3 py-1 rounded-full text-xs font-bold shadow-sm uppercase tracking-wider">
            {pet.species}
          </span>
        </div>
        <button 
          className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-red-500 transition-all duration-300 border border-white/30"
          onClick={(e) => {
            e.preventDefault();
            // Handle favorite logic
          }}
        >
          <Heart className="w-4 h-4" />
        </button>
      </Link>

      <div className="p-5 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
              {pet.name}
            </h3>
            <p className="text-sm text-gray-500 font-medium">{pet.breed}</p>
          </div>
          <div className="text-right">
            <span className="text-xl font-black text-gray-900 flex items-center justify-end">
              <DollarSign className="w-4 h-4 text-orange-500" />
              {pet.price.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-50">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar className="w-3.5 h-3.5 text-orange-400" />
            {pet.age}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <MapPin className="w-3.5 h-3.5 text-orange-400" />
            {pet.location}
          </div>
        </div>

        <Link
          to={`/pet/${pet.id}`}
          className="block w-full text-center py-3 bg-gray-50 hover:bg-orange-500 hover:text-white text-gray-900 font-bold rounded-2xl transition-all duration-300 text-sm"
        >
          View Details
        </Link>
      </div>
    </motion.div>
  );
};

export default PetCard;
