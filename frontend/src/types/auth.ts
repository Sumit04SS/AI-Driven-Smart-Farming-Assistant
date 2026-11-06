export interface User {
  id: number;
  name: string;
  email: string;
  created_at?: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  status: string;
  message: string;
  access_token?: string;
  token_type?: string;
  user?: User;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
}
