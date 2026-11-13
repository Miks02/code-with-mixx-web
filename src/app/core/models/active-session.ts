import { Device } from './device';

export type ActiveSession = {
  sessionId: string;
  device: Device;
  os: string;
  browser: string;
  activeSince: string;
  isCurrentSession: boolean;
};
