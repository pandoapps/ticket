import { api } from './api';

export interface LessonMaterial {
  id: number;
  event_lesson_id: number;
  title: string;
  url: string;
  sort_order: number;
}

export interface EventLesson {
  id: number;
  event_module_id: number;
  title: string;
  description: string | null;
  video_url: string | null;
  duration_minutes: number | null;
  sort_order: number;
  materials?: LessonMaterial[];
}

export interface EventModule {
  id: number;
  event_id: number;
  title: string;
  description: string | null;
  sort_order: number;
  lessons?: EventLesson[];
}

export interface MembersArea {
  event_id: number;
  event_name: string;
  members_area_enabled: boolean;
  modules: EventModule[];
}

export interface ModulePayload {
  title: string;
  description?: string | null;
  sort_order?: number;
}

export interface LessonPayload {
  title: string;
  description?: string | null;
  video_url?: string | null;
  duration_minutes?: number | null;
  sort_order?: number;
}

export interface MaterialPayload {
  title: string;
  url: string;
  sort_order?: number;
}

function makeMembersAreaService(prefix: '/producer' | '/admin') {
  return {
    show: (eventId: number) => api.get<{ data: MembersArea }>(`${prefix}/events/${eventId}/members-area`),
    toggle: (eventId: number) =>
      api.post<{ data: { members_area_enabled: boolean } }>(`${prefix}/events/${eventId}/members-area/toggle`),

    createModule: (eventId: number, payload: ModulePayload) =>
      api.post<{ data: EventModule }>(`${prefix}/events/${eventId}/modules`, payload),
    updateModule: (moduleId: number, payload: Partial<ModulePayload>) =>
      api.put<{ data: EventModule }>(`${prefix}/modules/${moduleId}`, payload),
    destroyModule: (moduleId: number) => api.delete<void>(`${prefix}/modules/${moduleId}`),

    createLesson: (moduleId: number, payload: LessonPayload) =>
      api.post<{ data: EventLesson }>(`${prefix}/modules/${moduleId}/lessons`, payload),
    updateLesson: (lessonId: number, payload: Partial<LessonPayload>) =>
      api.put<{ data: EventLesson }>(`${prefix}/lessons/${lessonId}`, payload),
    destroyLesson: (lessonId: number) => api.delete<void>(`${prefix}/lessons/${lessonId}`),

    createMaterial: (lessonId: number, payload: MaterialPayload) =>
      api.post<{ data: LessonMaterial }>(`${prefix}/lessons/${lessonId}/materials`, payload),
    updateMaterial: (materialId: number, payload: Partial<MaterialPayload>) =>
      api.put<{ data: LessonMaterial }>(`${prefix}/materials/${materialId}`, payload),
    destroyMaterial: (materialId: number) => api.delete<void>(`${prefix}/materials/${materialId}`),
  };
}

export type MembersAreaApi = ReturnType<typeof makeMembersAreaService>;

export const producerMembersAreaService = makeMembersAreaService('/producer');
export const adminMembersAreaService = makeMembersAreaService('/admin');

export interface CourseSummary {
  id: number;
  slug: string;
  name: string;
  short_description: string | null;
  banner_url: string | null;
  header_url: string | null;
  modules_count: number;
  lessons_count: number;
}

export interface CourseContent {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  banner_url: string | null;
  header_url: string | null;
  modules: EventModule[];
}

export const customerCourseService = {
  list: () => api.get<{ data: CourseSummary[] }>('/customer/courses'),
  show: (eventId: number) => api.get<{ data: CourseContent }>(`/customer/courses/${eventId}`),
};
