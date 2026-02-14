import { useMemo, useState } from 'react';
import { Course, Language, Lesson, QuizQuestion, LocalizedText, Scientist, AboutContent } from '../types';

type AdminPanelProps = {
  courses: Course[];
  lang: Language;
  aboutContent: AboutContent;
  defaultAdminPassword: string;
  onChangeAdminPassword: (current: string, next: string) => { ok: boolean; message: string };
  onUpdateAbout: (about: AboutContent) => void;
  onAddCourse: (course: Course) => void;
  onUpdateCourse: (course: Course) => void;
  onDeleteCourse: (id: string) => void;
  onReplaceCourses: (courses: Course[]) => void;
};

const emptyLocalized = (): LocalizedText => ({ ar: '', en: '' });

const createEmptyScientist = (): Scientist => ({
  name: emptyLocalized(),
  bio: emptyLocalized(),
  image: ''
});

const createEmptyQuestion = (): QuizQuestion => ({
  question: emptyLocalized(),
  options: [emptyLocalized(), emptyLocalized(), emptyLocalized(), emptyLocalized()],
  correctAnswer: 0
});

const createEmptyCourse = (): Course => ({
  id: '',
  title: emptyLocalized(),
  description: emptyLocalized(),
  category: emptyLocalized(),
  thumbnail: '',
  history: emptyLocalized(),
  facts: emptyLocalized(),
  space: emptyLocalized(),
  quiz: [],
  lessons: [
    {
      id: 'lesson-1',
      title: emptyLocalized(),
      content: emptyLocalized(),
      history: emptyLocalized(),
      facts: emptyLocalized(),
      space: emptyLocalized(),
      scientists: [],
      duration: '30'
    }
  ]
});

const slugify = (value: string) => {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  if (slug) return slug;
  return `course-${Date.now().toString(36)}`;
};

const cloneCourse = (course: Course): Course => JSON.parse(JSON.stringify(course));

