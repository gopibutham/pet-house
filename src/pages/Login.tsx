import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PawPrint, Chrome, Github, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { auth, db } from '../firebase';
import { signInWithPopup, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firebaseUtils';

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const createUserProfile = async (user: any) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || 'Anonymous',
          photoURL: user.photoURL || '',
          createdAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    setIsLoading(true);
    try {
      const authProvider = provider === 'google' ? new GoogleAuthProvider() : new GithubAuthProvider();
      const result = await signInWithPopup(auth, authProvider);
      await createUserProfile(result.user);
      toast.success('Signed in successfully!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || `${provider === 'google' ? 'Google' : 'GitHub'} login failed.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-orange-50/30">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[3rem] p-8 md:p-12 border border-gray-100 shadow-xl space-y-10"
      >
        <div className="text-center space-y-4">
          <div className="bg-orange-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-orange-200">
            <PawPrint className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              Welcome to PetConnect
            </h1>
            <p className="text-gray-500 font-medium">
              Join our community of pet lovers
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => handleSocialLogin('google')}
            disabled={isLoading}
            className="w-full py-5 bg-white border-2 border-gray-100 text-gray-900 rounded-2xl font-black text-lg hover:border-orange-500 hover:text-orange-500 transition-all shadow-sm active:scale-95 flex items-center justify-center gap-4 group"
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-6 h-6 border-4 border-orange-100 border-t-orange-500 rounded-full"
              />
            ) : (
              <>
                <Chrome className="w-6 h-6 text-orange-500 group-hover:scale-110 transition-transform" />
                Continue with Google
              </>
            )}
          </button>

          <button
            onClick={() => handleSocialLogin('github')}
            disabled={isLoading}
            className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-lg hover:bg-gray-800 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-4 group"
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full"
              />
            ) : (
              <>
                <Github className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                Continue with GitHub
              </>
            )}
          </button>

          <div className="p-6 bg-gray-50 rounded-2xl flex items-start gap-4">
            <ShieldCheck className="w-6 h-6 text-orange-500 shrink-0 mt-1" />
            <p className="text-sm text-gray-500 leading-relaxed font-medium">
              We use secure OAuth providers to ensure a seamless experience. Your data is protected and never shared without your permission.
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link to="/" className="text-sm font-bold text-gray-400 hover:text-orange-500 transition-colors">
            Back to Home
          </Link>
        </div>

        <div className="pt-4 flex items-center justify-center gap-2 text-xs text-green-600 font-bold">
          <ShieldCheck className="w-4 h-4" />
          Secure 256-bit SSL Encryption
        </div>
      </motion.div>
    </div>
  );
}
