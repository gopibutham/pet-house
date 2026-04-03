export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  createdAt: string;
}

export interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: string;
  price: number;
  description: string;
  images: string[];
  sellerId: string;
  sellerName: string;
  sellerEmail: string;
  sellerPhone?: string;
  location: string;
  status: 'available' | 'sold';
  isOfficial?: boolean;
  stockCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  petId: string;
  petName: string;
  petImage: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  price: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
}

export type PetSpecies = 'Dog' | 'Cat' | 'Bird' | 'Fish' | 'Rabbit' | 'Other';
