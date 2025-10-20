import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bubble, Sender, Welcome, Prompts } from '@ant-design/x';
import { Spin, Button, Space, Popconfirm, Toast } from '@douyinfe/semi-ui';
import { IconDeleteStroked } from '@douyinfe/semi-icons';
import type { GetProp } from 'antd';
import type { PromptProps } from '@ant-design/x';

// 消息类型定义
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  status?: 'loading' | 'success' | 'error';
  timestamp?: number;
  conversationId: string; // 添加会话 ID
}

// Chat 组件的 props
interface ChatProps {
  conversationId: string;
}

// Bubble.List 的消息类型
type BubbleListItem = GetProp<typeof Bubble.List, 'items'>[number];

// 欢迎提示词 - 更符合 Linda 的温暖人设
const welcomePrompts = [
  {
    key: 'greeting',
    label: '👋 和 Linda 打个招呼',
    description: '让我了解一下你，我会更懂你~'
  },
  {
    key: 'write',
    label: '✍️ 帮我写点东西',
    description: '邮件、文案、报告... 告诉我你需要什么'
  },
  {
    key: 'analyze',
    label: '🧠 帮我想想办法',
    description: '头脑风暴、方案建议、问题分析'
  },
  {
    key: 'translate',
    label: '🌏 翻译或润色文字',
    description: '中英互译、文字优化、专业润色'
  }
];

// 每批加载的消息数量
const MESSAGES_PER_BATCH = 20;

// 模拟存储所有会话的消息（实际应该从后端或本地数据库加载）
const conversationMessagesStore: Record<string, ChatMessage[]> = {
  linda: [],
  'work-group': [],
  'data-analysis': []
};

