export type UserRole = "admin" | "premium" | "user";

export type AuthUser = {
  access_blocked: boolean;
  avatar_url: string;
  email: string;
  name: string;
  role: UserRole;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  message: string;
  user: AuthUser;
};

export type BackendLoginResponse = LoginResponse & {
  token: string;
};

export type SessionResponse = {
  user: AuthUser;
};

export type ProfileResponse = SessionResponse;

export type BackendProfileResponse = {
  user: Omit<AuthUser, "access_blocked"> & {
    access_blocked?: boolean;
    id: number;
  };
};
