const CACHE = "nexus-academia-v15";
const HUB_ASSETS = [
  "/academia/hubs/","/academia/hubs/index.html","/academia/hubs/lab.html",
  "/academia/hubs/lib.html","/academia/hubs/playbooks.html",
  "/academia/hubs/webinars.html","/academia/hubs/tutoriais.html","/academia/hubs/apostilas.html"
];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(HUB_ASSETS)).catch(()=>{}));self.skipWaiting();});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener("fetch",e=>{
  const r=e.request;if(r.method!=="GET")return;const u=new URL(r.url);
  if(u.pathname.startsWith("/academia/hubs/")){
    e.respondWith(caches.match(r).then(c=>{
      const n=fetch(r).then(res=>{if(res&&res.ok){const cl=res.clone();caches.open(CACHE).then(ca=>ca.put(r,cl)).catch(()=>{});}return res;}).catch(()=>c);
      return c||n;
    }));return;
  }
  if(u.pathname==="/api/academia/catalog"){
    e.respondWith(fetch(r).then(res=>{if(res&&res.ok){const cl=res.clone();caches.open(CACHE).then(ca=>ca.put(r,cl)).catch(()=>{});}return res;}).catch(()=>caches.match(r)));
  }
});
