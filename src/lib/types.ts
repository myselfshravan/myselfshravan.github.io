import { Timestamp } from 'firebase/firestore';

export interface Command {
  command: string;
  timestamp: string;
}

export interface UserData {
  userId: string;
  firstVisit: Timestamp;
  lastVisit: Timestamp;
  totalVisits: number;
  commands: Command[];
}

export interface FirebaseConfig {
  apiKey: string | undefined;
  authDomain: string | undefined;
  projectId: string | undefined;
  storageBucket: string | undefined;
  messagingSenderId: string | undefined;
  appId: string | undefined;
  measurementId: string | undefined;
}
