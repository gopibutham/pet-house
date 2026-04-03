import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { Order } from '../types';
import { ShoppingBag, Calendar, DollarSign, Package, ChevronRight, Info, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { handleFirestoreError, OperationType } from '../lib/firebaseUtils';
import { cn } from '../lib/utils';

export default function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) {
      navigate('/login');
      return;
    }

    const q = query(
      collection(db, 'orders'),
      where('buyerId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">My Purchases</h1>
        <p className="text-gray-500 font-medium text-lg">Track your orders and view your pet adoption history.</p>
      </div>

      {orders.length > 0 ? (
        <div className="grid gap-6">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] border border-gray-100 p-6 md:p-8 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-8 items-center"
            >
              <div className="w-full md:w-48 aspect-square rounded-3xl overflow-hidden border border-gray-50">
                <img
                  src={order.petImage}
                  alt={order.petName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="flex-1 space-y-6 w-full">
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-gray-900">{order.petName}</h3>
                    <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Order ID: {order.id.slice(0, 8)}</p>
                  </div>
                  <div className={cn(
                    "px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest",
                    order.status === 'completed' ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                  )}>
                    {order.status}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Calendar className="w-3 h-3" /> Date
                    </p>
                    <p className="font-bold text-gray-700">
                      {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <DollarSign className="w-3 h-3" /> Price
                    </p>
                    <p className="font-bold text-gray-700">${order.price.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Package className="w-3 h-3" /> Delivery
                    </p>
                    <p className="font-bold text-green-600">Standard Shipping</p>
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <Link
                    to={`/pet/${order.petId}`}
                    className="flex-1 py-4 bg-gray-50 text-gray-900 rounded-2xl font-bold hover:bg-orange-500 hover:text-white transition-all text-center flex items-center justify-center gap-2 group"
                  >
                    View Pet Details <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-32 space-y-8 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
          <div className="bg-white w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <ShoppingBag className="w-10 h-10 text-gray-300" />
          </div>
          <div className="space-y-2">
            <h3 className="text-3xl font-black text-gray-900">No purchases yet</h3>
            <p className="text-gray-500 max-w-xs mx-auto text-lg">
              You haven't adopted any pets yet. Start browsing to find your new best friend!
            </p>
          </div>
          <Link
            to="/browse"
            className="inline-flex bg-orange-500 text-white px-10 py-5 rounded-2xl text-lg font-bold hover:bg-orange-600 transition-all shadow-lg active:scale-95"
          >
            Browse Pets
          </Link>
        </div>
      )}
    </div>
  );
}