export const Chat: React.FC<ChatProps> = ({ conversationId }) => {
  // 当前会话显示的消息（分批加载）
  const [displayedMessages, setDisplayedMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [loadedBatches, setLoadedBatches] = useState(0);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const previousConversationId = useRef<string>(conversationId);

  // 检查是否在 Electron 环境中
  const isElectron = typeof window !== 'undefined' && window.electronAPI;

  // 加载更多历史消息（懒加载）
  const loadMoreMessages = useCallback(() => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    const allMessages = conversationMessagesStore[conversationId] || [];
    const startIndex = allMessages.length - (loadedBatches + 1) * MESSAGES_PER_BATCH;
    const endIndex = allMessages.length - loadedBatches * MESSAGES_PER_BATCH;

    if (startIndex < 0) {
      // 已经加载完所有消息
      const remainingMessages = allMessages.slice(0, endIndex);
      setTimeout(() => {
        setDisplayedMessages(prev => [...remainingMessages, ...prev]);
        setHasMore(false);
        setIsLoadingMore(false);
        setLoadedBatches(prev => prev + 1);
      }, 500);
    } else {
      // 还有更多消息
      const batchMessages = allMessages.slice(startIndex, endIndex);
      setTimeout(() => {
        setDisplayedMessages(prev => [...batchMessages, ...prev]);
        setIsLoadingMore(false);
        setLoadedBatches(prev => prev + 1);
      }, 500);
    }
  }, [conversationId, isLoadingMore, hasMore, loadedBatches]);

  // 监听滚动事件，实现懒加载
  const handleScroll = useCallback(() => {
    if (!chatContainerRef.current || isLoadingMore || !hasMore) return;

    const { scrollTop } = chatContainerRef.current;
    // 当滚动到顶部时加载更多
    if (scrollTop < 100) {
      loadMoreMessages();
    }
  }, [isLoadingMore, hasMore, loadMoreMessages]);

  // 切换会话时加载消息
  useEffect(() => {
    if (conversationId !== previousConversationId.current) {
      previousConversationId.current = conversationId;

      // 加载当前会话的最新消息
      const allMessages = conversationMessagesStore[conversationId] || [];
      const latestMessages = allMessages.slice(-MESSAGES_PER_BATCH);

      setDisplayedMessages(latestMessages);
      setLoadedBatches(1);
      setHasMore(allMessages.length > MESSAGES_PER_BATCH);

      // 滚动到底部
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [conversationId]);

  // 自动滚动到底部（仅在新消息到达时）
  useEffect(() => {
    if (chatContainerRef.current && !isLoadingMore) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [displayedMessages, isLoadingMore]);

  // 监听 Electron 的流式响应
  useEffect(() => {
    if (!isElectron) return;

    let streamingMessageId: string | null = null;
    let streamingContent = '';

    const handleMessage = (data: any) => {
      if (data.type === 'stream') {
        streamingContent += data.content;

        setDisplayedMessages(prev => {
          const newMessages = [...prev];
          if (streamingMessageId) {
            const index = newMessages.findIndex(m => m.id === streamingMessageId);
            if (index !== -1) {
              newMessages[index] = {
                ...newMessages[index],
                content: streamingContent,
                status: 'loading'
              };
            }
          } else {
            streamingMessageId = `assistant-${Date.now()}`;
            const newMessage: ChatMessage = {
              id: streamingMessageId,
              role: 'assistant',
              content: streamingContent,
              status: 'loading',
              timestamp: Date.now(),
              conversationId
            };
            newMessages.push(newMessage);
            // 同时保存到存储中
            conversationMessagesStore[conversationId].push(newMessage);
          }
          return newMessages;
        });
      } else if (data.type === 'complete') {
        if (streamingMessageId) {
          setDisplayedMessages(prev =>
            prev.map(m =>
              m.id === streamingMessageId
                ? { ...m, status: 'success' as const }
                : m
            )
          );
          // 更新存储中的消息状态
          const storeMessages = conversationMessagesStore[conversationId];
          const index = storeMessages.findIndex(m => m.id === streamingMessageId);
          if (index !== -1) {
            storeMessages[index].status = 'success';
          }
        }
        streamingMessageId = null;
        streamingContent = '';
        setLoading(false);
      } else if (data.type === 'error') {
        if (streamingMessageId) {
          const errorContent = `错误: ${data.content}`;
          setDisplayedMessages(prev =>
            prev.map(m =>
              m.id === streamingMessageId
                ? { ...m, content: errorContent, status: 'error' as const }
                : m
            )
          );
          // 更新存储中的消息状态
          const storeMessages = conversationMessagesStore[conversationId];
          const index = storeMessages.findIndex(m => m.id === streamingMessageId);
          if (index !== -1) {
            storeMessages[index].content = errorContent;
            storeMessages[index].status = 'error';
          }
        }
        streamingMessageId = null;
        streamingContent = '';
        setLoading(false);
      }
    };

    window.electronAPI.onMessage(handleMessage);
    return () => {
      window.electronAPI.removeListener('claude:message', handleMessage);
    };
  }, [isElectron, conversationId]);

  // 发送消息
  const handleSend = async (message: string) => {
    if (!message.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message.trim(),
      timestamp: Date.now(),
      conversationId
    };

    // 添加到显示的消息列表
    setDisplayedMessages(prev => [...prev, userMessage]);
    // 同时保存到存储中
    conversationMessagesStore[conversationId].push(userMessage);
    setInput('');
    setLoading(true);

    if (isElectron) {
      // Electron 模式：调用真实 API，传递会话 ID
      await window.electronAPI.sendMessage(message.trim(), conversationId);
    } else {
      // 浏览器模式：使用 mock 响应
      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: `你好！我是 Linda~\n\n你刚才说："${message}"\n\n不过呢，现在是浏览器预览模式，我还没连上真实的大脑呢~ 😊\n\n要体验我的完整能力，请在 Electron 应用中运行。到那时候，我可以：\n\n✨ **理解你的需求**\n主动澄清模糊的任务，确保准确理解你的意图\n\n📝 **处理各种任务**\n写文案、翻译文档、分析数据、头脑风暴...\n\n💝 **提供情绪价值**\n温暖、体贴的交互体验，让工作更有温度\n\n期待在完整版里为你服务！`,
          status: 'success',
          timestamp: Date.now(),
          conversationId
        };
        setDisplayedMessages(prev => [...prev, assistantMessage]);
        conversationMessagesStore[conversationId].push(assistantMessage);
        setLoading(false);
      }, 800);
    }
  };

  // 处理提示词点击
  const handlePromptClick = (info: { data: PromptProps }) => {
    const prompt = welcomePrompts.find(p => p.key === info.data.key);
    if (!prompt) return;

    const promptMessages: Record<string, string> = {
      greeting: '你好 Linda！我是第一次使用，能介绍一下你自己吗？',
      write: '我需要写一封商务邮件，能帮我吗？',
      analyze: '我有个问题需要你帮我分析一下',
      translate: '我想翻译一段文字'
    };
    handleSend(promptMessages[prompt.key] || prompt.label);
  };

  // 清空会话历史
  const handleClearConversation = async () => {
    if (isElectron) {
      await window.electronAPI.clearHistory(conversationId);
    }
    // 清空本地显示的消息
    setDisplayedMessages([]);
    conversationMessagesStore[conversationId] = [];
    setLoadedBatches(0);
    setHasMore(false);
    Toast.success('会话已清空');
  };

  // 转换消息格式为 Bubble.List 所需的格式
  const bubbleItems: BubbleListItem[] = displayedMessages.map(msg => ({
    key: msg.id,
    role: msg.role === 'user' ? 'user' as const : 'ai' as const,
    content: msg.content,
    loading: msg.status === 'loading',
    placement: msg.role === 'user' ? 'end' as const : 'start' as const, // 用户在右边，AI在左边
    variant: msg.role === 'user' ? 'filled' as const : 'borderless' as const,
    avatar: msg.role === 'user'
      ? { icon: '👤', style: { backgroundColor: '#4096ff' } }
      : { icon: '🤖', style: { backgroundColor: '#52c41a' } },
    styles: {
      content: {
        whiteSpace: 'pre-wrap'
      }
    }
  }));

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--semi-color-bg-0)',
        borderRadius: '8px',
        overflow: 'hidden'
      }}
    >
      {/* 顶部操作栏 */}
      {displayedMessages.length > 0 && (
        <div
          style={{
            padding: '12px 24px',
            borderBottom: '1px solid var(--semi-color-border)',
            background: 'var(--semi-color-bg-0)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Space>
            <span style={{ fontSize: '12px', color: 'var(--semi-color-text-2)' }}>
              {isElectron ? '🟢 已连接' : '🔵 浏览器模式'}
            </span>
          </Space>
          <Popconfirm
            title="确定清空会话吗？"
            content="清空后将无法恢复历史消息"
            onConfirm={handleClearConversation}
            okText="确定"
            cancelText="取消"
          >
            <Button
              icon={<IconDeleteStroked />}
              size="small"
              theme="borderless"
              type="tertiary"
            >
              清空会话
            </Button>
          </Popconfirm>
        </div>
      )}

      {/* 聊天消息区域 */}
      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          background: 'var(--semi-color-bg-1)'
        }}
      >
        {/* 懒加载指示器 */}
        {isLoadingMore && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <Spin size="small" />
          </div>
        )}

        {displayedMessages.length === 0 ? (
          <Welcome
            variant="borderless"
            icon="🌟"
            title="你好！我是 Linda"
            description="你的 AI 秘书，温暖、智能、专业。无论工作还是生活，我都在这里陪伴你~"
            extra={
              <Prompts
                title="我可以帮你："
                items={welcomePrompts}
                onItemClick={handlePromptClick}
                wrap
                styles={{
                  list: {
                    marginTop: 16
                  }
                }}
              />
            }
            style={{
              marginTop: '80px',
              marginBottom: '40px'
            }}
          />
        ) : (
          <Bubble.List
            items={bubbleItems}
            style={{
              maxWidth: '100%'
            }}
          />
        )}
      </div>

      {/* 输入区域 */}
      <div
        style={{
          borderTop: '1px solid var(--semi-color-border)',
          background: 'var(--semi-color-bg-0)',
          padding: '16px 24px'
        }}
      >
        <Sender
          value={input}
          onChange={setInput}
          onSubmit={handleSend}
          loading={loading}
          placeholder="和 Linda 说点什么吧..."
          autoSize={{ minRows: 1, maxRows: 6 }}
          style={{
            background: 'var(--semi-color-bg-1)',
            borderRadius: '8px'
          }}
          styles={{
            input: {
              background: 'transparent'
            }
          }}
        />
      </div>
    </div>
  );
};
