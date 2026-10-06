import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@components/AppLayout';
import { useToast } from '@components/Toast';
import { Icons } from '@components/Icon';
import { customerNav } from './nav';
import { customerCourseService, type CourseContent, type EventLesson } from '@services/membersAreaService';
import { toVideoEmbed } from '@utils/video';
import type { ApiError } from '@services/api';

export function CoursePlayerPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const eventId = Number(id);
  const toast = useToast();

  const [course, setCourse] = useState<CourseContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [openModules, setOpenModules] = useState<Set<number>>(new Set());

  useEffect(() => {
    customerCourseService
      .show(eventId)
      .then((r) => {
        setCourse(r.data);
        const firstModule = r.data.modules.find((module) => (module.lessons?.length ?? 0) > 0);
        setOpenModules(new Set(r.data.modules.map((module) => module.id)));
        setSelectedLessonId(firstModule?.lessons?.[0]?.id ?? null);
      })
      .catch((err: ApiError) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [eventId, toast]);

  const selectedLesson = useMemo<EventLesson | null>(() => {
    if (!course || selectedLessonId === null) return null;
    for (const module of course.modules) {
      const lesson = module.lessons?.find((item) => item.id === selectedLessonId);
      if (lesson) return lesson;
    }
    return null;
  }, [course, selectedLessonId]);

  const embed = useMemo(() => toVideoEmbed(selectedLesson?.video_url ?? null), [selectedLesson]);

  function toggleModule(moduleId: number) {
    setOpenModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  }

  if (loading) {
    return (
      <AppLayout title="Ticketeira" nav={customerNav}>
        <p className="text-slate-500">{t('common.loading')}</p>
      </AppLayout>
    );
  }

  if (!course) {
    return (
      <AppLayout title="Ticketeira" nav={customerNav}>
        <Link to="/meus-cursos" className="inline-flex items-center gap-1 text-sm text-brand-700 hover:underline">
          <Icons.chevronLeft className="h-4 w-4" />
          {t('my_courses.back')}
        </Link>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Ticketeira" nav={customerNav}>
      <div className="mb-4">
        <Link to="/meus-cursos" className="inline-flex items-center gap-1 text-sm text-brand-700 hover:underline">
          <Icons.chevronLeft className="h-4 w-4" />
          {t('my_courses.back')}
        </Link>
        <h1 className="mt-1 text-xl font-semibold text-slate-900">{course.name}</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-black">
            {selectedLesson === null ? (
              <div className="flex aspect-video items-center justify-center bg-slate-100">
                <p className="text-sm text-slate-500">{t('my_courses.selectLesson')}</p>
              </div>
            ) : embed === null ? (
              <div className="flex aspect-video items-center justify-center bg-slate-100">
                <p className="text-sm text-slate-500">{t('my_courses.noVideo')}</p>
              </div>
            ) : embed.kind === 'video' ? (
              <video key={embed.src} src={embed.src} controls className="aspect-video w-full" />
            ) : (
              <iframe
                key={embed.src}
                src={embed.src}
                title={selectedLesson.title}
                className="aspect-video w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
              />
            )}
          </div>

          {selectedLesson && (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-semibold text-slate-900">{selectedLesson.title}</h2>
                {selectedLesson.duration_minutes !== null && (
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Icons.clock className="h-3.5 w-3.5" />
                    {t('my_courses.minutes', { count: selectedLesson.duration_minutes })}
                  </span>
                )}
              </div>
              {selectedLesson.description && (
                <p className="mt-2 whitespace-pre-line text-sm text-slate-600">{selectedLesson.description}</p>
              )}

              {(selectedLesson.materials?.length ?? 0) > 0 && (
                <div className="mt-4 border-t border-slate-200 pt-3">
                  <h3 className="text-sm font-semibold text-slate-900">{t('my_courses.materials')}</h3>
                  <ul className="mt-2 space-y-1.5">
                    {selectedLesson.materials?.map((material) => (
                      <li key={material.id}>
                        <a
                          href={material.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-brand-700 hover:underline"
                        >
                          <Icons.link className="h-3.5 w-3.5" />
                          {material.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white lg:self-start">
          {course.modules.map((module) => {
            const isOpen = openModules.has(module.id);
            return (
              <div key={module.id} className="border-b border-slate-200 last:border-b-0">
                <button
                  type="button"
                  onClick={() => toggleModule(module.id)}
                  className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left hover:bg-slate-50"
                >
                  <span className="font-medium text-slate-900">{module.title}</span>
                  <span className="flex items-center gap-2 text-xs text-slate-500">
                    {t('my_courses.lessonsCount', { count: module.lessons?.length ?? 0 })}
                    <Icons.chevronDown className={`h-4 w-4 transition ${isOpen ? 'rotate-180' : ''}`} />
                  </span>
                </button>
                {isOpen && (
                  <ul>
                    {module.lessons?.map((lesson) => {
                      const active = lesson.id === selectedLessonId;
                      return (
                        <li key={lesson.id}>
                          <button
                            type="button"
                            onClick={() => setSelectedLessonId(lesson.id)}
                            className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition ${active ? 'bg-brand-50 font-medium text-brand-700' : 'text-slate-600 hover:bg-slate-50'}`}
                          >
                            <Icons.play className={`h-4 w-4 shrink-0 ${active ? 'text-brand-600' : 'text-slate-400'}`} />
                            <span className="min-w-0 flex-1 truncate">{lesson.title}</span>
                            {lesson.duration_minutes !== null && (
                              <span className="shrink-0 text-xs text-slate-400">{lesson.duration_minutes} min</span>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </aside>
      </div>
    </AppLayout>
  );
}