const AdminPanel = ({
  courses,
  lang,
  aboutContent,
  defaultAdminPassword,
  onChangeAdminPassword,
  onUpdateAbout,
  onAddCourse,
  onDeleteCourse,
  onUpdateCourse,
  onReplaceCourses
}: AdminPanelProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Course>(createEmptyCourse());
  const [error, setError] = useState<string | null>(null);
  const [adminSection, setAdminSection] = useState<'courses' | 'about' | 'security'>('courses');
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '' });
  const [passwordMessage, setPasswordMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const t = {
    ar: {
      title: '\u0644\u0648\u062D\u0629 \u0627\u0644\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0630\u0643\u064A\u0629',
      subtitle: '\u0623\u0646\u0634\u0626 \u0645\u0633\u0627\u0642\u0627\u062A \u062C\u062F\u064A\u062F\u0629 \u0623\u0648 \u062D\u0633\u0646 \u0627\u0644\u0645\u062D\u062A\u0648\u0649 \u0627\u0644\u062D\u0627\u0644\u064A \u062E\u0644\u0627\u0644 \u062F\u0642\u0627\u0626\u0642.',
      courses: '\u0627\u0644\u0645\u0633\u0627\u0642\u0627\u062A',
      create: '\u0625\u0646\u0634\u0627\u0621 \u0645\u0633\u0627\u0642',
      edit: '\u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u0645\u0633\u0627\u0642',
      delete: '\u062D\u0630\u0641',
      save: '\u062D\u0641\u0638',
      cancel: '\u0625\u0644\u063A\u0627\u0621',
      courseTitleAr: '\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0645\u0633\u0627\u0642 (\u0639\u0631\u0628\u064A)',
      courseTitleEn: '\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0645\u0633\u0627\u0642 (\u0625\u0646\u062C\u0644\u064A\u0632\u064A)',
      courseDescAr: '\u0648\u0635\u0641 \u0627\u0644\u0645\u0633\u0627\u0642 (\u0639\u0631\u0628\u064A)',
      courseDescEn: '\u0648\u0635\u0641 \u0627\u0644\u0645\u0633\u0627\u0642 (\u0625\u0646\u062C\u0644\u064A\u0632\u064A)',
      categoryAr: '\u0627\u0644\u062A\u062E\u0635\u0635 (\u0639\u0631\u0628\u064A)',
      categoryEn: '\u0627\u0644\u062A\u062E\u0635\u0635 (\u0625\u0646\u062C\u0644\u064A\u0632\u064A)',
      historyAr: '\u0627\u0644\u062A\u0627\u0631\u064A\u062E (\u0639\u0631\u0628\u064A)',
      historyEn: '\u0627\u0644\u062A\u0627\u0631\u064A\u062E (\u0625\u0646\u062C\u0644\u064A\u0632\u064A)',
      factsAr: '\u062D\u0642\u0627\u0626\u0642 (\u0639\u0631\u0628\u064A)',
      factsEn: '\u062D\u0642\u0627\u0626\u0642 (\u0625\u0646\u062C\u0644\u064A\u0632\u064A)',
      spaceAr: '\u0627\u0644\u0641\u0636\u0627\u0621 (\u0639\u0631\u0628\u064A)',
      spaceEn: '\u0627\u0644\u0641\u0636\u0627\u0621 (\u0625\u0646\u062C\u0644\u064A\u0632\u064A)',
      thumbnail: '\u0635\u0648\u0631\u0629 \u0627\u0644\u063A\u0644\u0627\u0641 (\u0631\u0627\u0628\u0637)',
      lessons: '\u0627\u0644\u062F\u0631\u0648\u0633',
      addLesson: '\u0625\u0636\u0627\u0641\u0629 \u062F\u0631\u0633',
      lessonTitleAr: '\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u062F\u0631\u0633 (\u0639\u0631\u0628\u064A)',
      lessonTitleEn: '\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u062F\u0631\u0633 (\u0625\u0646\u062C\u0644\u064A\u0632\u064A)',
      lessonContentAr: '\u0645\u062D\u062A\u0648\u0649 \u0627\u0644\u062F\u0631\u0633 (\u0639\u0631\u0628\u064A)',
      lessonContentEn: '\u0645\u062D\u062A\u0648\u0649 \u0627\u0644\u062F\u0631\u0633 (\u0625\u0646\u062C\u0644\u064A\u0632\u064A)',
      lessonHistoryAr: '\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u062F\u0631\u0633 (\u0639\u0631\u0628\u064A)',
      lessonHistoryEn: '\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u062F\u0631\u0633 (\u0625\u0646\u062C\u0644\u064A\u0632\u064A)',
      lessonFactsAr: '\u062D\u0642\u0627\u0626\u0642 \u0627\u0644\u062F\u0631\u0633 (\u0639\u0631\u0628\u064A)',
      lessonFactsEn: '\u062D\u0642\u0627\u0626\u0642 \u0627\u0644\u062F\u0631\u0633 (\u0625\u0646\u062C\u0644\u064A\u0632\u064A)',
      lessonSpaceAr: '\u0627\u0644\u0641\u0636\u0627\u0621 (\u0639\u0631\u0628\u064A)',
      lessonSpaceEn: '\u0627\u0644\u0641\u0636\u0627\u0621 (\u0625\u0646\u062C\u0644\u064A\u0632\u064A)',
      lessonDuration: '\u0627\u0644\u0645\u062F\u0629 (\u062F\u0642\u064A\u0642\u0629)',
      scientistsEditor: '\u0639\u0644\u0645\u0627\u0621 \u0627\u0644\u062F\u0631\u0633',
      addScientist: '\u0625\u0636\u0627\u0641\u0629 \u0639\u0627\u0644\u0645',
      scientistNameAr: '\u0627\u0633\u0645 \u0627\u0644\u0639\u0627\u0644\u0645 (\u0639\u0631\u0628\u064A)',
      scientistNameEn: '\u0627\u0633\u0645 \u0627\u0644\u0639\u0627\u0644\u0645 (\u0625\u0646\u062C\u0644\u064A\u0632\u064A)',
      scientistBioAr: '\u0646\u0628\u0630\u0629 (\u0639\u0631\u0628\u064A)',
      scientistBioEn: '\u0646\u0628\u0630\u0629 (\u0625\u0646\u062C\u0644\u064A\u0632\u064A)',
      scientistImage: '\u0635\u0648\u0631\u0629 \u0627\u0644\u0639\u0627\u0644\u0645 (\u0631\u0627\u0628\u0637)',
      quizEditor: '\u062A\u062D\u0631\u064A\u0631 \u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631',
      addQuestion: '\u0625\u0636\u0627\u0641\u0629 \u0633\u0624\u0627\u0644',
      questionAr: '\u0627\u0644\u0633\u0624\u0627\u0644 (\u0639\u0631\u0628\u064A)',
      questionEn: '\u0627\u0644\u0633\u0624\u0627\u0644 (\u0625\u0646\u062C\u0644\u064A\u0632\u064A)',
      optionAr: '\u0627\u0644\u062E\u064A\u0627\u0631 (\u0639\u0631\u0628\u064A)',
      optionEn: '\u0627\u0644\u062E\u064A\u0627\u0631 (\u0625\u0646\u062C\u0644\u064A\u0632\u064A)',
      correctAnswer: '\u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0627\u0644\u0635\u062D\u064A\u062D\u0629',
      removeScientist: '\u062D\u0630\u0641 \u0627\u0644\u0639\u0627\u0644\u0645',
      removeQuestion: '\u062D\u0630\u0641 \u0627\u0644\u0633\u0624\u0627\u0644',
      required: '\u0627\u0644\u0631\u062C\u0627\u0621 \u062A\u0639\u0628\u0626\u0629 \u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0645\u0633\u0627\u0642 \u0648\u0627\u0644\u0648\u0635\u0641 \u0648\u0627\u0644\u062A\u062E\u0635\u0635 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644.',
      lessonUp: '\u0623\u0639\u0644\u0649',
      lessonDown: '\u0623\u0633\u0641\u0644',
      quizReady: '\u062A\u0645 \u062D\u0641\u0638 \u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631 \u0644\u0644\u0645\u0633\u0627\u0642.'
    },
    en: {
      title: 'Smart Admin Panel',
      subtitle: 'Create new courses or refine existing content in minutes.',
      courses: 'Courses',
      create: 'Create course',
      edit: 'Edit course',
      delete: 'Delete',
      save: 'Save',
      cancel: 'Cancel',
      courseTitleAr: 'Course title (Arabic)',
      courseTitleEn: 'Course title (English)',
      courseDescAr: 'Course description (Arabic)',
      courseDescEn: 'Course description (English)',
      categoryAr: 'Category (Arabic)',
      categoryEn: 'Category (English)',
      historyAr: 'History (Arabic)',
      historyEn: 'History (English)',
      factsAr: 'Facts (Arabic)',
      factsEn: 'Facts (English)',
      spaceAr: 'Space (Arabic)',
      spaceEn: 'Space (English)',
      thumbnail: 'Cover image URL',
      lessons: 'Lessons',
      addLesson: 'Add lesson',
      lessonTitleAr: 'Lesson title (Arabic)',
      lessonTitleEn: 'Lesson title (English)',
      lessonContentAr: 'Lesson content (Arabic)',
      lessonContentEn: 'Lesson content (English)',
      lessonHistoryAr: 'Lesson history (Arabic)',
      lessonHistoryEn: 'Lesson history (English)',
      lessonFactsAr: 'Lesson facts (Arabic)',
      lessonFactsEn: 'Lesson facts (English)',
      lessonSpaceAr: 'Space (Arabic)',
      lessonSpaceEn: 'Space (English)',
      lessonDuration: 'Duration (min)',
      scientistsEditor: '\u0639\u0644\u0645\u0627\u0621 \u0627\u0644\u062F\u0631\u0633',
      addScientist: '\u0625\u0636\u0627\u0641\u0629 \u0639\u0627\u0644\u0645',
      scientistNameAr: '\u0627\u0633\u0645 \u0627\u0644\u0639\u0627\u0644\u0645 (\u0639\u0631\u0628\u064A)',
      scientistNameEn: '\u0627\u0633\u0645 \u0627\u0644\u0639\u0627\u0644\u0645 (\u0625\u0646\u062C\u0644\u064A\u0632\u064A)',
      scientistBioAr: '\u0646\u0628\u0630\u0629 (\u0639\u0631\u0628\u064A)',
      scientistBioEn: '\u0646\u0628\u0630\u0629 (\u0625\u0646\u062C\u0644\u064A\u0632\u064A)',
      scientistImage: '\u0635\u0648\u0631\u0629 \u0627\u0644\u0639\u0627\u0644\u0645 (\u0631\u0627\u0628\u0637)',
      quizEditor: '\u062A\u062D\u0631\u064A\u0631 \u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631',
      addQuestion: '\u0625\u0636\u0627\u0641\u0629 \u0633\u0624\u0627\u0644',
      questionAr: '\u0627\u0644\u0633\u0624\u0627\u0644 (\u0639\u0631\u0628\u064A)',
      questionEn: '\u0627\u0644\u0633\u0624\u0627\u0644 (\u0625\u0646\u062C\u0644\u064A\u0632\u064A)',
      optionAr: '\u0627\u0644\u062E\u064A\u0627\u0631 (\u0639\u0631\u0628\u064A)',
      optionEn: '\u0627\u0644\u062E\u064A\u0627\u0631 (\u0625\u0646\u062C\u0644\u064A\u0632\u064A)',
      correctAnswer: '\u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0627\u0644\u0635\u062D\u064A\u062D\u0629',
      removeScientist: '\u062D\u0630\u0641 \u0627\u0644\u0639\u0627\u0644\u0645',
      removeQuestion: '\u062D\u0630\u0641 \u0627\u0644\u0633\u0624\u0627\u0644',
      required: 'Please fill in title, description, and category at minimum.',
      lessonUp: 'Up',
      lessonDown: 'Down',
      quizReady: 'Quiz saved for this course.'
    }
  }[lang];

  const selectedCourse = useMemo(
    () => courses.find(course => course.id === selectedId) || null,
    [courses, selectedId]
  );

  const handleSelectCourse = (course: Course) => {
    setSelectedId(course.id);
    setDraft(cloneCourse(course));
    setError(null);
  };

  const handleReset = () => {
    setSelectedId(null);
    setDraft(createEmptyCourse());
    setError(null);
  };

  const handlePasswordChange = () => {
    const result = onChangeAdminPassword(passwordForm.current, passwordForm.next);
    setPasswordMessage({ ok: result.ok, text: result.message });
    if (result.ok) {
      setPasswordForm({ current: '', next: '' });
    }
  };

  const updateLesson = (index: number, patch: Partial<Lesson>) => {
    setDraft(prev => {
      const lessons = [...prev.lessons];
      lessons[index] = { ...lessons[index], ...patch };
      return { ...prev, lessons };
    });
  };

  const updateScientist = (lessonIndex: number, scientistIndex: number, patch: Partial<Scientist>) => {
    setDraft(prev => {
      const lessons = [...prev.lessons];
      const lesson = lessons[lessonIndex];
      const scientists = [...(lesson.scientists || [])];
      scientists[scientistIndex] = { ...scientists[scientistIndex], ...patch };
      lessons[lessonIndex] = { ...lesson, scientists };
      return { ...prev, lessons };
    });
  };

  const addScientist = (lessonIndex: number) => {
    setDraft(prev => {
      const lessons = [...prev.lessons];
      const lesson = lessons[lessonIndex];
      const scientists = [...(lesson.scientists || []), createEmptyScientist()];
      lessons[lessonIndex] = { ...lesson, scientists };
      return { ...prev, lessons };
    });
  };

  const removeScientist = (lessonIndex: number, scientistIndex: number) => {
    setDraft(prev => {
      const lessons = [...prev.lessons];
      const lesson = lessons[lessonIndex];
      const scientists = (lesson.scientists || []).filter((_, idx) => idx !== scientistIndex);
      lessons[lessonIndex] = { ...lesson, scientists };
      return { ...prev, lessons };
    });
  };

  const updateQuizQuestion = (index: number, patch: Partial<QuizQuestion>) => {
    setDraft(prev => {
      const quiz = [...(prev.quiz || [])];
      quiz[index] = { ...quiz[index], ...patch };
      return { ...prev, quiz };
    });
  };

  const addQuizQuestion = () => {
    setDraft(prev => ({ ...prev, quiz: [...(prev.quiz || []), createEmptyQuestion()] }));
  };

  const removeQuizQuestion = (index: number) => {
    setDraft(prev => ({ ...prev, quiz: (prev.quiz || []).filter((_, idx) => idx !== index) }));
  };
  const moveLesson = (index: number, direction: 'up' | 'down') => {
    setDraft(prev => {
      const lessons = [...prev.lessons];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= lessons.length) return prev;
      const [removed] = lessons.splice(index, 1);
      lessons.splice(targetIndex, 0, removed);
      return { ...prev, lessons };
    });
  };

  const removeLesson = (index: number) => {
    setDraft(prev => ({
      ...prev,
      lessons: prev.lessons.filter((_, i) => i !== index)
    }));
  };

  const addLesson = () => {
    setDraft(prev => ({
      ...prev,
      lessons: [
        ...prev.lessons,
        {
          id: `lesson-${prev.lessons.length + 1}`,
          title: emptyLocalized(),
          content: emptyLocalized(),
          history: emptyLocalized(),
          facts: emptyLocalized(),
          space: emptyLocalized(),
          scientists: [],
          duration: '30'
        }
      ]
    }));
  };

  const handleSave = () => {
    if (!draft.title.ar.trim() && !draft.title.en.trim()) {
      setError(t.required);
      return;
    }

    const prepared: Course = {
      ...draft,
      id: draft.id.trim() || slugify(draft.title.en || draft.title.ar),
      quiz: draft.quiz || [],
      lessons: draft.lessons.map((lesson, idx) => ({
        ...lesson,
        id: lesson.id.trim() || `lesson-${idx + 1}`,
        scientists: lesson.scientists || [],
        duration: lesson.duration.trim() || '30'
      }))
    };

    if (selectedCourse) {
      onUpdateCourse(prepared);
    } else {
      onAddCourse(prepared);
    }

    handleReset();
  };

  return (
    <div className="space-y-10">
      <section className="glass rounded-[2.5rem] p-8 md:p-12">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900">{t.title}</h1>
          <p className="text-slate-600 max-w-2xl">{t.subtitle}</p>
        </div>
      </section>

      <div className="soft-card rounded-3xl p-4 flex flex-wrap gap-3">
        <button
          onClick={() => setAdminSection('courses')}
          className={`px-5 py-2 rounded-full text-sm font-semibold ${
            adminSection === 'courses' ? 'btn-primary' : 'btn-outline'
          }`}
        >
          {lang === 'ar' ? '\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0645\u0648\u0627\u062F \u0648\u0627\u0644\u062F\u0631\u0648\u0633' : 'Edit courses & lessons'}
        </button>
        <button
          onClick={() => setAdminSection('about')}
          className={`px-5 py-2 rounded-full text-sm font-semibold ${
            adminSection === 'about' ? 'btn-primary' : 'btn-outline'
          }`}
        >
          {lang === 'ar' ? '\u062A\u0639\u062F\u064A\u0644 \u0639\u0646 \u0627\u0644\u0645\u0646\u0635\u0629' : 'Edit About page'}
        </button>
        <button
          onClick={() => setAdminSection('security')}
          className={`px-5 py-2 rounded-full text-sm font-semibold ${
            adminSection === 'security' ? 'btn-primary' : 'btn-outline'
          }`}
        >
          {lang === 'ar' ? '\u062A\u063A\u064A\u064A\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631' : 'Change password'}
        </button>
      </div>

      {adminSection === 'about' && (
      <section className="soft-card rounded-3xl p-6 md:p-8 space-y-4">
        <h3 className="text-sm font-semibold text-slate-700">
          {lang === 'ar' ? '\u0645\u062D\u062A\u0648\u0649 \u0635\u0641\u062D\u0629 \u0639\u0646 \u0627\u0644\u0645\u0646\u0635\u0629' : 'About page content'}
        </h3>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500">
              {lang === 'ar' ? '\u0627\u0644\u0639\u0646\u0648\u0627\u0646 (\u0639\u0631\u0628\u064A)' : 'Title (Arabic)'}
            </label>
            <input
              value={aboutContent.title.ar}
              onChange={e =>
                onUpdateAbout({
                  ...aboutContent,
                  title: { ...aboutContent.title, ar: e.target.value }
                })
              }
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-[#0f766e] outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500">
              {lang === 'ar' ? '\u0627\u0644\u0639\u0646\u0648\u0627\u0646 (\u0625\u0646\u062C\u0644\u064A\u0632\u064A)' : 'Title (English)'}
            </label>
            <input
              value={aboutContent.title.en}
              onChange={e =>
                onUpdateAbout({
                  ...aboutContent,
                  title: { ...aboutContent.title, en: e.target.value }
                })
              }
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-[#0f766e] outline-none"
            />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500">
              {lang === 'ar' ? '\u0627\u0644\u0641\u0642\u0631\u0629 \u0627\u0644\u0623\u0648\u0644\u0649 (\u0639\u0631\u0628\u064A)' : 'Paragraph 1 (Arabic)'}
            </label>
            <textarea
              value={aboutContent.paragraph1.ar}
              onChange={e =>
                onUpdateAbout({
                  ...aboutContent,
                  paragraph1: { ...aboutContent.paragraph1, ar: e.target.value }
                })
              }
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-[#0f766e] outline-none min-h-[90px]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500">
              {lang === 'ar' ? '\u0627\u0644\u0641\u0642\u0631\u0629 \u0627\u0644\u0623\u0648\u0644\u0649 (\u0625\u0646\u062C\u0644\u064A\u0632\u064A)' : 'Paragraph 1 (English)'}
            </label>
            <textarea
              value={aboutContent.paragraph1.en}
              onChange={e =>
                onUpdateAbout({
                  ...aboutContent,
                  paragraph1: { ...aboutContent.paragraph1, en: e.target.value }
                })
              }
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-[#0f766e] outline-none min-h-[90px]"
            />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500">
              {lang === 'ar' ? '\u0627\u0644\u0641\u0642\u0631\u0629 \u0627\u0644\u062B\u0627\u0646\u064A\u0629 (\u0639\u0631\u0628\u064A)' : 'Paragraph 2 (Arabic)'}
            </label>
            <textarea
              value={aboutContent.paragraph2.ar}
              onChange={e =>
                onUpdateAbout({
                  ...aboutContent,
                  paragraph2: { ...aboutContent.paragraph2, ar: e.target.value }
                })
              }
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-[#0f766e] outline-none min-h-[90px]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500">
              {lang === 'ar' ? '\u0627\u0644\u0641\u0642\u0631\u0629 \u0627\u0644\u062B\u0627\u0646\u064A\u0629 (\u0625\u0646\u062C\u0644\u064A\u0632\u064A)' : 'Paragraph 2 (English)'}
            </label>
            <textarea
              value={aboutContent.paragraph2.en}
              onChange={e =>
                onUpdateAbout({
                  ...aboutContent,
                  paragraph2: { ...aboutContent.paragraph2, en: e.target.value }
                })
              }
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-[#0f766e] outline-none min-h-[90px]"
            />
          </div>
        </div>
      </section>
      )}

      {/* Courses editor */}
      {adminSection === 'courses' && (
      <>
      <section className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="soft-card rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">{t.courses}</h2>
            <button onClick={handleReset} className="text-xs font-semibold text-[#0f766e]">
              {t.create}
            </button>
          </div>
          <div className="space-y-3">
            {courses.map(course => (
              <button
                key={course.id}
                onClick={() => handleSelectCourse(course)}
                className={`w-full text-left px-4 py-3 rounded-2xl border transition-all ${
                  selectedId === course.id
                    ? 'border-[#0f766e] bg-[#ecf8f6]'
                    : 'border-slate-100 bg-white hover:border-[#0f766e]/40'
                }`}
              >
                <p className="text-sm font-semibold text-slate-800">{course.title[lang] || course.title.ar}</p>
                <p className="text-xs text-slate-500 mt-1">{course.category[lang] || course.category.ar}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="soft-card rounded-3xl p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">{selectedCourse ? t.edit : t.create}</h2>
            {selectedCourse && (
              <button
                onClick={() => {
                  onDeleteCourse(selectedCourse.id);
                  handleReset();
                }}
                className="text-xs font-semibold text-rose-600"
              >
                {t.delete}
              </button>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500">{t.courseTitleAr}</label>
              <input
                value={draft.title.ar}
                onChange={e => setDraft(prev => ({ ...prev, title: { ...prev.title, ar: e.target.value } }))}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-[#0f766e] outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500">{t.courseTitleEn}</label>
              <input
                value={draft.title.en}
                onChange={e => setDraft(prev => ({ ...prev, title: { ...prev.title, en: e.target.value } }))}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-[#0f766e] outline-none"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-semibold text-slate-500">{t.courseDescAr}</label>
              <textarea
                value={draft.description.ar}
                onChange={e => setDraft(prev => ({ ...prev, description: { ...prev.description, ar: e.target.value } }))}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-[#0f766e] outline-none min-h-[110px]"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-semibold text-slate-500">{t.courseDescEn}</label>
              <textarea
                value={draft.description.en}
                onChange={e => setDraft(prev => ({ ...prev, description: { ...prev.description, en: e.target.value } }))}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-[#0f766e] outline-none min-h-[110px]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500">{t.categoryAr}</label>
              <input
                value={draft.category.ar}
                onChange={e => setDraft(prev => ({ ...prev, category: { ...prev.category, ar: e.target.value } }))}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-[#0f766e] outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500">{t.categoryEn}</label>
              <input
                value={draft.category.en}
                onChange={e => setDraft(prev => ({ ...prev, category: { ...prev.category, en: e.target.value } }))}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-[#0f766e] outline-none"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-semibold text-slate-500">{t.thumbnail}</label>
              <input
                value={draft.thumbnail}
                onChange={e => setDraft(prev => ({ ...prev, thumbnail: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-[#0f766e] outline-none"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-semibold text-slate-500">{t.historyAr}</label>
              <textarea
                value={draft.history?.ar || ''}
                onChange={e =>
                  setDraft(prev => ({ ...prev, history: { ...prev.history, ar: e.target.value } as LocalizedText }))
                }
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-[#0f766e] outline-none min-h-[90px]"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-semibold text-slate-500">{t.historyEn}</label>
              <textarea
                value={draft.history?.en || ''}
                onChange={e =>
                  setDraft(prev => ({ ...prev, history: { ...prev.history, en: e.target.value } as LocalizedText }))
                }
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-[#0f766e] outline-none min-h-[90px]"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-semibold text-slate-500">{t.factsAr}</label>
              <textarea
                value={draft.facts?.ar || ''}
                onChange={e =>
                  setDraft(prev => ({ ...prev, facts: { ...prev.facts, ar: e.target.value } as LocalizedText }))
                }
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-[#0f766e] outline-none min-h-[90px]"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-semibold text-slate-500">{t.factsEn}</label>
              <textarea
                value={draft.facts?.en || ''}
                onChange={e =>
                  setDraft(prev => ({ ...prev, facts: { ...prev.facts, en: e.target.value } as LocalizedText }))
                }
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-[#0f766e] outline-none min-h-[90px]"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-semibold text-slate-500">{t.spaceAr}</label>
              <textarea
                value={draft.space?.ar || ''}
                onChange={e =>
                  setDraft(prev => ({ ...prev, space: { ...prev.space, ar: e.target.value } as LocalizedText }))
                }
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-[#0f766e] outline-none min-h-[90px]"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-semibold text-slate-500">{t.spaceEn}</label>
              <textarea
                value={draft.space?.en || ''}
                onChange={e =>
                  setDraft(prev => ({ ...prev, space: { ...prev.space, en: e.target.value } as LocalizedText }))
                }
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-[#0f766e] outline-none min-h-[90px]"
              />
            </div>
          </div>

          {/* Lessons editor */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">{t.lessons}</h3>
              <button onClick={addLesson} className="text-xs font-semibold text-[#0f766e]">
                {t.addLesson}
              </button>
            </div>
            <div className="space-y-4">
              {draft.lessons.map((lesson, index) => (
                <div key={`${lesson.id}-${index}`} className="border border-slate-100 rounded-2xl p-4 space-y-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500">{t.lessonTitleAr}</label>
                      <input
                        value={lesson.title.ar}
                        onChange={e => updateLesson(index, { title: { ...lesson.title, ar: e.target.value } })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-[#0f766e] outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500">{t.lessonTitleEn}</label>
                      <input
                        value={lesson.title.en}
                        onChange={e => updateLesson(index, { title: { ...lesson.title, en: e.target.value } })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-[#0f766e] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500">{t.lessonContentAr}</label>
                      <textarea
                        value={lesson.content.ar}
                        onChange={e => updateLesson(index, { content: { ...lesson.content, ar: e.target.value } })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-[#0f766e] outline-none min-h-[90px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500">{t.lessonContentEn}</label>
                      <textarea
                        value={lesson.content.en}
                        onChange={e => updateLesson(index, { content: { ...lesson.content, en: e.target.value } })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-[#0f766e] outline-none min-h-[90px]"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500">{t.lessonHistoryAr}</label>
                      <textarea
                        value={lesson.history?.ar || ''}
                        onChange={e => updateLesson(index, { history: { ...(lesson.history || emptyLocalized()), ar: e.target.value } })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-[#0f766e] outline-none min-h-[80px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500">{t.lessonHistoryEn}</label>
                      <textarea
                        value={lesson.history?.en || ''}
                        onChange={e => updateLesson(index, { history: { ...(lesson.history || emptyLocalized()), en: e.target.value } })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-[#0f766e] outline-none min-h-[80px]"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500">{t.lessonFactsAr}</label>
                      <textarea
                        value={lesson.facts?.ar || ''}
                        onChange={e => updateLesson(index, { facts: { ...(lesson.facts || emptyLocalized()), ar: e.target.value } })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-[#0f766e] outline-none min-h-[80px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500">{t.lessonFactsEn}</label>
                      <textarea
                        value={lesson.facts?.en || ''}
                        onChange={e => updateLesson(index, { facts: { ...(lesson.facts || emptyLocalized()), en: e.target.value } })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-[#0f766e] outline-none min-h-[80px]"
                      />
                    </div>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500">{t.lessonSpaceAr}</label>
                      <textarea
                        value={lesson.space?.ar || ''}
                        onChange={e => updateLesson(index, { space: { ...(lesson.space || emptyLocalized()), ar: e.target.value } })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-[#0f766e] outline-none min-h-[80px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500">{t.lessonSpaceEn}</label>
                      <textarea
                        value={lesson.space?.en || ''}
                        onChange={e => updateLesson(index, { space: { ...(lesson.space || emptyLocalized()), en: e.target.value } })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-[#0f766e] outline-none min-h-[80px]"
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-slate-600">{t.scientistsEditor}</p>
                      <button onClick={() => addScientist(index)} className="text-xs font-semibold text-[#0f766e]">
                        {t.addScientist}
                      </button>
                    </div>

                    {(lesson.scientists || []).length ? (
                      <div className="space-y-3">
                        {(lesson.scientists || []).map((scientist, scientistIndex) => (
                          <div key={`scientist-${index}-${scientistIndex}`} className="border border-slate-200 bg-white rounded-xl p-3 space-y-3">
                            <div className="grid gap-3 md:grid-cols-2">
                              <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500">{t.scientistNameAr}</label>
                                <input
                                  value={scientist.name.ar}
                                  onChange={e => updateScientist(index, scientistIndex, { name: { ...scientist.name, ar: e.target.value } })}
                                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-[#0f766e] outline-none"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500">{t.scientistNameEn}</label>
                                <input
                                  value={scientist.name.en}
                                  onChange={e => updateScientist(index, scientistIndex, { name: { ...scientist.name, en: e.target.value } })}
                                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-[#0f766e] outline-none"
                                />
                              </div>
                            </div>

                            <div className="grid gap-3 md:grid-cols-2">
                              <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500">{t.scientistBioAr}</label>
                                <textarea
                                  value={scientist.bio.ar}
                                  onChange={e => updateScientist(index, scientistIndex, { bio: { ...scientist.bio, ar: e.target.value } })}
                                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-[#0f766e] outline-none min-h-[80px]"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500">{t.scientistBioEn}</label>
                                <textarea
                                  value={scientist.bio.en}
                                  onChange={e => updateScientist(index, scientistIndex, { bio: { ...scientist.bio, en: e.target.value } })}
                                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-[#0f766e] outline-none min-h-[80px]"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-xs font-semibold text-slate-500">{t.scientistImage}</label>
                              <input
                                value={scientist.image}
                                onChange={e => updateScientist(index, scientistIndex, { image: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-[#0f766e] outline-none"
                              />
                            </div>

                            <div className="flex justify-end">
                              <button onClick={() => removeScientist(index, scientistIndex)} className="text-xs text-rose-600 font-semibold">
                                {t.removeScientist}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">-</p>
                    )}
                  </div>

                  <div className="grid gap-3 md:grid-cols-[1fr_160px]">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500">{t.lessonDuration}</label>
                      <input
                        value={lesson.duration}
                        onChange={e => updateLesson(index, { duration: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-[#0f766e] outline-none"
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <button onClick={() => moveLesson(index, 'up')} className="btn-outline px-3 py-2 rounded-full text-xs font-semibold">
                        {t.lessonUp}
                      </button>
                      <button onClick={() => moveLesson(index, 'down')} className="btn-outline px-3 py-2 rounded-full text-xs font-semibold">
                        {t.lessonDown}
                      </button>
                      {draft.lessons.length > 1 && (
                        <button onClick={() => removeLesson(index)} className="text-xs text-rose-600 font-semibold">
                          {t.delete}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quiz editor */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">{t.quizEditor}</h3>
              <button onClick={addQuizQuestion} className="text-xs font-semibold text-[#0f766e]">
                {t.addQuestion}
              </button>
            </div>
            {(draft.quiz || []).length ? (
              <div className="space-y-3">
                {(draft.quiz || []).map((question, qIndex) => (
                  <div key={`quiz-${qIndex}`} className="border border-slate-100 rounded-2xl p-4 space-y-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500">{t.questionAr}</label>
                        <input
                          value={question.question.ar}
                          onChange={e => updateQuizQuestion(qIndex, { question: { ...question.question, ar: e.target.value } })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-[#0f766e] outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500">{t.questionEn}</label>
                        <input
                          value={question.question.en}
                          onChange={e => updateQuizQuestion(qIndex, { question: { ...question.question, en: e.target.value } })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-[#0f766e] outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      {(question.options && question.options.length ? question.options : [emptyLocalized(), emptyLocalized(), emptyLocalized(), emptyLocalized()]).map(
                        (option, optionIndex) => (
                          <div key={`opt-${qIndex}-${optionIndex}`} className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500">
                              {t.optionAr} {optionIndex + 1}
                            </label>
                            <input
                              value={option.ar}
                              onChange={e => {
                                const options = question.options && question.options.length
                                  ? [...question.options]
                                  : [emptyLocalized(), emptyLocalized(), emptyLocalized(), emptyLocalized()];
                                options[optionIndex] = { ...options[optionIndex], ar: e.target.value };
                                updateQuizQuestion(qIndex, { options });
                              }}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-[#0f766e] outline-none"
                            />
                            <label className="text-xs font-semibold text-slate-500">
                              {t.optionEn} {optionIndex + 1}
                            </label>
                            <input
                              value={option.en}
                              onChange={e => {
                                const options = question.options && question.options.length
                                  ? [...question.options]
                                  : [emptyLocalized(), emptyLocalized(), emptyLocalized(), emptyLocalized()];
                                options[optionIndex] = { ...options[optionIndex], en: e.target.value };
                                updateQuizQuestion(qIndex, { options });
                              }}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-[#0f766e] outline-none"
                            />
                          </div>
                        )
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3 items-center">
                      <label className="text-xs font-semibold text-slate-500">{t.correctAnswer}</label>
                      <select
                        value={question.correctAnswer}
                        onChange={e => updateQuizQuestion(qIndex, { correctAnswer: Number(e.target.value) })}
                        className="px-3 py-2 rounded-xl border border-slate-200 focus:border-[#0f766e] outline-none text-sm"
                      >
                        {[0, 1, 2, 3].map(optionIndex => (
                          <option key={`correct-${qIndex}-${optionIndex}`} value={optionIndex}>
                            {optionIndex + 1}
                          </option>
                        ))}
                      </select>
                      <button onClick={() => removeQuizQuestion(qIndex)} className="text-xs text-rose-600 font-semibold">
                        {t.removeQuestion}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">-</p>
            )}
          </div>

          {error && (
            <div className="text-sm text-rose-600 bg-rose-50 border border-rose-100 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button onClick={handleSave} className="btn-primary px-6 py-3 rounded-2xl text-sm font-semibold">
              {t.save}
            </button>
            <button onClick={handleReset} className="btn-outline px-6 py-3 rounded-2xl text-sm font-semibold">
              {t.cancel}
            </button>
          </div>
        </div>
      </section>

      </>
      )}

      {adminSection === 'security' && (
      <section className="soft-card rounded-3xl p-6 md:p-8 space-y-4">
        <h3 className="text-sm font-semibold text-slate-700">
          {lang === 'ar' ? '\u062A\u063A\u064A\u064A\u0631 \u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631 \u0627\u0644\u0645\u0634\u0631\u0641' : 'Admin password'}
        </h3>
        <p className="text-xs text-slate-500">
          {lang === 'ar'
            ? `\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u0627\u0641\u062A\u0631\u0627\u0636\u064A\u0629: ${defaultAdminPassword}`
            : `Default password: ${defaultAdminPassword}`}
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500">
              {lang === 'ar' ? '\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u062D\u0627\u0644\u064A\u0629' : 'Current password'}
            </label>
            <input
              type="password"
              value={passwordForm.current}
              onChange={e => setPasswordForm(prev => ({ ...prev, current: e.target.value }))}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-[#0f766e] outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500">
              {lang === 'ar' ? '\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u062C\u062F\u064A\u062F\u0629' : 'New password'}
            </label>
            <input
              type="password"
              value={passwordForm.next}
              onChange={e => setPasswordForm(prev => ({ ...prev, next: e.target.value }))}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-[#0f766e] outline-none"
            />
          </div>
        </div>
        {passwordMessage && (
          <div className={`text-sm px-4 py-3 rounded-xl border ${passwordMessage.ok ? 'text-emerald-700 bg-emerald-50 border-emerald-100' : 'text-rose-600 bg-rose-50 border-rose-100'}`}>
            {passwordMessage.text}
          </div>
        )}
        <button onClick={handlePasswordChange} className="btn-primary px-6 py-3 rounded-2xl text-sm font-semibold">
          {lang === 'ar' ? '\u062D\u0641\u0638 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631' : 'Save password'}
        </button>
      </section>
      )}
    </div>
  );
};

export default AdminPanel;
