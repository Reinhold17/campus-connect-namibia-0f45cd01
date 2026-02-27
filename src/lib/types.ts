export type UserRole = 'student' | 'tutor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'pending' | 'approved' | 'suspended';
  university?: string;
  subjects?: string[];
  rating?: number;
  reviewCount?: number;
  bio?: string;
  avatar?: string;
  createdAt: string;
}

export interface Session {
  id: string;
  tutorId: string;
  tutorName: string;
  type: 'group' | 'one-on-one';
  price: number;
  subject: string;
  location: string;
  date: string;
  time: string;
  maxStudents: number;
  enrolledStudents: string[];
}

export interface Booking {
  id: string;
  studentId: string;
  sessionId: string;
  paymentMethod: 'bank_deposit' | 'cash';
  paymentStatus: 'pending' | 'confirmed';
  proofOfPayment?: string;
  status: 'reserved' | 'completed';
}

export interface Review {
  id: string;
  tutorId: string;
  studentId: string;
  studentName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  read: boolean;
  createdAt: string;
}
