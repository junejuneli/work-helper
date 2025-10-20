declare global {
  interface Window {
    electronAPI: {
      sendMessage: (message: string, conversationId: string) => Promise<void>;
      onMessage: (callback: (data: any) => void) => void;
      onLog: (callback: (data: any) => void) => void;
      getLogs: () => Promise<any[]>;
      getHistory: (conversationId: string) => Promise<any[]>;
      clearHistory: (conversationId: string) => Promise<void>;
      removeListener: (channel: string, callback: any) => void;
    };
  }
}

export {};
