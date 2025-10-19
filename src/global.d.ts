declare global {
  interface Window {
    electronAPI: {
      sendMessage: (message: string) => Promise<void>;
      onMessage: (callback: (data: any) => void) => void;
      removeListener: (channel: string, callback: any) => void;
    };
  }
}

export {};
