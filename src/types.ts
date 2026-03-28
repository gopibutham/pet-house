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
  createdAt: string;
  updatedAt: string;
}

export type PetSpecies = 'Dog' | 'Cat' | 'Bird' | 'Fish' | 'Rabbit' | 'Other';
