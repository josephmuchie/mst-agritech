import React, { useCallback, useMemo } from 'react';
import { Badge, Button, Empty, List, Popover, Space, Spin, Tag, Typography } from 'antd';
import { BellOutlined, CheckOutlined } from '@ant-design/icons';
import {
  useGetNotificationsQuery,
  useGetUnreadNotificationCountQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  type NotificationResponse,
} from '../app/apiSlice';
import { useWebSocket } from '../hooks/useWebSocket';

const { Text } = Typography;

const typeColor: Record<string, string> = {
  ORDER: 'blue',
  PAYMENT: 'green',
  SHIPMENT: 'cyan',
  SYSTEM: 'default',
};

interface NotificationBellProps {
  userId?: number;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ userId }) => {
  const { data: unreadData, refetch: refetchCount } = useGetUnreadNotificationCountQuery(undefined, {
    skip: !userId,
    pollingInterval: 60_000,
  });
  const { data: notificationsPage, isLoading, refetch: refetchList } = useGetNotificationsQuery(
    { page: 0, size: 10 },
    { skip: !userId, pollingInterval: 60_000 },
  );
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: markingAll }] = useMarkAllNotificationsReadMutation();

  const refresh = useCallback(() => {
    void refetchCount();
    void refetchList();
  }, [refetchCount, refetchList]);

  useWebSocket({
    topic: userId ? `/topic/notifications/${userId}` : '',
    onMessage: refresh,
    enabled: !!userId,
  });

  const unreadCount = unreadData?.count ?? 0;
  const notifications = notificationsPage?.content ?? [];

  const handleOpenChange = (open: boolean) => {
    if (open) refresh();
  };

  const handleItemClick = async (item: NotificationResponse) => {
    if (!item.read) {
      await markRead(item.id);
    }
  };

  const content = (
    <div className="app-header-notifications">
      <div className="app-header-notifications__toolbar">
        <Text strong>Notifications</Text>
        {unreadCount > 0 && (
          <Button
            type="link"
            size="small"
            icon={<CheckOutlined />}
            loading={markingAll}
            onClick={() => void markAllRead()}
          >
            Mark all read
          </Button>
        )}
      </div>
      {isLoading ? (
        <div className="app-header-notifications__loading"><Spin size="small" /></div>
      ) : notifications.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No notifications" />
      ) : (
        <List
          size="small"
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item
              className={item.read ? 'app-header-notifications__item' : 'app-header-notifications__item is-unread'}
              onClick={() => void handleItemClick(item)}
            >
              <List.Item.Meta
                title={(
                  <Space size={6} wrap>
                    <Text strong={!item.read}>{item.title}</Text>
                    <Tag color={typeColor[item.notificationType] ?? 'default'} style={{ margin: 0 }}>
                      {item.notificationType}
                    </Tag>
                  </Space>
                )}
                description={(
                  <>
                    <div>{item.message}</div>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {new Date(item.createdAt).toLocaleString()}
                    </Text>
                  </>
                )}
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );

  const badgeCount = useMemo(() => (unreadCount > 0 ? unreadCount : 0), [unreadCount]);

  return (
    <Popover
      trigger="click"
      placement="bottomRight"
      onOpenChange={handleOpenChange}
      content={content}
      overlayClassName="app-header-notifications-popover"
    >
      <span className="app-header-bell-wrap">
        <Badge count={badgeCount} size="small" overflowCount={99}>
          <Button
            type="text"
            className="app-header-bell-btn"
            icon={<BellOutlined />}
            aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
          />
        </Badge>
      </span>
    </Popover>
  );
};

export default NotificationBell;
