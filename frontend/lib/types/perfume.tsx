export interface PerfumeResponse {
  success: boolean;
  count: number;
  data: Perfume[];
}

export interface Perfume {
  _id: string;
  perfumeName: string;
  uri: string;
  price: number;
  concentration: string;
  description: string;
  ingredients: string;
  volume: number;
  targetAudience: string;
  comments: Comment[];
  brand: Brand;
  createdAt: string;
  updatedAt: string;
}

interface Comment {
  _id: string;
  rating: number;
  content: string;
  author: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Brand {
  _id: string;
  brandName: string;
  createdAt: string;
  updatedAt: string;
}
