import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PawPrint, Upload, DollarSign, MapPin, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { PetSpecies } from '../types';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { auth, db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { handleFirestoreError, OperationType } from '../lib/firebaseUtils';

const petSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  species: z.string().min(1, 'Please select a species'),
  breed: z.string().min(2, 'Breed must be at least 2 characters'),
  age: z.string().min(1, 'Age is required'),
  price: z.number().min(0, 'Price must be positive'),
  location: z.string().min(2, 'Location is required'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
});

type PetFormValues = z.infer<typeof petSchema>;

const SPECIES: PetSpecies[] = ['Dog', 'Cat', 'Bird', 'Fish', 'Rabbit', 'Other'];

export default function SellPet() {
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PetFormValues>({
    resolver: zodResolver(petSchema),
    defaultValues: {
      price: 0,
    }
  });

  const onSubmit = async (data: PetFormValues) => {
    if (!auth.currentUser) {
      toast.error('You must be signed in to list a pet');
      navigate('/login');
      return;
    }

    if (images.length === 0) {
      toast.error('Please upload at least one photo of your pet');
      return;
    }

    setIsSubmitting(true);
    try {
      const petData = {
        ...data,
        images,
        sellerId: auth.currentUser.uid,
        sellerName: auth.currentUser.displayName || 'Anonymous',
        sellerEmail: auth.currentUser.email || '',
        status: 'available',
        createdAt: new Date().toISOString(), // Using ISO string for now, or serverTimestamp if schema allows
        updatedAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'pets'), petData);
      
      toast.success('Your pet listing has been created successfully!');
      reset();
      setImages([]);
      navigate('/browse');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'pets');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // For demo purposes, we'll just use placeholder images
      const newImages = Array.from(files).map((_, i) => `https://picsum.photos/seed/pet-${Date.now()}-${i}/800/600`);
      setImages([...images, ...newImages]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="space-y-4 text-center">
        <div className="bg-orange-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto">
          <PawPrint className="w-8 h-8 text-orange-600" />
        </div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">List Your Pet for Sale</h1>
        <p className="text-gray-500 text-lg max-w-lg mx-auto">
          Fill out the details below to find a loving new home for your companion.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-12 bg-white p-8 md:p-12 rounded-[3rem] border border-gray-100 shadow-sm">
        {/* Image Upload Section */}
        <div className="space-y-6">
          <label className="block text-sm font-black text-gray-900 uppercase tracking-widest">Pet Photos</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((img, i) => (
              <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group border border-gray-100">
                <img src={img} alt="Pet" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <button
                  type="button"
                  onClick={() => setImages(images.filter((_, index) => index !== i))}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <AlertCircle className="w-4 h-4" />
                </button>
              </div>
            ))}
            {images.length < 4 && (
              <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-all group">
                <Upload className="w-8 h-8 text-gray-300 group-hover:text-orange-500 transition-colors" />
                <span className="text-xs font-bold text-gray-400 group-hover:text-orange-600">Add Photo</span>
                <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageUpload} />
              </label>
            )}
          </div>
          <p className="text-xs text-gray-400 font-medium flex items-center gap-2">
            <Info className="w-3.5 h-3.5" />
            Upload up to 4 clear photos of your pet.
          </p>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-sm font-black text-gray-900 uppercase tracking-widest">Pet Name</label>
            <input
              {...register('name')}
              className={cn(
                "w-full px-6 py-4 rounded-2xl border-2 outline-none transition-all",
                errors.name ? "border-red-100 bg-red-50 focus:border-red-500" : "border-gray-100 bg-gray-50 focus:border-orange-500 focus:bg-white"
              )}
              placeholder="e.g. Buddy"
            />
            {errors.name && <p className="text-xs font-bold text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-black text-gray-900 uppercase tracking-widest">Species</label>
            <select
              {...register('species')}
              className={cn(
                "w-full px-6 py-4 rounded-2xl border-2 outline-none transition-all appearance-none bg-white",
                errors.species ? "border-red-100 bg-red-50 focus:border-red-500" : "border-gray-100 bg-gray-50 focus:border-orange-500 focus:bg-white"
              )}
            >
              <option value="">Select Species</option>
              {SPECIES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {errors.species && <p className="text-xs font-bold text-red-500">{errors.species.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-black text-gray-900 uppercase tracking-widest">Breed</label>
            <input
              {...register('breed')}
              className={cn(
                "w-full px-6 py-4 rounded-2xl border-2 outline-none transition-all",
                errors.breed ? "border-red-100 bg-red-50 focus:border-red-500" : "border-gray-100 bg-gray-50 focus:border-orange-500 focus:bg-white"
              )}
              placeholder="e.g. Golden Retriever"
            />
            {errors.breed && <p className="text-xs font-bold text-red-500">{errors.breed.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-black text-gray-900 uppercase tracking-widest">Age</label>
            <input
              {...register('age')}
              className={cn(
                "w-full px-6 py-4 rounded-2xl border-2 outline-none transition-all",
                errors.age ? "border-red-100 bg-red-50 focus:border-red-500" : "border-gray-100 bg-gray-50 focus:border-orange-500 focus:bg-white"
              )}
              placeholder="e.g. 2 years"
            />
            {errors.age && <p className="text-xs font-bold text-red-500">{errors.age.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-black text-gray-900 uppercase tracking-widest">Price ($)</label>
            <div className="relative">
              <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                {...register('price', { valueAsNumber: true })}
                className={cn(
                  "w-full pl-14 pr-6 py-4 rounded-2xl border-2 outline-none transition-all",
                  errors.price ? "border-red-100 bg-red-50 focus:border-red-500" : "border-gray-100 bg-gray-50 focus:border-orange-500 focus:bg-white"
                )}
                placeholder="0.00"
              />
            </div>
            {errors.price && <p className="text-xs font-bold text-red-500">{errors.price.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-black text-gray-900 uppercase tracking-widest">Location</label>
            <div className="relative">
              <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                {...register('location')}
                className={cn(
                  "w-full pl-14 pr-6 py-4 rounded-2xl border-2 outline-none transition-all",
                  errors.location ? "border-red-100 bg-red-50 focus:border-red-500" : "border-gray-100 bg-gray-50 focus:border-orange-500 focus:bg-white"
                )}
                placeholder="City, State"
              />
            </div>
            {errors.location && <p className="text-xs font-bold text-red-500">{errors.location.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-black text-gray-900 uppercase tracking-widest">Description</label>
          <textarea
            {...register('description')}
            rows={5}
            className={cn(
              "w-full px-6 py-4 rounded-2xl border-2 outline-none transition-all resize-none",
              errors.description ? "border-red-100 bg-red-50 focus:border-red-500" : "border-gray-100 bg-gray-50 focus:border-orange-500 focus:bg-white"
            )}
            placeholder="Tell potential buyers about your pet's personality, habits, and health..."
          />
          {errors.description && <p className="text-xs font-bold text-red-500">{errors.description.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "w-full py-5 rounded-2xl text-lg font-black transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3",
            isSubmitting ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-orange-500 text-white hover:bg-orange-600 shadow-orange-200"
          )}
        >
          {isSubmitting ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-6 h-6 border-4 border-gray-300 border-t-orange-500 rounded-full"
              />
              Publishing Listing...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-6 h-6" />
              List Pet for Sale
            </>
          )}
        </button>
      </form>
    </div>
  );
}
