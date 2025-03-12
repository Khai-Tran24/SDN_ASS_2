export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  YOB: number;
  gender: boolean;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    _id: string;
    accessToken: string;
    refreshToken: string;
  };
}
