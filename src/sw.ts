/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';

declare const self: ServiceWorkerGlobalScope;

// Service Worker 활성화 시 즉시 클라이언트 제어
clientsClaim();

// Precache 파일들
precacheAndRoute(self.__WB_MANIFEST);

// SPA 라우팅 처리
const fileExtensionRegexp = new RegExp('/[^/?]+\\.[^/]+$');
registerRoute(
  ({ request, url }: { request: Request; url: URL }) => {
    if (request.mode !== 'navigate') {
      return false;
    }
    if (url.pathname.startsWith('/_')) {
      return false;
    }
    if (url.pathname.match(fileExtensionRegexp)) {
      return false;
    }
    return true;
  },
  createHandlerBoundToURL('/index.html')
);

// Push 이벤트 처리
self.addEventListener('push', (event: PushEvent) => {
  let notificationData: {
    title: string;
    body: string;
    scheduleId?: number;
    scheduledDateTime?: string;
  } = {
    title: '약 드실 시간입니다!',
    body: '복용할 약이 있습니다.',
  };

  // Push 알림 데이터 파싱
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        title: data.title || notificationData.title,
        body: data.body || notificationData.body,
        scheduleId: data.scheduleId,
        scheduledDateTime: data.scheduledDateTime,
      };
    } catch (error) {
      // JSON 파싱 실패 시 기본값 사용
    }
  }

  // 알림 표시
  const notificationOptions: NotificationOptions = {
    body: notificationData.body,
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    tag: `medication-${notificationData.scheduleId || 'default'}`,
    requireInteraction: false,
    data: {
      scheduleId: notificationData.scheduleId,
      scheduledDateTime: notificationData.scheduledDateTime,
      title: notificationData.title,
      body: notificationData.body,
    },
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationOptions)
  );

  // 모든 클라이언트에게 메시지 전송 (앱이 열려있을 때 모달 표시용)
  event.waitUntil(
    self.clients.matchAll().then((clientList) => {
      clientList.forEach((client) => {
        client.postMessage({
          type: 'PUSH_NOTIFICATION',
          data: notificationData,
        });
      });
    })
  );
});

// 알림 클릭 이벤트 처리
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();

  const notificationData = event.notification.data;

  event.waitUntil(
    self.clients.matchAll().then((clientList) => {
      // 이미 열려있는 클라이언트가 있으면 포커스
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          client.focus();
          // 알림 데이터 전송
          client.postMessage({
            type: 'NOTIFICATION_CLICK',
            data: notificationData,
          });
          return;
        }
      }
      // 열려있는 클라이언트가 없으면 새로 열기
      if (self.clients.openWindow) {
        return self.clients.openWindow('/elder');
      }
    })
  );
});

