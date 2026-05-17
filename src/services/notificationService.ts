import { Capacitor } from '@capacitor/core';
import type { NotificationSettings as NotificationSettingsType } from './notificationService.web';
import * as web from './notificationService.web';
import * as native from './notificationService.native';

const isNative = Capacitor.isNativePlatform();

export type NotificationSettings = NotificationSettingsType;

export const getNotificationSettings = isNative
  ? native.getNotificationSettings
  : web.getNotificationSettings;

export const saveNotificationSettings = isNative
  ? native.saveNotificationSettings
  : web.saveNotificationSettings;

export const requestNotificationPermission = isNative
  ? native.requestNotificationPermission
  : web.requestNotificationPermission;

export const applyNotificationScheduler = isNative
  ? native.applyNotificationScheduler
  : web.applyNotificationScheduler;

export const updateNotificationSettings = isNative
  ? native.updateNotificationSettings
  : web.updateNotificationSettings;
