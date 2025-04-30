export interface FileItem {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'image' | 'document' | 'other';
  size: number;
  url: string;
  thumbnail?: string;
  duration?: string;
  views?: number;
  rating?: number;
  description?: string;
  lastUpdated: string;
  utime?: number;
  ctime?: number;
}

export interface FileListResponse {
  data: {
    list: FileItem[];
    storage: {
      total: number;
      used: number;
      drives: Record<string, {
        used: number;
        total: number;
        nickname: string;
      }>;
    };
    tokens: Record<string, {
      token: string;
      nickname: string;
      uid: number;
    }>;
  };
}