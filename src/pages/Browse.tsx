import { useState, useMemo, useEffect } from 'react';
import { Search, Filter, SlidersHorizontal, ChevronDown, X, ShieldCheck } from 'lucide-react';
import PetCard from '../components/PetCard';
import { Pet, PetSpecies } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firebaseUtils';
import { useSearchParams } from 'react-router-dom';

const SPECIES: PetSpecies[] = ['Dog', 'Cat', 'Bird', 'Fish', 'Rabbit', 'Other'];

export default function Browse() {
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') === 'official' ? 'Official' : 'All';

  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState<PetSpecies | 'All'>('All');
  const [selectedType, setSelectedType] = useState<'All' | 'Official' | 'Community'>(initialType);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (searchParams.get('type') === 'official') {
      setSelectedType('Official');
    }
  }, [searchParams]);

  useEffect(() => {
    const q = query(collection(db, 'pets'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const petsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Pet[];
      setPets(petsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'pets');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredPets = useMemo(() => {
    return pets.filter((pet) => {
      const matchesSearch = pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          pet.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          pet.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSpecies = selectedSpecies === 'All' || pet.species === selectedSpecies;
      const matchesPrice = pet.price >= priceRange[0] && pet.price <= priceRange[1];
      const matchesType = selectedType === 'All' || 
                         (selectedType === 'Official' && pet.isOfficial) || 
                         (selectedType === 'Community' && !pet.isOfficial);
      
      return matchesSearch && matchesSpecies && matchesPrice && matchesType;
    });
  }, [pets, searchQuery, selectedSpecies, priceRange, selectedType]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header & Search */}
      <div className="space-y-8 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
          Find Your Perfect <span className="text-orange-500 italic">Companion</span>
        </h1>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search by name, breed, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-14 pr-6 py-5 bg-white border-2 border-gray-100 rounded-[2rem] text-lg focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all outline-none shadow-sm group-hover:shadow-md"
          />
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col gap-8 pb-8 border-b border-gray-100">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedType('All')}
              className={cn(
                "px-6 py-2.5 rounded-full text-sm font-black uppercase tracking-widest transition-all active:scale-95",
                selectedType === 'All' 
                  ? "bg-gray-900 text-white shadow-lg" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              All Listings
            </button>
            <button
              onClick={() => setSelectedType('Official')}
              className={cn(
                "px-6 py-2.5 rounded-full text-sm font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2",
                selectedType === 'Official' 
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-200" 
                  : "bg-orange-50 text-orange-600 hover:bg-orange-100"
              )}
            >
              <ShieldCheck className="w-4 h-4" />
              PetConnect Exclusives
            </button>
            <button
              onClick={() => setSelectedType('Community')}
              className={cn(
                "px-6 py-2.5 rounded-full text-sm font-black uppercase tracking-widest transition-all active:scale-95",
                selectedType === 'Community' 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                  : "bg-blue-50 text-blue-600 hover:bg-blue-100"
              )}
            >
              Community Listings
            </button>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-bold text-gray-700 hover:border-orange-500 hover:text-orange-500 transition-all active:scale-95"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Advanced Filters
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedSpecies('All')}
            className={cn(
              "px-6 py-2.5 rounded-full text-sm font-bold transition-all active:scale-95",
              selectedSpecies === 'All' 
                ? "bg-orange-500 text-white shadow-lg shadow-orange-200" 
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            All Species
          </button>
          {SPECIES.map((species) => (
            <button
              key={species}
              onClick={() => setSelectedSpecies(species)}
              className={cn(
                "px-6 py-2.5 rounded-full text-sm font-bold transition-all active:scale-95",
                selectedSpecies === species 
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-200" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {species}s
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-gray-50 rounded-3xl p-8 border border-gray-100"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="space-y-4">
                <label className="text-sm font-bold text-gray-900 uppercase tracking-wider">Price Range</label>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-100 focus:border-orange-500 outline-none"
                    placeholder="Min"
                  />
                  <span className="text-gray-400">—</span>
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-100 focus:border-orange-500 outline-none"
                    placeholder="Max"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold text-gray-900 uppercase tracking-wider">Sort By</label>
                <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-100 focus:border-orange-500 outline-none bg-white">
                  <option>Newest First</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                </select>
              </div>

              <div className="flex items-end">
                <button 
                  onClick={() => {
                    setPriceRange([0, 5000]);
                    setSelectedSpecies('All');
                    setSearchQuery('');
                  }}
                  className="w-full py-3 text-sm font-bold text-gray-500 hover:text-orange-600 transition-colors flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Reset All Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Grid */}
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <p className="text-gray-500 font-medium">
            Showing <span className="text-gray-900 font-bold">{filteredPets.length}</span> results
          </p>
        </div>

        {filteredPets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredPets.map((pet) => (
              <PetCard key={pet.id} pet={pet} />
            ))}
          </div>
        ) : (
          <div className="text-center py-32 space-y-6 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
            <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <Search className="w-8 h-8 text-gray-300" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-gray-900">No pets found</h3>
              <p className="text-gray-500 max-w-xs mx-auto">
                Try adjusting your search or filters to find what you're looking for.
              </p>
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSpecies('All');
                setPriceRange([0, 5000]);
              }}
              className="text-orange-600 font-bold hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
