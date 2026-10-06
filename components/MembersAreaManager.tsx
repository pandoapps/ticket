import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@components/AppLayout';
import { PageHeader } from '@components/PageHeader';
import { Modal } from '@components/Modal';
import { Empty } from '@components/Empty';
import { useToast } from '@components/Toast';
import { useConfirm } from '@components/ConfirmDialog';
import { ActionIconButton } from '@components/ActionIconButton';
import { Icons } from '@components/Icon';
import {
  type EventLesson,
  type EventModule,
  type LessonMaterial,
  type LessonPayload,
  type MaterialPayload,
  type MembersArea,
  type MembersAreaApi,
  type ModulePayload,
} from '@services/membersAreaService';
import type { ApiError } from '@services/api';

interface NavItem {
  to: string;
  label: string;
  icon?: ReactNode;
}

interface MembersAreaManagerProps {
  service: MembersAreaApi;
  nav: NavItem[];
  panelTitle: string;
  eventsBasePath: string;
}

interface LessonModalState {
  moduleId: number;
  editing: EventLesson | null;
}

interface MaterialModalState {
  lessonId: number;
  editing: LessonMaterial | null;
}

export function MembersAreaManager({ service, nav, panelTitle, eventsBasePath }: MembersAreaManagerProps) {
  const { t } = useTranslation();
  const { id } = useParams();
  const eventId = Number(id);
  const toast = useToast();
  const confirm = useConfirm();

  const [area, setArea] = useState<MembersArea | null>(null);
  const [loading, setLoading] = useState(true);
  const [moduleModal, setModuleModal] = useState<{ editing: EventModule | null } | null>(null);
  const [lessonModal, setLessonModal] = useState<LessonModalState | null>(null);
  const [materialModal, setMaterialModal] = useState<MaterialModalState | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await service.show(eventId);
      setArea(res.data);
    } catch (err) {
      toast.error((err as ApiError).message);
    } finally {
      setLoading(false);
    }
  }, [eventId, service, toast]);

  useEffect(() => { load(); }, [load]);

  async function handleToggle() {
    try {
      const res = await service.toggle(eventId);
      toast.success(res.data.members_area_enabled ? t('members_area.accessEnabled') : t('members_area.accessDisabled'));
      load();
    } catch (err) {
      toast.error((err as ApiError).message);
    }
  }

  async function handleDeleteModule(module: EventModule) {
    const ok = await confirm({
      title: t('members_area.deleteModuleTitle'),
      description: t('members_area.deleteModuleDesc', { title: module.title }),
      confirmText: t('common.delete'),
      cancelText: t('common.cancel'),
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await service.destroyModule(module.id);
      toast.success(t('members_area.moduleDeleted'));
      load();
    } catch (err) {
      toast.error((err as ApiError).message);
    }
  }

  async function handleDeleteLesson(lesson: EventLesson) {
    const ok = await confirm({
      title: t('members_area.deleteLessonTitle'),
      description: t('members_area.deleteLessonDesc', { title: lesson.title }),
      confirmText: t('common.delete'),
      cancelText: t('common.cancel'),
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await service.destroyLesson(lesson.id);
      toast.success(t('members_area.lessonDeleted'));
      load();
    } catch (err) {
      toast.error((err as ApiError).message);
    }
  }

  async function handleDeleteMaterial(material: LessonMaterial) {
    const ok = await confirm({
      title: t('members_area.deleteMaterialTitle'),
      description: t('members_area.deleteMaterialDesc', { title: material.title }),
      confirmText: t('common.delete'),
      cancelText: t('common.cancel'),
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await service.destroyMaterial(material.id);
      toast.success(t('members_area.materialDeleted'));
      load();
    } catch (err) {
      toast.error((err as ApiError).message);
    }
  }

  async function moveModule(index: number, direction: -1 | 1) {
    if (!area) return;
    const reordered = swap(area.modules, index, direction);
    if (!reordered) return;
    try {
      await Promise.all(
        reordered.map((module, position) =>
          module.sort_order === position + 1
            ? Promise.resolve()
            : service.updateModule(module.id, { title: module.title, description: module.description, sort_order: position + 1 }),
        ),
      );
      load();
    } catch (err) {
      toast.error((err as ApiError).message);
    }
  }

  async function moveLesson(module: EventModule, index: number, direction: -1 | 1) {
    const reordered = swap(module.lessons ?? [], index, direction);
    if (!reordered) return;
    try {
      await Promise.all(
        reordered.map((lesson, position) =>
          lesson.sort_order === position + 1
            ? Promise.resolve()
            : service.updateLesson(lesson.id, {
                title: lesson.title,
                description: lesson.description,
                video_url: lesson.video_url,
                duration_minutes: lesson.duration_minutes,
                sort_order: position + 1,
              }),
        ),
      );
      load();
    } catch (err) {
      toast.error((err as ApiError).message);
    }
  }

  if (loading || !area) {
    return (
      <AppLayout title={panelTitle} nav={nav}>
        <p className="text-slate-500">{t('common.loading')}</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={panelTitle} nav={nav}>
      <PageHeader
        title={t('members_area.title')}
        description={area.event_name}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Link to={`${eventsBasePath}/${eventId}`} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100">
              {t('members_area.backToEvent')}
            </Link>
            <button
              onClick={handleToggle}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${area.members_area_enabled ? 'border border-rose-300 text-rose-700 hover:bg-rose-50' : 'bg-brand-600 text-white hover:bg-brand-700'}`}
            >
              {area.members_area_enabled ? t('members_area.disable') : t('members_area.enable')}
            </button>
            <button onClick={() => setModuleModal({ editing: null })} className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700">
              {t('members_area.newModule')}
            </button>
          </div>
        }
      />

      <p className={`mb-4 rounded-lg p-3 text-sm ${area.members_area_enabled ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
        {area.members_area_enabled ? t('members_area.enabled') : t('members_area.disabled')}
      </p>

      {area.modules.length === 0 ? (
        <Empty title={t('members_area.noModules')} description={t('members_area.noModulesDesc')} />
      ) : (
        <div className="space-y-4">
          {area.modules.map((module, moduleIndex) => (
            <section key={module.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
                <div>
                  <h3 className="font-semibold text-slate-900">{module.title}</h3>
                  {module.description && <p className="mt-0.5 text-sm text-slate-500">{module.description}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <ActionIconButton onClick={() => moveModule(moduleIndex, -1)} label={t('members_area.moveUp')} icon={<Icons.arrowUp className="h-4 w-4" />} />
                  <ActionIconButton onClick={() => moveModule(moduleIndex, 1)} label={t('members_area.moveDown')} icon={<Icons.arrowDown className="h-4 w-4" />} />
                  <ActionIconButton onClick={() => setModuleModal({ editing: module })} tone="brand" label={t('common.edit')} icon={<Icons.pencil className="h-4 w-4" />} />
                  <ActionIconButton onClick={() => handleDeleteModule(module)} tone="danger" label={t('common.delete')} icon={<Icons.trash className="h-4 w-4" />} />
                  <button
                    onClick={() => setLessonModal({ moduleId: module.id, editing: null })}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100"
                  >
                    {t('members_area.newLesson')}
                  </button>
                </div>
              </div>

              {(module.lessons?.length ?? 0) === 0 ? (
                <p className="px-4 py-4 text-sm text-slate-500">{t('members_area.noLessons')}</p>
              ) : (
                <ul className="divide-y divide-slate-200">
                  {module.lessons?.map((lesson, lessonIndex) => (
                    <li key={lesson.id} className="px-4 py-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="flex min-w-0 items-start gap-2">
                          <Icons.play className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                          <div className="min-w-0">
                            <p className="font-medium text-slate-900">{lesson.title}</p>
                            <p className="text-xs text-slate-500">
                              {lesson.duration_minutes !== null && `${t('members_area.minutes', { count: lesson.duration_minutes })} • `}
                              {lesson.video_url ?? t('members_area.noVideo')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <ActionIconButton onClick={() => moveLesson(module, lessonIndex, -1)} label={t('members_area.moveUp')} icon={<Icons.arrowUp className="h-4 w-4" />} />
                          <ActionIconButton onClick={() => moveLesson(module, lessonIndex, 1)} label={t('members_area.moveDown')} icon={<Icons.arrowDown className="h-4 w-4" />} />
                          <ActionIconButton onClick={() => setLessonModal({ moduleId: module.id, editing: lesson })} tone="brand" label={t('common.edit')} icon={<Icons.pencil className="h-4 w-4" />} />
                          <ActionIconButton onClick={() => handleDeleteLesson(lesson)} tone="danger" label={t('common.delete')} icon={<Icons.trash className="h-4 w-4" />} />
                          <button
                            onClick={() => setMaterialModal({ lessonId: lesson.id, editing: null })}
                            className="rounded-lg border border-slate-300 px-2 py-1 text-xs hover:bg-slate-100"
                          >
                            {t('members_area.newMaterial')}
                          </button>
                        </div>
                      </div>

                      {(lesson.materials?.length ?? 0) > 0 && (
                        <ul className="mt-2 space-y-1 pl-6">
                          {lesson.materials?.map((material) => (
                            <li key={material.id} className="flex items-center justify-between gap-2 text-sm">
                              <a href={material.url} target="_blank" rel="noreferrer" className="flex min-w-0 items-center gap-1.5 text-brand-700 hover:underline">
                                <Icons.link className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">{material.title}</span>
                              </a>
                              <span className="flex items-center gap-1">
                                <ActionIconButton onClick={() => setMaterialModal({ lessonId: lesson.id, editing: material })} tone="brand" label={t('common.edit')} icon={<Icons.pencil className="h-3.5 w-3.5" />} />
                                <ActionIconButton onClick={() => handleDeleteMaterial(material)} tone="danger" label={t('common.delete')} icon={<Icons.trash className="h-3.5 w-3.5" />} />
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      )}

      <ModuleFormModal
        state={moduleModal}
        service={service}
        eventId={eventId}
        onClose={() => setModuleModal(null)}
        onSaved={() => { setModuleModal(null); load(); }}
      />
      <LessonFormModal
        state={lessonModal}
        service={service}
        onClose={() => setLessonModal(null)}
        onSaved={() => { setLessonModal(null); load(); }}
      />
      <MaterialFormModal
        state={materialModal}
        service={service}
        onClose={() => setMaterialModal(null)}
        onSaved={() => { setMaterialModal(null); load(); }}
      />
    </AppLayout>
  );
}

function swap<T>(items: T[], index: number, direction: -1 | 1): T[] | null {
  const target = index + direction;
  if (target < 0 || target >= items.length) return null;
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

function FieldError({ errors, field }: { errors: Record<string, string[]>; field: string }) {
  if (!errors[field]) return null;
  return <span className="text-sm text-rose-600">{errors[field][0]}</span>;
}

function ModuleFormModal({ state, service, eventId, onClose, onSaved }: {
  state: { editing: EventModule | null } | null;
  service: MembersAreaApi;
  eventId: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t } = useTranslation();
  const toast = useToast();
  const [form, setForm] = useState<ModulePayload>({ title: '', description: '' });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!state) return;
    setForm({ title: state.editing?.title ?? '', description: state.editing?.description ?? '' });
    setErrors({});
  }, [state]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!state) return;
    setErrors({});
    setSaving(true);
    try {
      if (state.editing) await service.updateModule(state.editing.id, form);
      else await service.createModule(eventId, form);
      toast.success(t('members_area.moduleSaved'));
      onSaved();
    } catch (err) {
      const apiErr = err as ApiError;
      setErrors(apiErr.errors ?? {});
      toast.error(Object.values(apiErr.errors ?? {}).flat()[0] ?? apiErr.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={state !== null} onClose={onClose} title={state?.editing ? t('members_area.editModule') : t('members_area.newModule')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-900">{t('members_area.moduleTitle')}</label>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <FieldError errors={errors} field="title" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-900">{t('members_area.description')}</label>
          <textarea value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <FieldError errors={errors} field="description" />
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100">{t('common.cancel')}</button>
          <button type="submit" disabled={saving} className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60">
            {saving ? t('common.saving') : t('common.save')}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function LessonFormModal({ state, service, onClose, onSaved }: {
  state: LessonModalState | null;
  service: MembersAreaApi;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t } = useTranslation();
  const toast = useToast();
  const [form, setForm] = useState<LessonPayload>({ title: '' });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!state) return;
    setForm({
      title: state.editing?.title ?? '',
      description: state.editing?.description ?? '',
      video_url: state.editing?.video_url ?? '',
      duration_minutes: state.editing?.duration_minutes ?? null,
    });
    setErrors({});
  }, [state]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!state) return;
    setErrors({});
    setSaving(true);
    const payload: LessonPayload = { ...form, video_url: form.video_url || null };
    try {
      if (state.editing) await service.updateLesson(state.editing.id, payload);
      else await service.createLesson(state.moduleId, payload);
      toast.success(t('members_area.lessonSaved'));
      onSaved();
    } catch (err) {
      const apiErr = err as ApiError;
      setErrors(apiErr.errors ?? {});
      toast.error(Object.values(apiErr.errors ?? {}).flat()[0] ?? apiErr.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={state !== null} onClose={onClose} title={state?.editing ? t('members_area.editLesson') : t('members_area.newLesson')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-900">{t('members_area.lessonTitle')}</label>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <FieldError errors={errors} field="title" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-900">{t('members_area.description')}</label>
          <textarea value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <FieldError errors={errors} field="description" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-900">{t('members_area.videoUrl')}</label>
          <input value={form.video_url ?? ''} onChange={(e) => setForm({ ...form, video_url: e.target.value })} type="url" placeholder="https://" className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <p className="mt-1 text-xs text-slate-500">{t('members_area.videoUrlHint')}</p>
          <FieldError errors={errors} field="video_url" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-900">{t('members_area.durationMinutes')}</label>
          <input
            value={form.duration_minutes ?? ''}
            onChange={(e) => setForm({ ...form, duration_minutes: e.target.value === '' ? null : Number(e.target.value) })}
            type="number"
            min={0}
            className="mt-1 block w-32 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <FieldError errors={errors} field="duration_minutes" />
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100">{t('common.cancel')}</button>
          <button type="submit" disabled={saving} className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60">
            {saving ? t('common.saving') : t('common.save')}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function MaterialFormModal({ state, service, onClose, onSaved }: {
  state: MaterialModalState | null;
  service: MembersAreaApi;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t } = useTranslation();
  const toast = useToast();
  const [form, setForm] = useState<MaterialPayload>({ title: '', url: '' });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!state) return;
    setForm({ title: state.editing?.title ?? '', url: state.editing?.url ?? '' });
    setErrors({});
  }, [state]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!state) return;
    setErrors({});
    setSaving(true);
    try {
      if (state.editing) await service.updateMaterial(state.editing.id, form);
      else await service.createMaterial(state.lessonId, form);
      toast.success(t('members_area.materialSaved'));
      onSaved();
    } catch (err) {
      const apiErr = err as ApiError;
      setErrors(apiErr.errors ?? {});
      toast.error(Object.values(apiErr.errors ?? {}).flat()[0] ?? apiErr.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={state !== null} onClose={onClose} title={state?.editing ? t('members_area.editMaterial') : t('members_area.newMaterial')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-900">{t('members_area.materialTitle')}</label>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <FieldError errors={errors} field="title" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-900">{t('members_area.materialUrl')}</label>
          <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} type="url" required placeholder="https://" className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <FieldError errors={errors} field="url" />
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100">{t('common.cancel')}</button>
          <button type="submit" disabled={saving} className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60">
            {saving ? t('common.saving') : t('common.save')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
