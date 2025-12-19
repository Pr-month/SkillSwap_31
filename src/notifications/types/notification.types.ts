import { Socket } from 'socket.io';
import { TJwtPayload } from 'src/auth/auth.types';

export const NotificationType = {
  NEW_REQUEST: 'NEW_REQUEST',
  REQUEST_ACCEPTED: 'REQUEST_ACCEPTED',
  REQUEST_REJECTED: 'REQUEST_REJECTED',
} as const;

export type NotificationType =
  (typeof NotificationType)[keyof typeof NotificationType];

export interface NotificationPayload {
  type: NotificationType;
  skillName: string;
  fromUser: {
    id: string;
    name: string;
  };
  requestId?: string;
}

export interface IAuthenticatedSocket extends Socket {
  data: {
    user?: TJwtPayload;
  };
}
