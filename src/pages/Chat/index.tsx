import React, { useState, useEffect, useRef } from 'react';
import { Conversations } from '@ant-design/x';

interface Message {
  key: string;
  placement: 'start' | 'end';
  content: string;
  avatar: string;
}

export const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const streamingContentRef = useRef('');

  // 监听Claude响应
  useEffect(() => {
    const handleMessage = (data: any) => {
      if (data.type === 'stream') {
        // 流式内容追加
        streamingContentRef.current += data.content;

        setMessages(prev => {
          const newMessages = [...prev];
          const lastMsg = newMessages[newMessages.length - 1];

          if (lastMsg && lastMsg.placement === 'start') {
            lastMsg.content = streamingContentRef.current;
          } else {
            newMessages.push({
              key: Date.now().toString(),
              placement: 'start',
              content: streamingContentRef.current,
              avatar: '🤖'
            });
          }
          return newMessages;
        });
      } else if (data.type === 'complete') {
        streamingContentRef.current = '';
      }
    };

    window.electronAPI.onMessage(handleMessage);
    return () => window.electronAPI.removeListener('claude:message', handleMessage);
  }, []);

  // 发送消息
  const handleSend = async (message: string) => {
    if (!message.trim()) return;

    setMessages(prev => [...prev, {
      key: Date.now().toString(),
      placement: 'end',
      content: message,
      avatar: '👤'
    }]);

    streamingContentRef.current = '';
    await window.electronAPI.sendMessage(message);
  };

  return (
    <Conversations
      items={messages}
      onSubmit={handleSend}
      inputPlaceholder="和 Linda 对话..."
      style={{ height: '100%' }}
    />
  );
};
