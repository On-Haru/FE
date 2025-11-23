/// <reference lib="webworker" />

import { precacheAndRoute } from 'workbox-precaching';

type WBManifestEntry = {
  url: string;
  revision?: string;
};

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: WBManifestEntry[];
};

// Injected by VitePWA's injectManifest strategy so Workbox knows what to precache
precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener('push', (event: PushEvent) => {
  let data: {
    title: string;
    body: string;
    scheduleId?: number;
    scheduledDateTime?: string;
  } = {
    title: '약 드실 시간입니다!',
    body: '복용할 약이 있습니다.',
  };

  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (error) {
    console.error('[Service Worker] Push 데이터 파싱 실패:', error);
    // fallback keeps default data
  }

  const { title, body, scheduleId, scheduledDateTime } = data;

  event.waitUntil(
    (async () => {
      try {
        await self.registration.showNotification(title, {
          body,
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          tag: `medication-${scheduleId || 'default'}`,
          data: {
            scheduleId,
            scheduledDateTime,
            title,
            body,
          },
        });
      } catch (error) {
        console.error('[Service Worker] 알림 표시 실패:', error);
      }

      const windowClients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });

      for (const client of windowClients) {
        client.postMessage({
          type: 'PUSH_RECEIVED',
          payload: {
            title,
            body,
            scheduleId,
            scheduledDateTime,
            receivedAt: Date.now(),
          },
        });
      }
    })()
  );
});

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();

  const notificationData = event.notification.data;

  event.waitUntil(
    (async () => {
      const windowClients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });

      // 이미 열려있는 클라이언트가 있으면 포커스
      for (const client of windowClients) {
        if (client.url && 'focus' in client) {
          await client.focus();
          // 알림 데이터 전송
          client.postMessage({
            type: 'NOTIFICATION_CLICK',
            payload: notificationData,
          });
          return;
        }
      }

      // 열려있는 클라이언트가 없으면 새로 열기
      if (self.clients.openWindow) {
        await self.clients.openWindow('/elder');
      }
    })()
  );
});
