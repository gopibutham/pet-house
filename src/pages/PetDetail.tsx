import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, DollarSign, Heart, Share2, Mail, Phone, ChevronLeft, ShieldCheck, Info, Loader2, Box, ShoppingBag } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { auth, db } from '../firebase';
import { doc, onSnapshot, addDoc, collection, updateDoc } from 'firebase/firestore';
import { Pet, Order } from '../types';
import { handleFirestoreError, OperationType } from '../lib/firebaseUtils';
import { toast } from 'sonner';

export default function PetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    if (!id) return;
    const unsubscribe = onSnapshot(doc(db, 'pets', id), (snapshot) => {
      if (snapshot.exists()) {
        setPet({ id: snapshot.id, ...snapshot.data() } as Pet);
      } else {
        setPet(null);
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `pets/${id}`);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  const handlePurchase = async () => {
    if (!auth.currentUser) {
      toast.error('Please sign in to purchase a pet');
      navigate('/login');
      return;
    }

    if (!pet || (pet.isOfficial && pet.stockCount === 0)) {
      toast.error('This pet is currently out of stock');
      return;
    }

    setIsPurchasing(true);
    try {
      // 1. Create the order
      const orderData: Omit<Order, 'id'> = {
        petId: pet.id,
        petName: pet.name,
        petImage: pet.images[0],
        buyerId: auth.currentUser.uid,
        buyerName: auth.currentUser.displayName || 'Anonymous',
        buyerEmail: auth.currentUser.email || '',
        price: pet.price,
        status: 'completed',
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'orders'), orderData);

      // 2. Decrement stock if official
      if (pet.isOfficial && pet.stockCount !== undefined) {
        await updateDoc(doc(db, 'pets', pet.id), {
          stockCount: Math.max(0, pet.stockCount - 1),
          updatedAt: new Date().toISOString(),
        });
      }

      toast.success(`Congratulations! You have successfully purchased ${pet.name}!`);
      navigate('/my-orders');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'orders');
    } finally {
      setIsPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center space-y-8">
        <div className="bg-orange-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto">
          <Info className="w-12 h-12 text-orange-500" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-gray-900">Pet Not Found</h1>
          <p className="text-gray-500 text-lg">The pet you are looking for doesn't exist or has been removed.</p>
        </div>
        <Link
          to="/browse"
          className="inline-flex bg-orange-500 text-white px-8 py-4 rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-lg active:scale-95"
        >
          Back to Browse
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-orange-600 transition-colors group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Results
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Image Gallery */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="aspect-[4/3] rounded-[3rem] overflow-hidden border border-gray-100 shadow-2xl"
          >
            <img
              src={pet.images[activeImage]}
              alt={pet.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>
          <div className="grid grid-cols-4 gap-4">
            {pet.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={cn(
                  "aspect-square rounded-2xl overflow-hidden border-2 transition-all",
                  activeImage === i ? "border-orange-500 scale-105 shadow-md" : "border-transparent opacity-60 hover:opacity-100"
                )}
              >
                <img src={img} alt={`${pet.name} ${i + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>
        </div>

        {/* Pet Info */}
        <div className="space-y-10">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <span className="bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                {pet.species}
              </span>
              <span className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                {pet.breed}
              </span>
              {pet.isOfficial && (
                <span className="bg-orange-500 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  PetConnect Exclusive
                </span>
              )}
            </div>
            <div className="flex justify-between items-start">
              <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tight">{pet.name}</h1>
              <div className="flex gap-3">
                <button className="p-4 bg-gray-50 rounded-2xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all border border-gray-100">
                  <Heart className="w-6 h-6" />
                </button>
                <button className="p-4 bg-gray-50 rounded-2xl text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all border border-gray-100">
                  <Share2 className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 text-4xl font-black text-orange-500">
              <DollarSign className="w-8 h-8" />
              {pet.price.toLocaleString()}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Age</p>
              <p className="text-xl font-black text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-500" />
                {pet.age}
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Location</p>
              <p className="text-xl font-black text-gray-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-500" />
                {pet.location}
              </p>
            </div>
          </div>

          {pet.isOfficial && pet.stockCount !== undefined && (
            <div className="space-y-4">
              <div className={cn(
                "p-6 rounded-3xl border flex items-center justify-between",
                pet.stockCount > 0 ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"
              )}>
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-3 rounded-2xl",
                    pet.stockCount > 0 ? "bg-green-500 text-white" : "bg-red-500 text-white"
                  )}>
                    <Box className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Availability</p>
                    <p className={cn(
                      "text-xl font-black",
                      pet.stockCount > 0 ? "text-green-700" : "text-red-700"
                    )}>
                      {pet.stockCount > 0 ? `${pet.stockCount} Units in Stock` : 'Currently Out of Stock'}
                    </p>
                  </div>
                </div>
                {pet.stockCount > 0 && (
                  <div className="hidden sm:block">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                      Ready to Ship
                    </span>
                  </div>
                )}
              </div>

              {pet.stockCount > 0 && (
                <button
                  onClick={handlePurchase}
                  disabled={isPurchasing}
                  className={cn(
                    "w-full py-5 rounded-2xl text-lg font-black transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3",
                    isPurchasing ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-orange-500 text-white hover:bg-orange-600 shadow-orange-200"
                  )}
                >
                  {isPurchasing ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Processing Purchase...
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-6 h-6" />
                      Purchase Now
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-xl font-black text-gray-900">About {pet.name}</h3>
            <p className="text-gray-600 leading-relaxed text-lg">
              {pet.description}
            </p>
          </div>

          {/* Seller Info Card */}
          <div className="bg-white border-2 border-orange-100 rounded-[2.5rem] p-8 space-y-8 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center text-white text-2xl font-black">
                  {pet.sellerName[0]}
                </div>
                <div>
                  <h4 className="text-xl font-black text-gray-900">{pet.sellerName}</h4>
                  <div className="flex items-center gap-2 text-sm text-green-600 font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    Verified Seller
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href={`mailto:${pet.sellerEmail}`}
                className="flex items-center justify-center gap-3 py-4 bg-orange-500 text-white rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-lg active:scale-95"
              >
                <Mail className="w-5 h-5" />
                Email Seller
              </a>
              <a
                href={`tel:${pet.sellerPhone || '555-000-0000'}`}
                className="flex items-center justify-center gap-3 py-4 bg-white border-2 border-gray-100 text-gray-900 rounded-2xl font-bold hover:border-orange-500 hover:text-orange-500 transition-all active:scale-95"
              >
                <Phone className="w-5 h-5" />
                Call Seller
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
