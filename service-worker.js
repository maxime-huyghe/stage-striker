const build = [
  "/stage-striker/_app/start-19d16c85.js",
  "/stage-striker/_app/pages/__layout.svelte-39d525e5.js",
  "/stage-striker/_app/assets/pages/__layout.svelte-1ae5e47f.css",
  "/stage-striker/_app/error.svelte-376ead2b.js",
  "/stage-striker/_app/pages/index.svelte-e95a772e.js",
  "/stage-striker/_app/chunks/index-6a88b587.js"
];
const files = [
  "/stage-striker/favicon.png",
  "/stage-striker/images/battlefield.jpg",
  "/stage-striker/images/final_destination.jpg",
  "/stage-striker/images/hollow_bastion.jpg",
  "/stage-striker/images/kalos_pokemon_league.jpg",
  "/stage-striker/images/lylat_cruise.jpg",
  "/stage-striker/images/northern_cave.jpg",
  "/stage-striker/images/pokemon_stadium_2.jpg",
  "/stage-striker/images/small_battlefield.jpg",
  "/stage-striker/images/smashville.jpg",
  "/stage-striker/images/town_and_city.jpg",
  "/stage-striker/images/yoshis_island.jpg",
  "/stage-striker/images/yoshis_story.jpg",
  "/stage-striker/manifest.json"
];
const version = "1652095013560";
const worker = self;
const FILES = `cache${version}`;
const to_cache = build.concat(files);
const staticAssets = new Set(to_cache);
worker.addEventListener("install", (event) => {
  event.waitUntil(caches.open(FILES).then((cache) => cache.addAll(to_cache)).then(() => {
    worker.skipWaiting();
  }));
});
worker.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then(async (keys) => {
    for (const key of keys) {
      if (key !== FILES)
        await caches.delete(key);
    }
    worker.clients.claim();
  }));
});
async function fetchAndCache(request) {
  const cache = await caches.open(`offline${version}`);
  try {
    const response = await fetch(request);
    cache.put(request, response.clone());
    return response;
  } catch (err) {
    const response = await cache.match(request);
    if (response)
      return response;
    throw err;
  }
}
worker.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || event.request.headers.has("range"))
    return;
  const url = new URL(event.request.url);
  const isHttp = url.protocol.startsWith("http");
  const isDevServerRequest = url.hostname === self.location.hostname && url.port !== self.location.port;
  const isStaticAsset = url.host === self.location.host && staticAssets.has(url.pathname);
  const skipBecauseUncached = event.request.cache === "only-if-cached" && !isStaticAsset;
  if (isHttp && !isDevServerRequest && !skipBecauseUncached) {
    event.respondWith((async () => {
      const cachedAsset = isStaticAsset && await caches.match(event.request);
      return cachedAsset || fetchAndCache(event.request);
    })());
  }
});
