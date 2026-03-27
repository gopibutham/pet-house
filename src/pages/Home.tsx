import { Link } from 'react-router-dom';
import { Search, ArrowRight, ShieldCheck, Heart, Zap, PawPrint, Loader2 } from 'lucide-react';
import PetCard from '../components/PetCard';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { useState, useEffect } from 'react';
import { Pet } from '../types';
import { db } from '../firebase';
import { collection, query, limit, onSnapshot, orderBy } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firebaseUtils';

export default function Home() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'pets'), orderBy('createdAt', 'desc'), limit(4));
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
  return (
    <div className="space-y-24 pb-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-orange-50 pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-bold tracking-wide uppercase">
                <Zap className="w-4 h-4" />
                Trusted by 10,000+ Pet Lovers
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-[1.1] tracking-tight">
                Find Your New <br />
                <span className="text-orange-500 italic">Best Friend</span> Today
              </h1>
              <p className="text-xl text-gray-600 max-w-lg leading-relaxed">
                Connect with verified sellers and find the perfect companion for your home. Safe, secure, and full of love.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/browse"
                  className="bg-orange-500 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:bg-orange-600 transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center gap-2"
                >
                  Browse Pets <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/sell"
                  className="bg-white text-gray-900 px-8 py-4 rounded-2xl text-lg font-bold border border-gray-200 hover:border-orange-500 hover:text-orange-500 transition-all shadow-sm active:scale-95"
                >
                  Sell a Pet
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative aspect-square rounded-[3rem] overflow-hidden shadow-2xl rotate-3">
                <img
                  src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=1200&h=1200"
                  alt="Happy Pets Group"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-3xl shadow-xl -rotate-3 border border-orange-100">
                <div className="flex items-center gap-4">
                  <div className="bg-orange-100 p-3 rounded-2xl">
                    <Heart className="w-6 h-6 text-orange-500 fill-orange-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-gray-900">2,500+</p>
                    <p className="text-sm text-gray-500 font-medium">Pets Adopted</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-orange-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-orange-300/10 rounded-full blur-3xl" />
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: 'Verified Sellers',
              desc: 'Every seller is manually verified to ensure the safety of our community.',
              icon: ShieldCheck,
              color: 'bg-blue-50 text-blue-600',
            },
            {
              title: 'Secure Payments',
              desc: 'Safe and transparent transaction process for both buyers and sellers.',
              icon: Zap,
              color: 'bg-orange-50 text-orange-600',
            },
            {
              title: 'Expert Support',
              desc: 'Our team of pet experts is here to help you every step of the way.',
              icon: PawPrint,
              color: 'bg-green-50 text-green-600',
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-[2.5rem] bg-white border border-gray-100 hover:border-orange-200 transition-all group"
            >
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform", feature.color)}>
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Pets Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">Featured Pets</h2>
            <p className="text-gray-500 font-medium">Meet some of our newest and most popular companions.</p>
          </div>
          <Link
            to="/browse"
            className="text-orange-600 font-bold flex items-center gap-2 hover:gap-3 transition-all group"
          >
            View All <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] bg-gray-100 rounded-[2.5rem] animate-pulse" />
            ))
          ) : pets.length > 0 ? (
            pets.map((pet) => (
              <PetCard key={pet.id} pet={pet} />
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-gray-500 font-medium">
              No pets listed yet. Be the first to list one!
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-900 rounded-[3rem] p-12 md:p-20 relative overflow-hidden text-center space-y-8">
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
              Ready to give a pet a <br />
              <span className="text-orange-500 italic">forever home?</span>
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed">
              Join thousands of happy pet owners who found their perfect match on PetConnect.
            </p>
            <div className="pt-4">
              <Link
                to="/browse"
                className="inline-flex bg-orange-500 text-white px-10 py-5 rounded-2xl text-lg font-bold hover:bg-orange-600 transition-all shadow-lg active:scale-95"
              >
                Get Started Now
              </Link>
            </div>
          </div>
          
          {/* Decorative Background */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-10 left-10"><PawPrint className="w-20 h-20 text-white rotate-12" /></div>
            <div className="absolute bottom-10 right-10"><PawPrint className="w-24 h-24 text-white -rotate-12" /></div>
            <div className="absolute top-1/2 left-1/4"><PawPrint className="w-16 h-16 text-white rotate-45" /></div>
          </div>
        </div>
      </section>
    </div>
  );
}
