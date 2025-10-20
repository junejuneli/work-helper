import React, { useState } from 'react';
import { Layout, Typography, Space, Tag, List, Avatar, Badge } from '@douyinfe/semi-ui';
import { IconStar } from '@douyinfe/semi-icons';
import { Chat } from './pages/Chat';
import { LogPanel } from './components/LogPanel';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

// 会话类型定义
export interface Conversation {
  id: string;
  name: string;
  avatar: string;
  isLinda?: boolean;
  lastMessage?: string;
  unreadCount?: number;
  timestamp?: number;
}

export const App: React.FC = () => {
  const [activeConversationId, setActiveConversationId] = useState('linda');

  // 会话列表，Linda 固定在第一位
  const [conversations] = useState<Conversation[]>([
    {
      id: 'linda',
      name: 'Linda',
      avatar: '🤖',
      isLinda: true,
      lastMessage: '我是你的 AI 秘书，随时为你服务',
      timestamp: Date.now()
    },
    {
      id: 'work-group',
      name: '工作群',
      avatar: '💼',
      lastMessage: '项目进度更新...',
      unreadCount: 3,
      timestamp: Date.now() - 1000000
    },
    {
      id: 'data-analysis',
      name: '数据分析组',
      avatar: '📊',
      lastMessage: '报告已生成',
      unreadCount: 1,
      timestamp: Date.now() - 2000000
    }
  ]);

  const handleConversationClick = (conversationId: string) => {
    setActiveConversationId(conversationId);
  };

  return (
    <Layout style={{ height: '100vh', background: 'var(--semi-color-bg-0)' }}>
      <Header
        style={{
          backgroundColor: 'var(--semi-color-bg-1)',
          borderBottom: '1px solid var(--semi-color-border)',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Space>
          <Title heading={3} style={{ margin: 0 }}>
            AI 秘书 Linda
          </Title>
          <Tag color='blue' size='small'>MVP</Tag>
        </Space>

        <Space>
          <Text type='tertiary' size='small'>
            {typeof window !== 'undefined' && window.electronAPI ? 'Electron 模式' : '浏览器模式'}
          </Text>
        </Space>
      </Header>

      <Layout style={{ height: 'calc(100vh - 65px)' }}>
        {/* 左侧会话列表 */}
        <Sider
          style={{
            backgroundColor: 'var(--semi-color-bg-1)',
            borderRight: '1px solid var(--semi-color-border)'
          }}
        >
          <div style={{ padding: '16px 12px' }}>
            <Text strong>会话列表</Text>
          </div>

          <List
            dataSource={conversations}
            renderItem={(item) => (
              <List.Item
                onClick={() => handleConversationClick(item.id)}
                style={{
                  cursor: 'pointer',
                  backgroundColor: activeConversationId === item.id
                    ? 'var(--semi-color-fill-0)'
                    : 'transparent',
                  padding: '12px 16px',
                  transition: 'all 0.2s'
                }}
                main={
                  <div>
                    <Space>
                      <Text strong>{item.name}</Text>
                      {item.isLinda && <IconStar style={{ color: 'var(--semi-color-warning)' }} />}
                    </Space>
                    <Text
                      type='tertiary'
                      size='small'
                      ellipsis={{ showTooltip: true }}
                      style={{ width: '180px', display: 'block', marginTop: '4px' }}
                    >
                      {item.lastMessage}
                    </Text>
                  </div>
                }
                header={
                  <Badge count={item.unreadCount} type='danger'>
                    <Avatar
                      size='default'
                      style={{
                        backgroundColor: item.isLinda ? 'var(--semi-color-success)' : 'var(--semi-color-primary)'
                      }}
                    >
                      {item.avatar}
                    </Avatar>
                  </Badge>
                }
              />
            )}
          />
        </Sider>

        {/* 右侧内容区 */}
        <Content style={{ padding: '24px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', gap: '16px', height: '100%' }}>
            {/* 聊天区域 */}
            <div style={{ flex: '2', minWidth: 0, height: '100%' }}>
              <Chat conversationId={activeConversationId} />
            </div>
            {/* 日志面板 */}
            <div style={{ flex: '1', minWidth: 0, height: '100%' }}>
              <LogPanel />
            </div>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};
