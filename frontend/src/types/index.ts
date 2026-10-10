export type IExhibition = {
  _id: string; // MongoDB auto-generated ID string
  title: string;
  description: string;
  imageUrl: string; // Matches backend
  startDate: string; // Received as ISO string
  endDate: string; // Received as ISO string
  status: 'current' | 'upcoming' | 'past';
  room: string;
  tags: string[];
  isHighlight: boolean;
  createdAt?: string;
  updatedAt?: string;
}
