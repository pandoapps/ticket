import { useTranslation } from 'react-i18next';
import { MembersAreaManager } from '@components/MembersAreaManager';
import { adminMembersAreaService } from '@services/membersAreaService';
import { adminNav } from './nav';

export function AdminEventContentPage() {
  const { t } = useTranslation();

  return (
    <MembersAreaManager
      service={adminMembersAreaService}
      nav={adminNav}
      panelTitle={t('admin.panel')}
      eventsBasePath="/admin/eventos"
    />
  );
}
