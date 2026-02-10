import { useMemo, useRef, useState } from 'react';
import { Course, Language, Lesson, LocalizedText } from '../types';

type StudentPanelProps = {
  courses: Course[];
  lang: Language;
};

type TabKey = 'definition' | 'facts' | 'history' | 'space' | 'scientists' | 'quiz';

const getText = (value?: LocalizedText, lang: Language = 'ar') => {
  if (!value) return '';
  return value[lang] || value.ar || value.en || '';
};

const summarizeText = (text: string, maxLength: number) => {
  const clean = text.trim().replace(/\s+/g, ' ');
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength - 1)}…`;
};

const StudentPanel = ({ courses, lang }: StudentPanelProps) => {
  const [activeTab, setActiveTab] = useState<TabKey>('definition');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const detailsRef = useRef<HTMLDivElement | null>(null);

  const t = {
    ar: {
      heroTitle: '\u0627\u0643\u062A\u0634\u0641 \u0639\u0627\u0644\u0645 \u0627\u0644\u0645\u0639\u0631\u0641\u0629',
      heroSubtitle: '\u0631\u062D\u0644\u0629 \u062A\u0639\u0644\u064A\u0645\u064A\u0629 \u0645\u0645\u062A\u0639\u0629 \u0639\u0628\u0631 \u0645\u062E\u062A\u0644\u0641 \u0627\u0644\u0639\u0644\u0648\u0645 \u0648\u0627\u0644\u0645\u062C\u0627\u0644\u0627\u062A. \u062A\u0639\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0639\u0644\u0645\u0627\u0621\u060C \u0627\u0644\u062A\u0627\u0631\u064A\u062E\u060C \u0648\u0627\u062E\u062A\u0628\u0631 \u0645\u0639\u0644\u0648\u0645\u0627\u062A\u0643.',
      explore: '\u0627\u0633\u062A\u0643\u0634\u0641 \u0627\u0644\u0645\u0632\u064A\u062F',
      back: '\u0631\u062C\u0648\u0639',
      spotlight: '\u0645\u0648\u0636\u0648\u0639 \u062A\u0639\u0644\u064A\u0645\u064A',
      courseSummary: '\u0645\u0644\u062E\u0635 \u0627\u0644\u0645\u0627\u062F\u0629',
      courseHistory: '\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0645\u0627\u062F\u0629',
      courseFacts: '\u062D\u0642\u0627\u0626\u0642 \u0627\u0644\u0645\u0627\u062F\u0629',
      courseSpace: '\u0627\u0644\u0641\u0636\u0627\u0621',
      courseScientists: '\u0639\u0644\u0645\u0627\u0621 \u0627\u0644\u0645\u0627\u062F\u0629',
      definition: '\u0627\u0644\u062A\u0639\u0631\u064A\u0641',
      facts: '\u062D\u0642\u0627\u0626\u0642',
      history: '\u0627\u0644\u062A\u0627\u0631\u064A\u062E',
      space: '\u0627\u0644\u0641\u0636\u0627\u0621',
      scientists: '\u0627\u0644\u0639\u0644\u0645\u0627\u0621',
      quiz: '\u0627\u062E\u062A\u0628\u0627\u0631',
      quizEmpty: '\u0644\u0627 \u064A\u0648\u062C\u062F \u0627\u062E\u062A\u0628\u0627\u0631 \u0644\u0647\u0630\u0627 \u0627\u0644\u0645\u0633\u0627\u0642 \u0628\u0639\u062F.',
      definitionTitle: '\u0627\u0644\u062A\u0639\u0631\u064A\u0641 \u0648\u0627\u0644\u0634\u0631\u062D',
      lessons: '\u0627\u0644\u062F\u0631\u0648\u0633',
      chooseLesson: '\u0627\u062E\u062A\u0631 \u062F\u0631\u0633\u0627\u064B \u0644\u0644\u0627\u0646\u062A\u0642\u0627\u0644 \u0625\u0644\u064A\u0647 \u0648\u0639\u0631\u0636 \u0634\u0631\u062D\u0647',
      currentLesson: '\u0627\u0644\u062F\u0631\u0633 \u0627\u0644\u0645\u062D\u062F\u062F',
      searchPlaceholder: '\u0627\u0628\u062D\u062B \u0639\u0646 \u0645\u0627\u062F\u0629 \u0623\u0648 \u062F\u0631\u0633...',
      filterAll: '\u0643\u0644 \u0627\u0644\u0645\u0648\u0627\u062F',
      statsCourses: '\u0645\u0648\u0627\u062F',
      statsLessons: '\u062F\u0631\u0648\u0633',
      statsMinutes: '\u062F\u0642\u0627\u0626\u0642',
      noResults: '\u0644\u0627 \u064A\u0648\u062C\u062F \u0646\u062A\u0627\u0626\u062C \u062A\u0637\u0627\u0628\u0642 \u0627\u0644\u0628\u062D\u062B.'
    },
    en: {
      heroTitle: 'Discover the world of knowledge',
      heroSubtitle: 'An enjoyable learning journey across sciences and fields. Meet scientists, explore history, and test your knowledge.',
      explore: 'Explore more',
      back: 'Back',
      spotlight: 'Learning topic',
      courseSummary: 'Subject summary',
      courseHistory: 'Subject history',
      courseFacts: 'Subject facts',
      courseSpace: 'Space',
      courseScientists: 'Subject scientists',
      definition: 'Definition',
      facts: 'Facts',
      history: 'History',
      space: 'Space',
      scientists: 'Scientists',
      quiz: 'Quiz',
      quizEmpty: 'No quiz available for this course yet.',
      definitionTitle: 'Definition & Overview',
      lessons: 'Lessons',
      chooseLesson: 'Pick a lesson to jump into it and see the explanation',
      currentLesson: 'Selected lesson',
      searchPlaceholder: 'Search for a subject or lesson...',
      filterAll: 'All subjects',
      statsCourses: 'Subjects',
      statsLessons: 'Lessons',
      statsMinutes: 'Minutes',
      noResults: 'No results match your search.'
    }
  }[lang];

  const selectedCourse = useMemo(
    () => courses.find(course => course.id === selectedCourseId) || null,
    [courses, selectedCourseId]
  );

  const selectedLesson: Lesson | undefined = useMemo(() => {
    if (!selectedCourse?.lessons?.length) return undefined;
    if (!selectedLessonId) return undefined;
    return selectedCourse.lessons.find(lesson => lesson.id === selectedLessonId);
  }, [selectedCourse, selectedLessonId]);

  const categories = useMemo(() => {
    const values = courses
      .map(course => getText(course.category, lang))
      .filter(Boolean);
    return Array.from(new Set(values));
  }, [courses, lang]);

  const filteredCourses = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return courses.filter(course => {
      const title = getText(course.title, lang).toLowerCase();
      const desc = getText(course.description, lang).toLowerCase();
      const category = getText(course.category, lang);
      const matchesTerm = !term || title.includes(term) || desc.includes(term);
      const matchesCategory = categoryFilter === 'all' || category === categoryFilter;
      return matchesTerm && matchesCategory;
    });
  }, [courses, lang, searchTerm, categoryFilter]);

  const stats = useMemo(() => {
    const lessons = courses.reduce((sum, course) => sum + (course.lessons?.length || 0), 0);
    const minutes = courses.reduce((sum, course) => {
      return sum + (course.lessons || []).reduce((lsum, lesson) => {
        const parsed = Number(lesson.duration || 0);
        return lsum + (Number.isFinite(parsed) ? parsed : 0);
      }, 0);
    }, 0);
    return { courses: courses.length, lessons, minutes };
  }, [courses]);


  const tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: 'definition', label: t.definition, icon: 'fa-book-open' },
    { key: 'facts', label: t.facts, icon: 'fa-lightbulb' },
    { key: 'history', label: t.history, icon: 'fa-history' },
    { key: 'space', label: t.space, icon: 'fa-planet-ringed' },
    { key: 'scientists', label: t.scientists, icon: 'fa-users' },
    { key: 'quiz', label: t.quiz, icon: 'fa-circle-question' }
  ];

  if (!courses.length) {
    return null;
  }

  if (!selectedCourse) {
    return (
      <div className="space-y-10">
        <section className="soft-card rounded-3xl p-8 md:p-10 text-center space-y-4">
          <h1 className="text-3xl md:text-5xl font-bold text-[#0f766e]">{t.heroTitle}</h1>
          <p className="text-slate-600 text-base md:text-lg">{t.heroSubtitle}</p>
        </section>

        <section className="soft-card rounded-3xl p-6 md:p-8 space-y-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[220px]">
              <div className="relative">
                <i className="fas fa-magnifying-glass text-slate-400 absolute left-4 top-1/2 -translate-y-1/2"></i>
                <input
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-[#0f766e] outline-none input-soft"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-4 py-2 rounded-full text-xs font-semibold ${categoryFilter === 'all' ? 'btn-primary' : 'btn-outline'}`}
              >
                {t.filterAll}
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setCategoryFilter(category)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold ${categoryFilter === category ? 'btn-primary' : 'btn-outline'}`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-100 bg-white p-4 text-center">
              <p className="text-xs text-slate-500">{t.statsCourses}</p>
              <p className="text-2xl font-bold text-slate-900">{stats.courses}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-4 text-center">
              <p className="text-xs text-slate-500">{t.statsLessons}</p>
              <p className="text-2xl font-bold text-slate-900">{stats.lessons}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-4 text-center">
              <p className="text-xs text-slate-500">{t.statsMinutes}</p>
              <p className="text-2xl font-bold text-slate-900">{stats.minutes}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          {filteredCourses.length === 0 ? (
            <div className="soft-card rounded-3xl p-6 text-center text-slate-500">
              {t.noResults}
            </div>
          ) : (
            filteredCourses.map(course => (
            <article key={course.id} className="soft-card rounded-3xl overflow-hidden">
              <img src={course.thumbnail} alt={getText(course.title, lang)} className="w-full h-56 object-cover" />
              <div className="p-6 text-center space-y-3">
                <h3 className="text-2xl font-bold text-slate-900">{getText(course.title, lang)}</h3>
                <p className="text-slate-600">{summarizeText(getText(course.description, lang), 140)}</p>
                <div className="flex items-center justify-center gap-3 text-xs text-slate-500">
                  <span>{course.lessons?.length || 0} {t.statsLessons}</span>
                  <span>•</span>
                  <span>
                    {(course.lessons || []).reduce((sum, lesson) => {
                      const parsed = Number(lesson.duration || 0);
                      return sum + (Number.isFinite(parsed) ? parsed : 0);
                    }, 0)} {t.statsMinutes}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSelectedCourseId(course.id);
                    setSelectedLessonId(null);
                    setActiveTab('definition');
                  }}
                  className="btn-primary px-6 py-3 rounded-2xl text-sm font-semibold inline-flex items-center gap-2"
                >
                  <span>{t.explore}</span>
                  <i className="fas fa-arrow-left"></i>
                </button>
              </div>
            </article>
            ))
          )}
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <button
        onClick={() => {
          setSelectedCourseId(null);
          setSelectedLessonId(null);
        }}
        className="btn-outline px-5 py-2 rounded-full text-sm font-semibold inline-flex items-center gap-2"
      >
        <i className="fas fa-arrow-right"></i>
        {t.back}
      </button>

      <section className="glass rounded-[2.5rem] p-6 md:p-10">
        <div className="grid gap-8 md:grid-cols-[1.1fr_1fr] items-center">
          <div className="relative">
            <img
              src={selectedCourse.thumbnail}
              alt={getText(selectedCourse.title, lang)}
              className="w-full h-[280px] md:h-[320px] object-cover rounded-[2rem] shadow-2xl"
            />
          </div>
          <div className="space-y-4">
            <span className="badge px-4 py-2 rounded-full text-xs font-semibold inline-flex items-center gap-2">
              <i className="fas fa-book-open"></i>
              {t.spotlight}
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-[#0f766e]">
              {getText(selectedCourse.title, lang)}
            </h2>
            <p className="text-slate-600 text-base md:text-lg">
              {getText(selectedCourse.description, lang)}
            </p>
          </div>
        </div>
      </section>

      <section className="soft-card rounded-3xl p-6 md:p-8 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs text-slate-500">{getText(selectedCourse.category, lang)}</span>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-100 bg-white p-4 space-y-2">
            <h4 className="text-sm font-semibold text-[#0f766e]">{t.courseSummary}</h4>
            <p className="text-sm text-slate-600">{summarizeText(getText(selectedCourse.description, lang), 180) || '-'}</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-4 space-y-2">
            <h4 className="text-sm font-semibold text-[#0f766e]">{t.courseHistory}</h4>
            <p className="text-sm text-slate-600">{getText(selectedCourse.history, lang) || '-'}</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-4 space-y-2">
            <h4 className="text-sm font-semibold text-[#0f766e]">{t.courseFacts}</h4>
            <p className="text-sm text-slate-600">{getText(selectedCourse.facts, lang) || '-'}</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-4 space-y-2">
            <h4 className="text-sm font-semibold text-[#0f766e]">{t.courseSpace}</h4>
            <p className="text-sm text-slate-600">{getText(selectedCourse.space, lang) || '-'}</p>
          </div>
        </div>
        
      </section>

      <section className="soft-card rounded-3xl p-6 md:p-8 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-lg font-bold text-slate-800">{t.lessons}</h3>
          {selectedLesson && (
            <span className="text-xs text-slate-500">
              {t.currentLesson}: {getText(selectedLesson.title, lang)}
            </span>
          )}
        </div>
        <p className="text-sm text-slate-500">{t.chooseLesson}</p>
        <div className="flex flex-wrap gap-3">
          {selectedCourse.lessons.map(lesson => (
            <button
              key={lesson.id}
              onClick={() => {
                setSelectedLessonId(lesson.id);
                setActiveTab('definition');
                requestAnimationFrame(() => {
                  detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                });
              }}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                selectedLesson?.id === lesson.id
                  ? 'btn-primary'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-[#0f766e]'
              }`}
            >
              {getText(lesson.title, lang)}
            </button>
          ))}
        </div>
      </section>

      {selectedLesson && (
        <>
          <section className="soft-card rounded-3xl p-4 md:p-6" ref={detailsRef}>
            <div className="flex flex-wrap gap-3">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold inline-flex items-center gap-2 transition-all ${
                    activeTab === tab.key
                      ? 'btn-primary'
                      : 'bg-white border border-slate-200 text-slate-600 hover:text-[#0f766e]'
                  }`}
                >
                  <i className={`fas ${tab.icon}`}></i>
                  {tab.label}
                </button>
              ))}
            </div>
          </section>

          <section className="soft-card rounded-3xl p-6 md:p-8">
            {activeTab === 'definition' && (
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-[#0f766e]">{t.definitionTitle}</h3>
                <p className="text-slate-600">{getText(selectedLesson.content, lang)}</p>
              </div>
            )}
            {activeTab === 'facts' && (
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-[#0f766e]">{t.facts}</h3>
                <p className="text-slate-600">{getText(selectedLesson.facts, lang) || '-'}</p>
              </div>
            )}
            {activeTab === 'history' && (
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-[#0f766e]">{t.history}</h3>
                <p className="text-slate-600">{getText(selectedLesson.history, lang) || '-'}</p>
              </div>
            )}
            {activeTab === 'space' && (
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-[#0f766e]">{t.space}</h3>
                <p className="text-slate-600">{getText(selectedLesson.space, lang) || '-'}</p>
              </div>
            )}
            {activeTab === 'scientists' && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-[#0f766e]">{t.scientists}</h3>
                {selectedLesson.scientists && selectedLesson.scientists.length ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {selectedLesson.scientists.map((s, idx) => (
                      <div key={`${getText(s.name, lang)}-${idx}`} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50">
                        <img src={s.image} alt={getText(s.name, lang)} className="w-16 h-16 rounded-2xl object-cover" />
                        <div>
                          <p className="font-semibold text-slate-800">{getText(s.name, lang)}</p>
                          <p className="text-xs text-slate-500 mt-1">{getText(s.bio, lang)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500">-</p>
                )}
              </div>
            )}
            {activeTab === 'quiz' && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-[#0f766e]">{t.quiz}</h3>
                {selectedCourse.quiz && selectedCourse.quiz.length ? (
                  <div className="space-y-4">
                    {selectedCourse.quiz.map((q, idx) => (
                      <div key={`${idx}`} className="p-4 rounded-2xl border border-slate-100 bg-slate-50">
                        <p className="font-semibold text-slate-800">{idx + 1}. {getText(q.question, lang)}</p>
                        <div className="grid gap-1 text-xs text-slate-500 mt-2">
                          {q.options.map((opt, oIdx) => (
                            <span key={`${idx}-${oIdx}`}>• {getText(opt, lang)}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500">{t.quizEmpty}</p>
                )}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default StudentPanel;
