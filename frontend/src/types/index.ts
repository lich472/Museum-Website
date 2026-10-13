export type IExhibition = {
  _id: string; 
  title: string;
  description: string;
  imageUrl: string; 
  startDate: string; 
  endDate: string; 
  status: 'current' | 'upcoming' | 'past';
  room: string;
  tags: string[];
  isHighlight: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  address: string;
}

export type UserStore = {
    user: User | null,
    loading: boolean,
    checkingAuth: boolean,
    signup: ({ name, email, address, password, confirmPassword }: {
        name: string,
        email: string,
        address: string,
        password: string,
        confirmPassword: string,
    }) => Promise<string | undefined>,
    login: (email: string, password: string) => Promise<void>,
    logout: () => Promise<void>,
    checkAuth: () => Promise<void>,
    refreshToken: () => Promise<void>
}
