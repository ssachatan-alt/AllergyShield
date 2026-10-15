export interface VirtualFile {
  name: string;
  path: string;
  content: string;
  isDir: boolean;
  permissions?: string;
  size?: number;
  modified?: string;
  type?: 'text' | 'python' | 'bash' | 'markdown' | 'json' | 'binary' | 'dir';
}

export interface VirtualFileSystem {
  [path: string]: VirtualFile;
}

export type AppType = 'terminal' | 'editor' | 'thunar' | 'zenmap' | 'help' | 'settings';

export interface WindowItem {
  id: string;
  title: string;
  appType: AppType;
  icon: string;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
  prevPosition?: { x: number; y: number };
  prevSize?: { width: number; height: number };
  activeFilePath?: string; // For code editor
  initialCommand?: string; // For terminal
}

export interface TerminalLine {
  id: string;
  type: 'prompt' | 'output' | 'error' | 'success' | 'info' | 'progress';
  text: string;
  timestamp?: number;
  dir?: string;
  user?: string;
  command?: string;
}

export interface NetworkNode {
  id: string;
  ip: string;
  mac: string;
  hostname: string;
  os: string;
  status: 'up' | 'down' | 'filtered';
  type: 'router' | 'server' | 'workstation' | 'iot' | 'kali';
  ports: { port: number; proto: 'tcp' | 'udp'; state: 'open' | 'closed' | 'filtered'; service: string; version: string }[];
  vulnerabilities?: string[];
  latency: string;
}
