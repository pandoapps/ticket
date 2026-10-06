import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@components/AppLayout';
import { PageHeader } from '@components/PageHeader';
import { Empty } from '@components/Empty';
import { useToast } from '@components/Toast';
import { Icons } from '@components/Icon';
import { customerNav } from './nav';
import { customerCourseService, type CourseSummary } from '@services/membersAreaService';
import type { ApiError } from '@services/api';

export function MyCoursesPage() {
  const { t } = useTranslation();
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    customerCourseService
      .list()
      .then((r) => setCourses(r.data))
      .catch((err: ApiError) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [toast]);

  return (
    <AppLayout title="Ticketeira" nav={customerNav}>
      <PageHeader title={t('my_courses.title')} description={t('my_courses.description')} />

      {loading ? (
        <p className="text-slate-500">{t('common.loading')}</p>
      ) : courses.length === 0 ? (
        <Empty title={t('my_courses.noCourses')} description={t('my_courses.noCoursesDesc')} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <article key={course.id} className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
              {course.banner_url ? (
                <img src={course.banner_url} className="h-36 w-full object-cover" alt="" />
              ) : (
                <div className="flex h-36 w-full items-center justify-center bg-brand-50">
                  <Icons.book className="h-10 w-10 text-brand-300" />
                </div>
              )}
              <div className="flex flex-1 flex-col gap-3 p-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{course.name}</h3>
                  {course.short_description && <p className="mt-0.5 text-sm text-slate-500">{course.short_description}</p>}
                  <p className="mt-2 text-xs text-slate-500">
                    {t('my_courses.modulesCount', { count: course.modules_count })} • {t('my_courses.lessonsCount', { count: course.lessons_count })}
                  </p>
                </div>
                <Link
                  to={`/meus-cursos/${course.id}`}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
                >
                  <Icons.play className="h-4 w-4" />
                  {t('my_courses.access')}
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
