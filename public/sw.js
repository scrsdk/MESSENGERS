// const STATIC_CACHE = "telegram-static-v1";
// const DYNAMIC_CACHE = "telegram-dynamic-v1";
// const ASSETS = [
//   self.origin + "/",
//   // self.origin + "/global.css",
//   self.origin + "/offline.html",
//   self.origin + "/_next/static/",
// ];

// // محدود کردن اندازه کش
// const limitCacheSize = async (cacheName, maxSize) => {
//   const cache = await caches.open(cacheName);
//   const keys = await cache.keys();
//   if (keys.length > maxSize) {
//     await cache.delete(keys[0]);
//     limitCacheSize(cacheName, maxSize);
//   }
// };

// // نصب سرویس ورکر و کش کردن منابع اولیه
// self.addEventListener("install", (event) => {
//   console.log("Installing Service Worker...");
//   event.waitUntil(
//     caches.open(STATIC_CACHE).then(async (cache) => {
//       for (const asset of ASSETS) {
//         try {
//           await cache.add(asset);
//         } catch (error) {
//           console.warn("⚠ Failed to cache:", asset, error);
//         }
//       }
//     })
//   );
//   self.skipWaiting();
// });

// // حذف کش‌های قدیمی هنگام فعال‌سازی
// self.addEventListener("activate", (event) => {
//   console.log("Service Worker Activated, clearing old caches...");
//   event.waitUntil(
//     caches.keys().then((keys) => {
//       return Promise.all(
//         keys
//           .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
//           .map((key) => caches.delete(key))
//       );
//     })
//   );
//   self.clients.claim();
// });

// // استراتژی کشینگ
// const cacheFirst = async (request) => {
//   const cache = await caches.open(STATIC_CACHE);
//   const cachedResponse = await cache.match(request);
//   return (
//     cachedResponse || fetch(request).catch(() => caches.match("/offline.html"))
//   );
// };

// const networkFirst = async (request) => {
//   try {
//     const response = await fetch(request);
//     const cache = await caches.open(DYNAMIC_CACHE);
//     cache.put(request, response.clone());
//     limitCacheSize(DYNAMIC_CACHE, 15);
//     return response;
//     // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   } catch (error) {
//     console.warn("⚠ Network request failed, serving from cache:", request.url);

//     const cache = await caches.open(STATIC_CACHE);
//     const cachedResponse = await cache.match(request);

//     return cachedResponse || cache.match(self.origin + "/offline.html");
//   }
// };

// // مدیریت درخواست‌ها
// self.addEventListener("fetch", (event) => {
//   const url = new URL(event.request.url);

//   if (
//     url.pathname.includes("node_modules") ||
//     url.hostname.includes("firestore.googleapis.com")
//   ) {
//     return;
//   }

//   event.respondWith(
//     event.request.headers.get("accept")?.includes("text/html")
//       ? networkFirst(event.request)
//       : cacheFirst(event.request)
//   );
// });

// Push Notification
// self.addEventListener("push", (event) => {
//   const data = event.data?.json();
//   const options = {
//     body: data.body,
//     icon: "/icons/icon-192x192.png",
//     badge: "/icons/badge-72x72.png",
//     data: { url: data.url },
//   };
//   event.waitUntil(self.registration.showNotification(data.title, options));
// });

// // مدیریت کلیک روی نوتیفیکیشن
// self.addEventListener("notificationclick", (event) => {
//   event.notification.close();
//   event.waitUntil(clients.openWindow(event.notification.data.url));
// });
