import React from 'react';
import { Tabs, Card } from 'antd';
import TicketTypeManager from './TicketTypeManager';
import TicketPriorityManager from './TicketPriorityManager';
import TicketCategoryManager from './TicketCategoryManager';
import { useTranslation } from 'react-i18next';

const TicketSettingsManager: React.FC = () => {
  const { t } = useTranslation();

  const items = [
    {
      key: 'types',
      label: t('settings.ticketTypes'),
      children: (
        <Card>
          <TicketTypeManager />
        </Card>
      ),
    },
    {
      key: 'priorities',
      label: t('settings.priorities'),
      children: (
        <Card>
          <TicketPriorityManager />
        </Card>
      ),
    },
    {
      key: 'categories',
      label: t('settings.categories'),
      children: (
        <Card>
          <TicketCategoryManager />
        </Card>
      ),
    },
  ];

  return (
    <div className="ticket-settings-manager">
      <h2>{t('settings.title')}</h2>
      <Tabs
        defaultActiveKey="types"
        items={items}
        size="large"
        tabPosition="left"
        style={{ minHeight: 500 }}
      />
    </div>
  );
};

export default TicketSettingsManager; 