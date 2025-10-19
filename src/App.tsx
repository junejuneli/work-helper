import React from 'react';
import { Layout } from '@douyinfe/semi-ui';
import { Chat } from './pages/Chat';

const { Header, Content } = Layout;

export const App: React.FC = () => {
  return (
    <Layout style={{ height: '100vh' }}>
      <Header style={{ backgroundColor: 'var(--semi-color-bg-1)' }}>
        <h1>AI秘书</h1>
      </Header>

      <Content style={{ padding: '24px' }}>
        <Chat />
      </Content>
    </Layout>
  );
};
