import React, { useState, useEffect, useRef } from 'react';
import { Typography, Empty, Spin, Button } from '@douyinfe/semi-ui';
import { IconRefresh } from '@douyinfe/semi-icons';

const { Text, Paragraph } = Typography;

interface LogEntry {
  timestamp: number;
  type: 'request' | 'response' | 'error' | 'stream';
  conversationId: string;
  content: string;
}

export const LogPanel: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const isElectron = typeof window !== 'undefined' && window.electronAPI;

  // 自动滚动到底部
  const scrollToBottom = () => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  };

  // 监听实时日志
  useEffect(() => {
    if (!isElectron) return;

    const handleLog = (data: LogEntry) => {
      setLogs(prev => [...prev, data]);
      setTimeout(scrollToBottom, 100);
    };

    // 开始监听新日志（不加载历史，避免重复）
    window.electronAPI.onLog(handleLog);

    return () => {
      window.electronAPI.removeListener('claude:log', handleLog);
    };
  }, [isElectron]);

  // 加载历史日志
  const loadLogs = async () => {
    if (!isElectron) return;

    setLoading(true);
    try {
      const historyLogs = await window.electronAPI.getLogs();
      setLogs(historyLogs);
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Failed to load logs:', error);
    } finally {
      setLoading(false);
    }
  };

  // 格式化时间
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  // 获取日志类型的颜色
  const getLogTypeColor = (type: string) => {
    switch (type) {
      case 'request':
        return 'var(--semi-color-primary)';
      case 'response':
        return 'var(--semi-color-success)';
      case 'error':
        return 'var(--semi-color-danger)';
      default:
        return 'var(--semi-color-text-0)';
    }
  };

  // 获取日志类型的图标
  const getLogTypeIcon = (type: string) => {
    switch (type) {
      case 'request':
        return '📤';
      case 'response':
        return '📥';
      case 'error':
        return '❌';
      default:
        return '•';
    }
  };

  // 获取日志类型的标签
  const getLogTypeLabel = (type: string) => {
    switch (type) {
      case 'request':
        return '用户输入';
      case 'response':
        return 'Linda 回复';
      case 'error':
        return '错误';
      default:
        return type.toUpperCase();
    }
  };

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--semi-color-bg-1)',
        borderRadius: '8px',
        border: '1px solid var(--semi-color-border)',
        overflow: 'hidden'
      }}
    >
      {/* 标题栏 */}
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid var(--semi-color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--semi-color-bg-0)'
        }}
      >
        <div>
          <Text strong style={{ fontSize: '14px' }}>对话日志</Text>
          <Text type="tertiary" size="small" style={{ marginLeft: '8px' }}>
            ({logs.length} 条记录)
          </Text>
        </div>
        <Button
          icon={<IconRefresh />}
          size="small"
          theme="borderless"
          onClick={loadLogs}
          loading={loading}
        />
      </div>

      {/* 内容区域 */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '16px' }}>
      {loading && logs.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Spin />
        </div>
      ) : logs.length === 0 ? (
        <Empty
          description="暂无日志记录"
          style={{ marginTop: '60px' }}
        />
      ) : (
        <div
          ref={logContainerRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px',
            background: 'var(--semi-color-fill-0)',
            borderRadius: '4px',
            fontSize: '13px'
          }}
        >
          {logs.map((log, index) => (
            <div
              key={index}
              style={{
                marginBottom: '16px',
                padding: '12px',
                background: 'var(--semi-color-bg-1)',
                borderRadius: '6px',
                borderLeft: `4px solid ${getLogTypeColor(log.type)}`,
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ marginRight: '8px', fontSize: '16px' }}>{getLogTypeIcon(log.type)}</span>
                <Text
                  strong
                  style={{ color: getLogTypeColor(log.type) }}
                >
                  {getLogTypeLabel(log.type)}
                </Text>
                <Text
                  type="tertiary"
                  size="small"
                  style={{ marginLeft: 'auto' }}
                >
                  {formatTime(log.timestamp)}
                </Text>
              </div>
              <div
                style={{
                  padding: '8px',
                  background: 'var(--semi-color-fill-0)',
                  borderRadius: '4px',
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}
              >
                <Text
                  style={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    lineHeight: '1.6'
                  }}
                >
                  {log.content}
                </Text>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
};
