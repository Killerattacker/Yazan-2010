export enum UserRole {
  ADMIN = 'ADMIN',
  STUDENT = 'STUDENT'
}

export type Language = 'ar' | 'en';

export type LocalizedText = {
  ar: string;
  en: string;
};

export interface Scientist {
  name: LocalizedText;
  bio: LocalizedText;
  image: string;
}

export interface Lesson {
  id: string;
  title: LocalizedText;
  content: LocalizedText;
  history?: LocalizedText;
  facts?: LocalizedText;
  space?: LocalizedText;
  scientists?: Scientist[];
  duration: string;
}

export interface QuizQuestion {
  question: LocalizedText;
  options: LocalizedText[];
  correctAnswer: number;
}

export interface Course {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  category: LocalizedText;
  lessons: Lesson[];
  thumbnail: string;
  history?: LocalizedText;
  facts?: LocalizedText;
  space?: LocalizedText;
  scientists?: Scientist[];
  quiz?: QuizQuestion[];
}

export interface AboutContent {
  title: LocalizedText;
  paragraph1: LocalizedText;
  paragraph2: LocalizedText;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
}

export interface ActivityEntry {
  date: string;
  xp: number;
}
