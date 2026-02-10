import { ActivityEntry } from '../types';

export type Progress = {
  xp: number;
  completedLessons: string[];
  streak: number;
  lastActivity: string | null;
};

const KEY = 'progress';
const ACTIVITY_KEY = 'activity_log';

const todayISO = () => new Date().toISOString().slice(0, 10);

const startOfWeekISO = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
};

export function getProgress(): Progress {
  return (
    JSON.parse(localStorage.getItem(KEY) || 'null') || {
      xp: 0,
      completedLessons: [],
      streak: 0,
      lastActivity: null
    }
  );
}

export function saveProgress(p: Progress) {
  localStorage.setItem(KEY, JSON.stringify(p));
}

export function getActivityLog(): ActivityEntry[] {
  return JSON.parse(localStorage.getItem(ACTIVITY_KEY) || '[]');
}

export function saveActivityLog(entries: ActivityEntry[]) {
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(entries));
}

const updateStreak = (progress: Progress) => {
  const today = todayISO();
  const last = progress.lastActivity;
  if (!last) {
    progress.streak = 1;
    progress.lastActivity = today;
    return;
  }

  if (last === today) {
    return;
  }

  const lastDate = new Date(last);
  const expected = new Date(lastDate);
  expected.setDate(lastDate.getDate() + 1);

  if (expected.toISOString().slice(0, 10) === today) {
    progress.streak += 1;
  } else {
    progress.streak = 1;
  }
  progress.lastActivity = today;
};

export function addXp(xpGain: number) {
  const p = getProgress();
  p.xp += xpGain;
  updateStreak(p);
  saveProgress(p);

  const entries = getActivityLog();
  entries.push({ date: todayISO(), xp: xpGain });
  saveActivityLog(entries);
}

export function completeLesson(lessonId: string, xpGain = 20) {
  const p = getProgress();
  if (!p.completedLessons.includes(lessonId)) {
    p.completedLessons.push(lessonId);
    p.xp += xpGain;
    updateStreak(p);
    saveProgress(p);

    const entries = getActivityLog();
    entries.push({ date: todayISO(), xp: xpGain });
    saveActivityLog(entries);
  }
}

export function getLevel(xp: number) {
  return Math.floor(xp / 100) + 1;
}

export function getWeeklyXp(entries = getActivityLog()) {
  const weekStart = startOfWeekISO();
  return entries
    .filter(entry => entry.date >= weekStart)
    .reduce((total, entry) => total + entry.xp, 0);
}