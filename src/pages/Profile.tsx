import { useState, useEffect } from 'react';
import { MOCK_PETS } from '../lib/mockData';
import PetCard from '../components/PetCard';
import { User, Mail, Phone, MapPin, Settings, PlusCircle, LogOut, Heart, Package, Loader2, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { collection, query, where, onSnapshot, orderBy, doc, getDoc } from 'firebase/firestore';
import { Pet } from '../types';
import { handleFirestoreError, OperationType } from '../lib/firebaseUtils';
import { signOut } from 'firebase/auth';

export default function Profile() {
  const [listings, setListings] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('user');
  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Fetch user role
    const fetchUserRole = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role || 'user');
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    };
    fetchUserRole();

    const q = query(
      collection(db, 'pets'),
      where('sellerId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const petsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Pet[];
      setListings(petsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'pets');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, navigate]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!user) return null;

  const profileData = {
    displayName: user.displayName || 'Anonymous User',
    email: user.email || '',
    phone: user.phoneNumber || 'Not provided',
    location: 'Not provided', // Could be stored in a users collection
    memberSince: user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'Recent',
    listings: listings,
    favorites: [], // Placeholder
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Profile Header */}
      <div className="bg-gray-900 rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="w-32 h-32 bg-orange-500 rounded-[2.5rem] flex items-center justify-center text-5xl font-black shadow-2xl border-4 border-white/10">
            {user.displayName[0]}
          </div>
          <div className="flex-grow text-center md:text-left space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-black tracking-tight">{profileData.displayName}</h1>
                {userRole === 'admin' && (
                  <span className="bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-orange-500/20">
                    <Shield className="w-3 h-3" />
                    Admin
                  </span>
                )}
              </div>
              <p className="text-orange-400 font-bold flex items-center justify-center md:justify-start gap-2">
                <Settings className="w-4 h-4" />
                Member since {profileData.memberSince}
              </p>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm text-gray-400 font-medium">
              <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-orange-500" /> {profileData.email}</div>
              <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-orange-500" /> {profileData.phone}</div>
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-orange-500" /> {profileData.location}</div>
            </div>
          </div>
          <div className="flex gap-4">
            <button className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/10">
              <Settings className="w-6 h-6" />
            </button>
            <button 
              onClick={handleSignOut}
              className="p-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-2xl transition-all border border-red-500/20"
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Sidebar Stats */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
            <h3 className="text-xl font-black text-gray-900 tracking-tight">Account Overview</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-orange-600" />
                  <span className="font-bold text-gray-700">Active Listings</span>
                </div>
                <span className="text-xl font-black text-orange-600">{profileData.listings.length}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5 text-red-600" />
                  <span className="font-bold text-gray-700">Favorites</span>
                </div>
                <span className="text-xl font-black text-red-600">{profileData.favorites.length}</span>
              </div>
            </div>
            <Link
              to="/sell"
              className="w-full flex items-center justify-center gap-3 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-lg active:scale-95"
            >
              <PlusCircle className="w-5 h-5" />
              Create New Listing
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          {/* My Listings */}
          <section className="space-y-8">
            <div className="flex justify-between items-end">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">My Listings</h2>
              <Link to="/sell" className="text-orange-600 font-bold text-sm hover:underline">Manage All</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {profileData.listings.map((pet) => (
                <PetCard key={pet.id} pet={pet} />
              ))}
            </div>
          </section>

          {/* Favorites */}
          <section className="space-y-8">
            <div className="flex justify-between items-end">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Saved Favorites</h2>
              <button className="text-orange-600 font-bold text-sm hover:underline">View All</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {profileData.favorites.map((pet) => (
                <PetCard key={pet.id} pet={pet} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
