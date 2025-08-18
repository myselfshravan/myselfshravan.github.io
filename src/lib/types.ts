import { Timestamp } from 'firebase/firestore';
import { DeviceDetectorResult } from 'device-detector-js';

export interface Command {
  command: string;
  response?: string; // AI response (for ai type commands)
  type: 'terminal' | 'ai';
  timestamp: Timestamp;
}

export interface ButtonInteraction {
  category: string; // "project", "blog", "contact", "navigation", "social"
  identifier: string; // "NoteRep", "AI-Blog-Post", "email", "github"
  action: string; // "view_github", "visit_site", "read_post", "contact_click"
  context?: {
    section: string; // "hero", "projects", "writing", "contact"
    position?: number; // index in list (for projects/blogs)
    url?: string; // destination URL for external links
    metadata?: Record<string, unknown>; // additional context data
  };
  timestamp: string;
}

export interface ExternalLinkClick {
  url: string;
  title: string;
  count: number;
  firstClick: string;
  lastClick: string;
}

export interface UserData {
  userId: string;
  firstVisit: Timestamp;
  lastVisit: Timestamp;
  totalVisits: number;
  // External link tracking
  interactionv2?: { [urlHash: string]: ExternalLinkClick };
  device?: DeviceInfo;
}

export interface DeviceInfo {
  deviceType: string;
  appName: string; // Browser or App name
  metadata?: DeviceDetectorResult; // Additional metadata if needed
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
