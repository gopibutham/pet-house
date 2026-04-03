import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, setDoc, doc, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { motion } from 'motion/react';
import { Users, Shield, Mail, Calendar, User as UserIcon, Database, Loader2, CheckCircle2 } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../lib/firebaseUtils';
import { MOCK_PETS } from '../lib/mockData';
import { toast } from 'sonner';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    // Check if current user is admin
    const checkAdmin = async () => {
      if (auth.currentUser) {
        // We can check the email directly for the hardcoded admin
        if (auth.currentUser.email === 'gopibutham@gmail.com') {
          setIsAdmin(true);
        }
      }
    };
    checkAdmin();

    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        ...doc.data()
      })) as UserProfile[];
      setUsers(usersData);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const seedData = async () => {
    if (!isAdmin) return;
    setIsSeeding(true);
    try {
      const petsCollection = collection(db, 'pets');
      const existingPets = await getDocs(petsCollection);
      
      if (existingPets.size > 0) {
        if (!window.confirm(`There are already ${existingPets.size} pets in the database. Do you want to add more?`)) {
          setIsSeeding(false);
          return;
        }
      }

      let count = 0;
      for (const pet of MOCK_PETS) {
        // Use the mock ID as the document ID
        await setDoc(doc(db, 'pets', pet.id), {
          ...pet,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        count++;
      }
      toast.success(`Successfully seeded ${count} pet records!`);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'pets');
    } finally {
      setIsSeeding(false);
    }
  };

  if (!isAdmin && !isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Shield className="w-16 h-16 text-red-500 mx-auto" />
          <h1 className="text-2xl font-black text-gray-900">Access Denied</h1>
          <p className="text-gray-500">You do not have administrative privileges.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-orange-600 font-black uppercase tracking-widest text-sm">
            <Shield className="w-5 h-5" />
            Admin Control Panel
          </div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tight">User Management</h1>
          <p className="text-xl text-gray-500 font-medium max-w-2xl">
            Monitor and manage all registered users on the PetConnect platform.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={seedData}
            disabled={isSeeding}
            className="bg-white border-2 border-orange-100 px-8 py-6 rounded-[2rem] flex items-center gap-6 hover:border-orange-500 transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <div className="bg-orange-50 p-4 rounded-2xl">
              {isSeeding ? <Loader2 className="w-8 h-8 text-orange-600 animate-spin" /> : <Database className="w-8 h-8 text-orange-600" />}
            </div>
            <div className="text-left">
              <div className="text-lg font-black text-gray-900">{isSeeding ? 'Seeding...' : 'Seed Pet Data'}</div>
              <div className="text-sm font-bold text-orange-600 uppercase tracking-wider">Populate Database</div>
            </div>
          </button>

          <div className="bg-orange-50 px-8 py-6 rounded-[2rem] border border-orange-100 flex items-center gap-6">
            <div className="bg-white p-4 rounded-2xl shadow-sm">
              <Users className="w-8 h-8 text-orange-600" />
            </div>
            <div>
              <div className="text-3xl font-black text-gray-900">{users.length}</div>
              <div className="text-sm font-bold text-orange-600 uppercase tracking-wider">Total Users</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-bottom border-gray-100">
                <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">User</th>
                <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Contact</th>
                <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Role</th>
                <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-10 h-10 border-4 border-orange-100 border-t-orange-500 rounded-full mx-auto"
                    />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-gray-500 font-medium">
                    No users found in the database.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.uid} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                          {user.photoURL ? (
                            <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <UserIcon className="w-6 h-6 text-orange-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-black text-gray-900 group-hover:text-orange-600 transition-colors">
                            {user.displayName}
                          </div>
                          <div className="text-xs font-bold text-gray-400 font-mono uppercase tracking-tighter">
                            ID: {user.uid.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-gray-600 font-medium">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
                        user.role === 'admin' 
                          ? 'bg-orange-100 text-orange-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        <Shield className="w-3 h-3" />
                        {user.role}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-gray-500 font-medium">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
