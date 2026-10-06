import { useTranslation } from 'react-i18next';
import { MembersAreaManager } from '@components/MembersAreaManager';
import { producerMembersAreaService } from '@services/membersAreaService';
import { producerNav } from './nav';

export function EventContentPage() {
  const { t } = useTranslation();

  return (
    <MembersAreaManager
      service={producerMembersAreaService}
      nav={producerNav}
      panelTitle={t('producer.panel')}
      eventsBasePath="/produtor/eventos"
    />
  );
}
