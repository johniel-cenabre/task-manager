try {
  self["workbox:core:7.3.0"] && _();
} catch {
}
const v = (n, ...e) => {
  let t = n;
  return e.length > 0 && (t += ` :: ${JSON.stringify(e)}`), t;
}, A = v;
class u extends Error {
  /**
   *
   * @param {string} errorCode The error code that
   * identifies this particular error.
   * @param {Object=} details Any relevant arguments
   * that will help developers identify issues should
   * be added as a key on the context object.
   */
  constructor(e, t) {
    const s = A(e, t);
    super(s), this.name = e, this.details = t;
  }
}
const p = {
  googleAnalytics: "googleAnalytics",
  precache: "precache-v2",
  prefix: "workbox",
  runtime: "runtime",
  suffix: typeof registration < "u" ? registration.scope : ""
}, U = (n) => [p.prefix, n, p.suffix].filter((e) => e && e.length > 0).join("-"), S = (n) => {
  for (const e of Object.keys(p))
    n(e);
}, I = {
  updateDetails: (n) => {
    S((e) => {
      typeof n[e] == "string" && (p[e] = n[e]);
    });
  },
  getGoogleAnalyticsName: (n) => n || U(p.googleAnalytics),
  getPrecacheName: (n) => n || U(p.precache),
  getPrefix: () => p.prefix,
  getRuntimeName: (n) => n || U(p.runtime),
  getSuffix: () => p.suffix
};
function x(n, e) {
  const t = e();
  return n.waitUntil(t), t;
}
try {
  self["workbox:precaching:7.3.0"] && _();
} catch {
}
const D = "__WB_REVISION__";
function q(n) {
  if (!n)
    throw new u("add-to-cache-list-unexpected-type", { entry: n });
  if (typeof n == "string") {
    const a = new URL(n, location.href);
    return {
      cacheKey: a.href,
      url: a.href
    };
  }
  const { revision: e, url: t } = n;
  if (!t)
    throw new u("add-to-cache-list-unexpected-type", { entry: n });
  if (!e) {
    const a = new URL(t, location.href);
    return {
      cacheKey: a.href,
      url: a.href
    };
  }
  const s = new URL(t, location.href), r = new URL(t, location.href);
  return s.searchParams.set(D, e), {
    cacheKey: s.href,
    url: r.href
  };
}
class M {
  constructor() {
    this.updatedURLs = [], this.notUpdatedURLs = [], this.handlerWillStart = async ({ request: e, state: t }) => {
      t && (t.originalRequest = e);
    }, this.cachedResponseWillBeUsed = async ({ event: e, state: t, cachedResponse: s }) => {
      if (e.type === "install" && t && t.originalRequest && t.originalRequest instanceof Request) {
        const r = t.originalRequest.url;
        s ? this.notUpdatedURLs.push(r) : this.updatedURLs.push(r);
      }
      return s;
    };
  }
}
class j {
  constructor({ precacheController: e }) {
    this.cacheKeyWillBeUsed = async ({ request: t, params: s }) => {
      const r = (s == null ? void 0 : s.cacheKey) || this._precacheController.getCacheKeyForURL(t.url);
      return r ? new Request(r, { headers: t.headers }) : t;
    }, this._precacheController = e;
  }
}
let C;
function W() {
  if (C === void 0) {
    const n = new Response("");
    if ("body" in n)
      try {
        new Response(n.body), C = !0;
      } catch {
        C = !1;
      }
    C = !1;
  }
  return C;
}
async function H(n, e) {
  let t = null;
  if (n.url && (t = new URL(n.url).origin), t !== self.location.origin)
    throw new u("cross-origin-copy-response", { origin: t });
  const s = n.clone(), a = {
    headers: new Headers(s.headers),
    status: s.status,
    statusText: s.statusText
  }, c = W() ? s.body : await s.blob();
  return new Response(c, a);
}
const F = (n) => new URL(String(n), location.href).href.replace(new RegExp(`^${location.origin}`), "");
function N(n, e) {
  const t = new URL(n);
  for (const s of e)
    t.searchParams.delete(s);
  return t.href;
}
async function B(n, e, t, s) {
  const r = N(e.url, t);
  if (e.url === r)
    return n.match(e, s);
  const a = Object.assign(Object.assign({}, s), { ignoreSearch: !0 }), c = await n.keys(e, a);
  for (const i of c) {
    const o = N(i.url, t);
    if (r === o)
      return n.match(i, s);
  }
}
class G {
  /**
   * Creates a promise and exposes its resolve and reject functions as methods.
   */
  constructor() {
    this.promise = new Promise((e, t) => {
      this.resolve = e, this.reject = t;
    });
  }
}
const $ = /* @__PURE__ */ new Set();
async function V() {
  for (const n of $)
    await n();
}
function J(n) {
  return new Promise((e) => setTimeout(e, n));
}
try {
  self["workbox:strategies:7.3.0"] && _();
} catch {
}
function P(n) {
  return typeof n == "string" ? new Request(n) : n;
}
class Q {
  /**
   * Creates a new instance associated with the passed strategy and event
   * that's handling the request.
   *
   * The constructor also initializes the state that will be passed to each of
   * the plugins handling this request.
   *
   * @param {workbox-strategies.Strategy} strategy
   * @param {Object} options
   * @param {Request|string} options.request A request to run this strategy for.
   * @param {ExtendableEvent} options.event The event associated with the
   *     request.
   * @param {URL} [options.url]
   * @param {*} [options.params] The return value from the
   *     {@link workbox-routing~matchCallback} (if applicable).
   */
  constructor(e, t) {
    this._cacheKeys = {}, Object.assign(this, t), this.event = t.event, this._strategy = e, this._handlerDeferred = new G(), this._extendLifetimePromises = [], this._plugins = [...e.plugins], this._pluginStateMap = /* @__PURE__ */ new Map();
    for (const s of this._plugins)
      this._pluginStateMap.set(s, {});
    this.event.waitUntil(this._handlerDeferred.promise);
  }
  /**
   * Fetches a given request (and invokes any applicable plugin callback
   * methods) using the `fetchOptions` (for non-navigation requests) and
   * `plugins` defined on the `Strategy` object.
   *
   * The following plugin lifecycle methods are invoked when using this method:
   * - `requestWillFetch()`
   * - `fetchDidSucceed()`
   * - `fetchDidFail()`
   *
   * @param {Request|string} input The URL or request to fetch.
   * @return {Promise<Response>}
   */
  async fetch(e) {
    const { event: t } = this;
    let s = P(e);
    if (s.mode === "navigate" && t instanceof FetchEvent && t.preloadResponse) {
      const c = await t.preloadResponse;
      if (c)
        return c;
    }
    const r = this.hasCallback("fetchDidFail") ? s.clone() : null;
    try {
      for (const c of this.iterateCallbacks("requestWillFetch"))
        s = await c({ request: s.clone(), event: t });
    } catch (c) {
      if (c instanceof Error)
        throw new u("plugin-error-request-will-fetch", {
          thrownErrorMessage: c.message
        });
    }
    const a = s.clone();
    try {
      let c;
      c = await fetch(s, s.mode === "navigate" ? void 0 : this._strategy.fetchOptions);
      for (const i of this.iterateCallbacks("fetchDidSucceed"))
        c = await i({
          event: t,
          request: a,
          response: c
        });
      return c;
    } catch (c) {
      throw r && await this.runCallbacks("fetchDidFail", {
        error: c,
        event: t,
        originalRequest: r.clone(),
        request: a.clone()
      }), c;
    }
  }
  /**
   * Calls `this.fetch()` and (in the background) runs `this.cachePut()` on
   * the response generated by `this.fetch()`.
   *
   * The call to `this.cachePut()` automatically invokes `this.waitUntil()`,
   * so you do not have to manually call `waitUntil()` on the event.
   *
   * @param {Request|string} input The request or URL to fetch and cache.
   * @return {Promise<Response>}
   */
  async fetchAndCachePut(e) {
    const t = await this.fetch(e), s = t.clone();
    return this.waitUntil(this.cachePut(e, s)), t;
  }
  /**
   * Matches a request from the cache (and invokes any applicable plugin
   * callback methods) using the `cacheName`, `matchOptions`, and `plugins`
   * defined on the strategy object.
   *
   * The following plugin lifecycle methods are invoked when using this method:
   * - cacheKeyWillBeUsed()
   * - cachedResponseWillBeUsed()
   *
   * @param {Request|string} key The Request or URL to use as the cache key.
   * @return {Promise<Response|undefined>} A matching response, if found.
   */
  async cacheMatch(e) {
    const t = P(e);
    let s;
    const { cacheName: r, matchOptions: a } = this._strategy, c = await this.getCacheKey(t, "read"), i = Object.assign(Object.assign({}, a), { cacheName: r });
    s = await caches.match(c, i);
    for (const o of this.iterateCallbacks("cachedResponseWillBeUsed"))
      s = await o({
        cacheName: r,
        matchOptions: a,
        cachedResponse: s,
        request: c,
        event: this.event
      }) || void 0;
    return s;
  }
  /**
   * Puts a request/response pair in the cache (and invokes any applicable
   * plugin callback methods) using the `cacheName` and `plugins` defined on
   * the strategy object.
   *
   * The following plugin lifecycle methods are invoked when using this method:
   * - cacheKeyWillBeUsed()
   * - cacheWillUpdate()
   * - cacheDidUpdate()
   *
   * @param {Request|string} key The request or URL to use as the cache key.
   * @param {Response} response The response to cache.
   * @return {Promise<boolean>} `false` if a cacheWillUpdate caused the response
   * not be cached, and `true` otherwise.
   */
  async cachePut(e, t) {
    const s = P(e);
    await J(0);
    const r = await this.getCacheKey(s, "write");
    if (!t)
      throw new u("cache-put-with-no-response", {
        url: F(r.url)
      });
    const a = await this._ensureResponseSafeToCache(t);
    if (!a)
      return !1;
    const { cacheName: c, matchOptions: i } = this._strategy, o = await self.caches.open(c), l = this.hasCallback("cacheDidUpdate"), R = l ? await B(
      // TODO(philipwalton): the `__WB_REVISION__` param is a precaching
      // feature. Consider into ways to only add this behavior if using
      // precaching.
      o,
      r.clone(),
      ["__WB_REVISION__"],
      i
    ) : null;
    try {
      await o.put(r, l ? a.clone() : a);
    } catch (d) {
      if (d instanceof Error)
        throw d.name === "QuotaExceededError" && await V(), d;
    }
    for (const d of this.iterateCallbacks("cacheDidUpdate"))
      await d({
        cacheName: c,
        oldResponse: R,
        newResponse: a.clone(),
        request: r,
        event: this.event
      });
    return !0;
  }
  /**
   * Checks the list of plugins for the `cacheKeyWillBeUsed` callback, and
   * executes any of those callbacks found in sequence. The final `Request`
   * object returned by the last plugin is treated as the cache key for cache
   * reads and/or writes. If no `cacheKeyWillBeUsed` plugin callbacks have
   * been registered, the passed request is returned unmodified
   *
   * @param {Request} request
   * @param {string} mode
   * @return {Promise<Request>}
   */
  async getCacheKey(e, t) {
    const s = `${e.url} | ${t}`;
    if (!this._cacheKeys[s]) {
      let r = e;
      for (const a of this.iterateCallbacks("cacheKeyWillBeUsed"))
        r = P(await a({
          mode: t,
          request: r,
          event: this.event,
          // params has a type any can't change right now.
          params: this.params
          // eslint-disable-line
        }));
      this._cacheKeys[s] = r;
    }
    return this._cacheKeys[s];
  }
  /**
   * Returns true if the strategy has at least one plugin with the given
   * callback.
   *
   * @param {string} name The name of the callback to check for.
   * @return {boolean}
   */
  hasCallback(e) {
    for (const t of this._strategy.plugins)
      if (e in t)
        return !0;
    return !1;
  }
  /**
   * Runs all plugin callbacks matching the given name, in order, passing the
   * given param object (merged ith the current plugin state) as the only
   * argument.
   *
   * Note: since this method runs all plugins, it's not suitable for cases
   * where the return value of a callback needs to be applied prior to calling
   * the next callback. See
   * {@link workbox-strategies.StrategyHandler#iterateCallbacks}
   * below for how to handle that case.
   *
   * @param {string} name The name of the callback to run within each plugin.
   * @param {Object} param The object to pass as the first (and only) param
   *     when executing each callback. This object will be merged with the
   *     current plugin state prior to callback execution.
   */
  async runCallbacks(e, t) {
    for (const s of this.iterateCallbacks(e))
      await s(t);
  }
  /**
   * Accepts a callback and returns an iterable of matching plugin callbacks,
   * where each callback is wrapped with the current handler state (i.e. when
   * you call each callback, whatever object parameter you pass it will
   * be merged with the plugin's current state).
   *
   * @param {string} name The name fo the callback to run
   * @return {Array<Function>}
   */
  *iterateCallbacks(e) {
    for (const t of this._strategy.plugins)
      if (typeof t[e] == "function") {
        const s = this._pluginStateMap.get(t);
        yield (a) => {
          const c = Object.assign(Object.assign({}, a), { state: s });
          return t[e](c);
        };
      }
  }
  /**
   * Adds a promise to the
   * [extend lifetime promises]{@link https://w3c.github.io/ServiceWorker/#extendableevent-extend-lifetime-promises}
   * of the event associated with the request being handled (usually a
   * `FetchEvent`).
   *
   * Note: you can await
   * {@link workbox-strategies.StrategyHandler~doneWaiting}
   * to know when all added promises have settled.
   *
   * @param {Promise} promise A promise to add to the extend lifetime promises
   *     of the event that triggered the request.
   */
  waitUntil(e) {
    return this._extendLifetimePromises.push(e), e;
  }
  /**
   * Returns a promise that resolves once all promises passed to
   * {@link workbox-strategies.StrategyHandler~waitUntil}
   * have settled.
   *
   * Note: any work done after `doneWaiting()` settles should be manually
   * passed to an event's `waitUntil()` method (not this handler's
   * `waitUntil()` method), otherwise the service worker thread may be killed
   * prior to your work completing.
   */
  async doneWaiting() {
    for (; this._extendLifetimePromises.length; ) {
      const e = this._extendLifetimePromises.splice(0), s = (await Promise.allSettled(e)).find((r) => r.status === "rejected");
      if (s)
        throw s.reason;
    }
  }
  /**
   * Stops running the strategy and immediately resolves any pending
   * `waitUntil()` promises.
   */
  destroy() {
    this._handlerDeferred.resolve(null);
  }
  /**
   * This method will call cacheWillUpdate on the available plugins (or use
   * status === 200) to determine if the Response is safe and valid to cache.
   *
   * @param {Request} options.request
   * @param {Response} options.response
   * @return {Promise<Response|undefined>}
   *
   * @private
   */
  async _ensureResponseSafeToCache(e) {
    let t = e, s = !1;
    for (const r of this.iterateCallbacks("cacheWillUpdate"))
      if (t = await r({
        request: this.request,
        response: t,
        event: this.event
      }) || void 0, s = !0, !t)
        break;
    return s || t && t.status !== 200 && (t = void 0), t;
  }
}
class z {
  /**
   * Creates a new instance of the strategy and sets all documented option
   * properties as public instance properties.
   *
   * Note: if a custom strategy class extends the base Strategy class and does
   * not need more than these properties, it does not need to define its own
   * constructor.
   *
   * @param {Object} [options]
   * @param {string} [options.cacheName] Cache name to store and retrieve
   * requests. Defaults to the cache names provided by
   * {@link workbox-core.cacheNames}.
   * @param {Array<Object>} [options.plugins] [Plugins]{@link https://developers.google.com/web/tools/workbox/guides/using-plugins}
   * to use in conjunction with this caching strategy.
   * @param {Object} [options.fetchOptions] Values passed along to the
   * [`init`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters)
   * of [non-navigation](https://github.com/GoogleChrome/workbox/issues/1796)
   * `fetch()` requests made by this strategy.
   * @param {Object} [options.matchOptions] The
   * [`CacheQueryOptions`]{@link https://w3c.github.io/ServiceWorker/#dictdef-cachequeryoptions}
   * for any `cache.match()` or `cache.put()` calls made by this strategy.
   */
  constructor(e = {}) {
    this.cacheName = I.getRuntimeName(e.cacheName), this.plugins = e.plugins || [], this.fetchOptions = e.fetchOptions, this.matchOptions = e.matchOptions;
  }
  /**
   * Perform a request strategy and returns a `Promise` that will resolve with
   * a `Response`, invoking all relevant plugin callbacks.
   *
   * When a strategy instance is registered with a Workbox
   * {@link workbox-routing.Route}, this method is automatically
   * called when the route matches.
   *
   * Alternatively, this method can be used in a standalone `FetchEvent`
   * listener by passing it to `event.respondWith()`.
   *
   * @param {FetchEvent|Object} options A `FetchEvent` or an object with the
   *     properties listed below.
   * @param {Request|string} options.request A request to run this strategy for.
   * @param {ExtendableEvent} options.event The event associated with the
   *     request.
   * @param {URL} [options.url]
   * @param {*} [options.params]
   */
  handle(e) {
    const [t] = this.handleAll(e);
    return t;
  }
  /**
   * Similar to {@link workbox-strategies.Strategy~handle}, but
   * instead of just returning a `Promise` that resolves to a `Response` it
   * it will return an tuple of `[response, done]` promises, where the former
   * (`response`) is equivalent to what `handle()` returns, and the latter is a
   * Promise that will resolve once any promises that were added to
   * `event.waitUntil()` as part of performing the strategy have completed.
   *
   * You can await the `done` promise to ensure any extra work performed by
   * the strategy (usually caching responses) completes successfully.
   *
   * @param {FetchEvent|Object} options A `FetchEvent` or an object with the
   *     properties listed below.
   * @param {Request|string} options.request A request to run this strategy for.
   * @param {ExtendableEvent} options.event The event associated with the
   *     request.
   * @param {URL} [options.url]
   * @param {*} [options.params]
   * @return {Array<Promise>} A tuple of [response, done]
   *     promises that can be used to determine when the response resolves as
   *     well as when the handler has completed all its work.
   */
  handleAll(e) {
    e instanceof FetchEvent && (e = {
      event: e,
      request: e.request
    });
    const t = e.event, s = typeof e.request == "string" ? new Request(e.request) : e.request, r = "params" in e ? e.params : void 0, a = new Q(this, { event: t, request: s, params: r }), c = this._getResponse(a, s, t), i = this._awaitComplete(c, a, s, t);
    return [c, i];
  }
  async _getResponse(e, t, s) {
    await e.runCallbacks("handlerWillStart", { event: s, request: t });
    let r;
    try {
      if (r = await this._handle(t, e), !r || r.type === "error")
        throw new u("no-response", { url: t.url });
    } catch (a) {
      if (a instanceof Error) {
        for (const c of e.iterateCallbacks("handlerDidError"))
          if (r = await c({ error: a, event: s, request: t }), r)
            break;
      }
      if (!r)
        throw a;
    }
    for (const a of e.iterateCallbacks("handlerWillRespond"))
      r = await a({ event: s, request: t, response: r });
    return r;
  }
  async _awaitComplete(e, t, s, r) {
    let a, c;
    try {
      a = await e;
    } catch {
    }
    try {
      await t.runCallbacks("handlerDidRespond", {
        event: r,
        request: s,
        response: a
      }), await t.doneWaiting();
    } catch (i) {
      i instanceof Error && (c = i);
    }
    if (await t.runCallbacks("handlerDidComplete", {
      event: r,
      request: s,
      response: a,
      error: c
    }), t.destroy(), c)
      throw c;
  }
}
class w extends z {
  /**
   *
   * @param {Object} [options]
   * @param {string} [options.cacheName] Cache name to store and retrieve
   * requests. Defaults to the cache names provided by
   * {@link workbox-core.cacheNames}.
   * @param {Array<Object>} [options.plugins] {@link https://developers.google.com/web/tools/workbox/guides/using-plugins|Plugins}
   * to use in conjunction with this caching strategy.
   * @param {Object} [options.fetchOptions] Values passed along to the
   * {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters|init}
   * of all fetch() requests made by this strategy.
   * @param {Object} [options.matchOptions] The
   * {@link https://w3c.github.io/ServiceWorker/#dictdef-cachequeryoptions|CacheQueryOptions}
   * for any `cache.match()` or `cache.put()` calls made by this strategy.
   * @param {boolean} [options.fallbackToNetwork=true] Whether to attempt to
   * get the response from the network if there's a precache miss.
   */
  constructor(e = {}) {
    e.cacheName = I.getPrecacheName(e.cacheName), super(e), this._fallbackToNetwork = e.fallbackToNetwork !== !1, this.plugins.push(w.copyRedirectedCacheableResponsesPlugin);
  }
  /**
   * @private
   * @param {Request|string} request A request to run this strategy for.
   * @param {workbox-strategies.StrategyHandler} handler The event that
   *     triggered the request.
   * @return {Promise<Response>}
   */
  async _handle(e, t) {
    const s = await t.cacheMatch(e);
    return s || (t.event && t.event.type === "install" ? await this._handleInstall(e, t) : await this._handleFetch(e, t));
  }
  async _handleFetch(e, t) {
    let s;
    const r = t.params || {};
    if (this._fallbackToNetwork) {
      const a = r.integrity, c = e.integrity, i = !c || c === a;
      s = await t.fetch(new Request(e, {
        integrity: e.mode !== "no-cors" ? c || a : void 0
      })), a && i && e.mode !== "no-cors" && (this._useDefaultCacheabilityPluginIfNeeded(), await t.cachePut(e, s.clone()));
    } else
      throw new u("missing-precache-entry", {
        cacheName: this.cacheName,
        url: e.url
      });
    return s;
  }
  async _handleInstall(e, t) {
    this._useDefaultCacheabilityPluginIfNeeded();
    const s = await t.fetch(e);
    if (!await t.cachePut(e, s.clone()))
      throw new u("bad-precaching-response", {
        url: e.url,
        status: s.status
      });
    return s;
  }
  /**
   * This method is complex, as there a number of things to account for:
   *
   * The `plugins` array can be set at construction, and/or it might be added to
   * to at any time before the strategy is used.
   *
   * At the time the strategy is used (i.e. during an `install` event), there
   * needs to be at least one plugin that implements `cacheWillUpdate` in the
   * array, other than `copyRedirectedCacheableResponsesPlugin`.
   *
   * - If this method is called and there are no suitable `cacheWillUpdate`
   * plugins, we need to add `defaultPrecacheCacheabilityPlugin`.
   *
   * - If this method is called and there is exactly one `cacheWillUpdate`, then
   * we don't have to do anything (this might be a previously added
   * `defaultPrecacheCacheabilityPlugin`, or it might be a custom plugin).
   *
   * - If this method is called and there is more than one `cacheWillUpdate`,
   * then we need to check if one is `defaultPrecacheCacheabilityPlugin`. If so,
   * we need to remove it. (This situation is unlikely, but it could happen if
   * the strategy is used multiple times, the first without a `cacheWillUpdate`,
   * and then later on after manually adding a custom `cacheWillUpdate`.)
   *
   * See https://github.com/GoogleChrome/workbox/issues/2737 for more context.
   *
   * @private
   */
  _useDefaultCacheabilityPluginIfNeeded() {
    let e = null, t = 0;
    for (const [s, r] of this.plugins.entries())
      r !== w.copyRedirectedCacheableResponsesPlugin && (r === w.defaultPrecacheCacheabilityPlugin && (e = s), r.cacheWillUpdate && t++);
    t === 0 ? this.plugins.push(w.defaultPrecacheCacheabilityPlugin) : t > 1 && e !== null && this.plugins.splice(e, 1);
  }
}
w.defaultPrecacheCacheabilityPlugin = {
  async cacheWillUpdate({ response: n }) {
    return !n || n.status >= 400 ? null : n;
  }
};
w.copyRedirectedCacheableResponsesPlugin = {
  async cacheWillUpdate({ response: n }) {
    return n.redirected ? await H(n) : n;
  }
};
class X {
  /**
   * Create a new PrecacheController.
   *
   * @param {Object} [options]
   * @param {string} [options.cacheName] The cache to use for precaching.
   * @param {string} [options.plugins] Plugins to use when precaching as well
   * as responding to fetch events for precached assets.
   * @param {boolean} [options.fallbackToNetwork=true] Whether to attempt to
   * get the response from the network if there's a precache miss.
   */
  constructor({ cacheName: e, plugins: t = [], fallbackToNetwork: s = !0 } = {}) {
    this._urlsToCacheKeys = /* @__PURE__ */ new Map(), this._urlsToCacheModes = /* @__PURE__ */ new Map(), this._cacheKeysToIntegrities = /* @__PURE__ */ new Map(), this._strategy = new w({
      cacheName: I.getPrecacheName(e),
      plugins: [
        ...t,
        new j({ precacheController: this })
      ],
      fallbackToNetwork: s
    }), this.install = this.install.bind(this), this.activate = this.activate.bind(this);
  }
  /**
   * @type {workbox-precaching.PrecacheStrategy} The strategy created by this controller and
   * used to cache assets and respond to fetch events.
   */
  get strategy() {
    return this._strategy;
  }
  /**
   * Adds items to the precache list, removing any duplicates and
   * stores the files in the
   * {@link workbox-core.cacheNames|"precache cache"} when the service
   * worker installs.
   *
   * This method can be called multiple times.
   *
   * @param {Array<Object|string>} [entries=[]] Array of entries to precache.
   */
  precache(e) {
    this.addToCacheList(e), this._installAndActiveListenersAdded || (self.addEventListener("install", this.install), self.addEventListener("activate", this.activate), this._installAndActiveListenersAdded = !0);
  }
  /**
   * This method will add items to the precache list, removing duplicates
   * and ensuring the information is valid.
   *
   * @param {Array<workbox-precaching.PrecacheController.PrecacheEntry|string>} entries
   *     Array of entries to precache.
   */
  addToCacheList(e) {
    const t = [];
    for (const s of e) {
      typeof s == "string" ? t.push(s) : s && s.revision === void 0 && t.push(s.url);
      const { cacheKey: r, url: a } = q(s), c = typeof s != "string" && s.revision ? "reload" : "default";
      if (this._urlsToCacheKeys.has(a) && this._urlsToCacheKeys.get(a) !== r)
        throw new u("add-to-cache-list-conflicting-entries", {
          firstEntry: this._urlsToCacheKeys.get(a),
          secondEntry: r
        });
      if (typeof s != "string" && s.integrity) {
        if (this._cacheKeysToIntegrities.has(r) && this._cacheKeysToIntegrities.get(r) !== s.integrity)
          throw new u("add-to-cache-list-conflicting-integrities", {
            url: a
          });
        this._cacheKeysToIntegrities.set(r, s.integrity);
      }
      if (this._urlsToCacheKeys.set(a, r), this._urlsToCacheModes.set(a, c), t.length > 0) {
        const i = `Workbox is precaching URLs without revision info: ${t.join(", ")}
This is generally NOT safe. Learn more at https://bit.ly/wb-precache`;
        console.warn(i);
      }
    }
  }
  /**
   * Precaches new and updated assets. Call this method from the service worker
   * install event.
   *
   * Note: this method calls `event.waitUntil()` for you, so you do not need
   * to call it yourself in your event handlers.
   *
   * @param {ExtendableEvent} event
   * @return {Promise<workbox-precaching.InstallResult>}
   */
  install(e) {
    return x(e, async () => {
      const t = new M();
      this.strategy.plugins.push(t);
      for (const [a, c] of this._urlsToCacheKeys) {
        const i = this._cacheKeysToIntegrities.get(c), o = this._urlsToCacheModes.get(a), l = new Request(a, {
          integrity: i,
          cache: o,
          credentials: "same-origin"
        });
        await Promise.all(this.strategy.handleAll({
          params: { cacheKey: c },
          request: l,
          event: e
        }));
      }
      const { updatedURLs: s, notUpdatedURLs: r } = t;
      return { updatedURLs: s, notUpdatedURLs: r };
    });
  }
  /**
   * Deletes assets that are no longer present in the current precache manifest.
   * Call this method from the service worker activate event.
   *
   * Note: this method calls `event.waitUntil()` for you, so you do not need
   * to call it yourself in your event handlers.
   *
   * @param {ExtendableEvent} event
   * @return {Promise<workbox-precaching.CleanupResult>}
   */
  activate(e) {
    return x(e, async () => {
      const t = await self.caches.open(this.strategy.cacheName), s = await t.keys(), r = new Set(this._urlsToCacheKeys.values()), a = [];
      for (const c of s)
        r.has(c.url) || (await t.delete(c), a.push(c.url));
      return { deletedURLs: a };
    });
  }
  /**
   * Returns a mapping of a precached URL to the corresponding cache key, taking
   * into account the revision information for the URL.
   *
   * @return {Map<string, string>} A URL to cache key mapping.
   */
  getURLsToCacheKeys() {
    return this._urlsToCacheKeys;
  }
  /**
   * Returns a list of all the URLs that have been precached by the current
   * service worker.
   *
   * @return {Array<string>} The precached URLs.
   */
  getCachedURLs() {
    return [...this._urlsToCacheKeys.keys()];
  }
  /**
   * Returns the cache key used for storing a given URL. If that URL is
   * unversioned, like `/index.html', then the cache key will be the original
   * URL with a search parameter appended to it.
   *
   * @param {string} url A URL whose cache key you want to look up.
   * @return {string} The versioned URL that corresponds to a cache key
   * for the original URL, or undefined if that URL isn't precached.
   */
  getCacheKeyForURL(e) {
    const t = new URL(e, location.href);
    return this._urlsToCacheKeys.get(t.href);
  }
  /**
   * @param {string} url A cache key whose SRI you want to look up.
   * @return {string} The subresource integrity associated with the cache key,
   * or undefined if it's not set.
   */
  getIntegrityForCacheKey(e) {
    return this._cacheKeysToIntegrities.get(e);
  }
  /**
   * This acts as a drop-in replacement for
   * [`cache.match()`](https://developer.mozilla.org/en-US/docs/Web/API/Cache/match)
   * with the following differences:
   *
   * - It knows what the name of the precache is, and only checks in that cache.
   * - It allows you to pass in an "original" URL without versioning parameters,
   * and it will automatically look up the correct cache key for the currently
   * active revision of that URL.
   *
   * E.g., `matchPrecache('index.html')` will find the correct precached
   * response for the currently active service worker, even if the actual cache
   * key is `'/index.html?__WB_REVISION__=1234abcd'`.
   *
   * @param {string|Request} request The key (without revisioning parameters)
   * to look up in the precache.
   * @return {Promise<Response|undefined>}
   */
  async matchPrecache(e) {
    const t = e instanceof Request ? e.url : e, s = this.getCacheKeyForURL(t);
    if (s)
      return (await self.caches.open(this.strategy.cacheName)).match(s);
  }
  /**
   * Returns a function that looks up `url` in the precache (taking into
   * account revision information), and returns the corresponding `Response`.
   *
   * @param {string} url The precached URL which will be used to lookup the
   * `Response`.
   * @return {workbox-routing~handlerCallback}
   */
  createHandlerBoundToURL(e) {
    const t = this.getCacheKeyForURL(e);
    if (!t)
      throw new u("non-precached-url", { url: e });
    return (s) => (s.request = new Request(e), s.params = Object.assign({ cacheKey: t }, s.params), this.strategy.handle(s));
  }
}
let L;
const K = () => (L || (L = new X()), L);
try {
  self["workbox:routing:7.3.0"] && _();
} catch {
}
const O = "GET", T = (n) => n && typeof n == "object" ? n : { handle: n };
class k {
  /**
   * Constructor for Route class.
   *
   * @param {workbox-routing~matchCallback} match
   * A callback function that determines whether the route matches a given
   * `fetch` event by returning a non-falsy value.
   * @param {workbox-routing~handlerCallback} handler A callback
   * function that returns a Promise resolving to a Response.
   * @param {string} [method='GET'] The HTTP method to match the Route
   * against.
   */
  constructor(e, t, s = O) {
    this.handler = T(t), this.match = e, this.method = s;
  }
  /**
   *
   * @param {workbox-routing-handlerCallback} handler A callback
   * function that returns a Promise resolving to a Response
   */
  setCatchHandler(e) {
    this.catchHandler = T(e);
  }
}
class Y extends k {
  /**
   * If the regular expression contains
   * [capture groups]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp#grouping-back-references},
   * the captured values will be passed to the
   * {@link workbox-routing~handlerCallback} `params`
   * argument.
   *
   * @param {RegExp} regExp The regular expression to match against URLs.
   * @param {workbox-routing~handlerCallback} handler A callback
   * function that returns a Promise resulting in a Response.
   * @param {string} [method='GET'] The HTTP method to match the Route
   * against.
   */
  constructor(e, t, s) {
    const r = ({ url: a }) => {
      const c = e.exec(a.href);
      if (c && !(a.origin !== location.origin && c.index !== 0))
        return c.slice(1);
    };
    super(r, t, s);
  }
}
class Z {
  /**
   * Initializes a new Router.
   */
  constructor() {
    this._routes = /* @__PURE__ */ new Map(), this._defaultHandlerMap = /* @__PURE__ */ new Map();
  }
  /**
   * @return {Map<string, Array<workbox-routing.Route>>} routes A `Map` of HTTP
   * method name ('GET', etc.) to an array of all the corresponding `Route`
   * instances that are registered.
   */
  get routes() {
    return this._routes;
  }
  /**
   * Adds a fetch event listener to respond to events when a route matches
   * the event's request.
   */
  addFetchListener() {
    self.addEventListener("fetch", (e) => {
      const { request: t } = e, s = this.handleRequest({ request: t, event: e });
      s && e.respondWith(s);
    });
  }
  /**
   * Adds a message event listener for URLs to cache from the window.
   * This is useful to cache resources loaded on the page prior to when the
   * service worker started controlling it.
   *
   * The format of the message data sent from the window should be as follows.
   * Where the `urlsToCache` array may consist of URL strings or an array of
   * URL string + `requestInit` object (the same as you'd pass to `fetch()`).
   *
   * ```
   * {
   *   type: 'CACHE_URLS',
   *   payload: {
   *     urlsToCache: [
   *       './script1.js',
   *       './script2.js',
   *       ['./script3.js', {mode: 'no-cors'}],
   *     ],
   *   },
   * }
   * ```
   */
  addCacheListener() {
    self.addEventListener("message", (e) => {
      if (e.data && e.data.type === "CACHE_URLS") {
        const { payload: t } = e.data, s = Promise.all(t.urlsToCache.map((r) => {
          typeof r == "string" && (r = [r]);
          const a = new Request(...r);
          return this.handleRequest({ request: a, event: e });
        }));
        e.waitUntil(s), e.ports && e.ports[0] && s.then(() => e.ports[0].postMessage(!0));
      }
    });
  }
  /**
   * Apply the routing rules to a FetchEvent object to get a Response from an
   * appropriate Route's handler.
   *
   * @param {Object} options
   * @param {Request} options.request The request to handle.
   * @param {ExtendableEvent} options.event The event that triggered the
   *     request.
   * @return {Promise<Response>|undefined} A promise is returned if a
   *     registered route can handle the request. If there is no matching
   *     route and there's no `defaultHandler`, `undefined` is returned.
   */
  handleRequest({ request: e, event: t }) {
    const s = new URL(e.url, location.href);
    if (!s.protocol.startsWith("http"))
      return;
    const r = s.origin === location.origin, { params: a, route: c } = this.findMatchingRoute({
      event: t,
      request: e,
      sameOrigin: r,
      url: s
    });
    let i = c && c.handler;
    const o = e.method;
    if (!i && this._defaultHandlerMap.has(o) && (i = this._defaultHandlerMap.get(o)), !i)
      return;
    let l;
    try {
      l = i.handle({ url: s, request: e, event: t, params: a });
    } catch (d) {
      l = Promise.reject(d);
    }
    const R = c && c.catchHandler;
    return l instanceof Promise && (this._catchHandler || R) && (l = l.catch(async (d) => {
      if (R)
        try {
          return await R.handle({ url: s, request: e, event: t, params: a });
        } catch (E) {
          E instanceof Error && (d = E);
        }
      if (this._catchHandler)
        return this._catchHandler.handle({ url: s, request: e, event: t });
      throw d;
    })), l;
  }
  /**
   * Checks a request and URL (and optionally an event) against the list of
   * registered routes, and if there's a match, returns the corresponding
   * route along with any params generated by the match.
   *
   * @param {Object} options
   * @param {URL} options.url
   * @param {boolean} options.sameOrigin The result of comparing `url.origin`
   *     against the current origin.
   * @param {Request} options.request The request to match.
   * @param {Event} options.event The corresponding event.
   * @return {Object} An object with `route` and `params` properties.
   *     They are populated if a matching route was found or `undefined`
   *     otherwise.
   */
  findMatchingRoute({ url: e, sameOrigin: t, request: s, event: r }) {
    const a = this._routes.get(s.method) || [];
    for (const c of a) {
      let i;
      const o = c.match({ url: e, sameOrigin: t, request: s, event: r });
      if (o)
        return i = o, (Array.isArray(i) && i.length === 0 || o.constructor === Object && // eslint-disable-line
        Object.keys(o).length === 0 || typeof o == "boolean") && (i = void 0), { route: c, params: i };
    }
    return {};
  }
  /**
   * Define a default `handler` that's called when no routes explicitly
   * match the incoming request.
   *
   * Each HTTP method ('GET', 'POST', etc.) gets its own default handler.
   *
   * Without a default handler, unmatched requests will go against the
   * network as if there were no service worker present.
   *
   * @param {workbox-routing~handlerCallback} handler A callback
   * function that returns a Promise resulting in a Response.
   * @param {string} [method='GET'] The HTTP method to associate with this
   * default handler. Each method has its own default.
   */
  setDefaultHandler(e, t = O) {
    this._defaultHandlerMap.set(t, T(e));
  }
  /**
   * If a Route throws an error while handling a request, this `handler`
   * will be called and given a chance to provide a response.
   *
   * @param {workbox-routing~handlerCallback} handler A callback
   * function that returns a Promise resulting in a Response.
   */
  setCatchHandler(e) {
    this._catchHandler = T(e);
  }
  /**
   * Registers a route with the router.
   *
   * @param {workbox-routing.Route} route The route to register.
   */
  registerRoute(e) {
    this._routes.has(e.method) || this._routes.set(e.method, []), this._routes.get(e.method).push(e);
  }
  /**
   * Unregisters a route with the router.
   *
   * @param {workbox-routing.Route} route The route to unregister.
   */
  unregisterRoute(e) {
    if (!this._routes.has(e.method))
      throw new u("unregister-route-but-not-found-with-method", {
        method: e.method
      });
    const t = this._routes.get(e.method).indexOf(e);
    if (t > -1)
      this._routes.get(e.method).splice(t, 1);
    else
      throw new u("unregister-route-route-not-registered");
  }
}
let b;
const ee = () => (b || (b = new Z(), b.addFetchListener(), b.addCacheListener()), b);
function te(n, e, t) {
  let s;
  if (typeof n == "string") {
    const a = new URL(n, location.href), c = ({ url: i }) => i.href === a.href;
    s = new k(c, e, t);
  } else if (n instanceof RegExp)
    s = new Y(n, e, t);
  else if (typeof n == "function")
    s = new k(n, e, t);
  else if (n instanceof k)
    s = n;
  else
    throw new u("unsupported-route-type", {
      moduleName: "workbox-routing",
      funcName: "registerRoute",
      paramName: "capture"
    });
  return ee().registerRoute(s), s;
}
function se(n, e = []) {
  for (const t of [...n.searchParams.keys()])
    e.some((s) => s.test(t)) && n.searchParams.delete(t);
  return n;
}
function* ne(n, { ignoreURLParametersMatching: e = [/^utm_/, /^fbclid$/], directoryIndex: t = "index.html", cleanURLs: s = !0, urlManipulation: r } = {}) {
  const a = new URL(n, location.href);
  a.hash = "", yield a.href;
  const c = se(a, e);
  if (yield c.href, t && c.pathname.endsWith("/")) {
    const i = new URL(c.href);
    i.pathname += t, yield i.href;
  }
  if (s) {
    const i = new URL(c.href);
    i.pathname += ".html", yield i.href;
  }
  if (r) {
    const i = r({ url: a });
    for (const o of i)
      yield o.href;
  }
}
class re extends k {
  /**
   * @param {PrecacheController} precacheController A `PrecacheController`
   * instance used to both match requests and respond to fetch events.
   * @param {Object} [options] Options to control how requests are matched
   * against the list of precached URLs.
   * @param {string} [options.directoryIndex=index.html] The `directoryIndex` will
   * check cache entries for a URLs ending with '/' to see if there is a hit when
   * appending the `directoryIndex` value.
   * @param {Array<RegExp>} [options.ignoreURLParametersMatching=[/^utm_/, /^fbclid$/]] An
   * array of regex's to remove search params when looking for a cache match.
   * @param {boolean} [options.cleanURLs=true] The `cleanURLs` option will
   * check the cache for the URL with a `.html` added to the end of the end.
   * @param {workbox-precaching~urlManipulation} [options.urlManipulation]
   * This is a function that should take a URL and return an array of
   * alternative URLs that should be checked for precache matches.
   */
  constructor(e, t) {
    const s = ({ request: r }) => {
      const a = e.getURLsToCacheKeys();
      for (const c of ne(r.url, t)) {
        const i = a.get(c);
        if (i) {
          const o = e.getIntegrityForCacheKey(i);
          return { cacheKey: i, integrity: o };
        }
      }
    };
    super(s, e.strategy);
  }
}
function ae(n) {
  const e = K(), t = new re(e, n);
  te(t);
}
function ce(n) {
  K().precache(n);
}
function ie(n, e) {
  ce(n), ae(e);
}
ie([{"revision":null,"url":"vite.config.js"},{"revision":null,"url":"tailwind.config.js"},{"revision":null,"url":"sw-api-legacy.js"},{"revision":null,"url":"registerSW.js"},{"revision":null,"url":"postcss.config.js"},{"revision":null,"url":"index.js"},{"revision":null,"url":"index.html"},{"revision":null,"url":"index.css"},{"revision":null,"url":"src/sw.js"},{"revision":null,"url":"src/style.css"},{"revision":null,"url":"src/main.js"},{"revision":null,"url":"src/index.html"},{"revision":null,"url":"src/utils/theme.js"},{"revision":null,"url":"src/utils/db.js"},{"revision":null,"url":"public/sw-api-legacy.js"},{"revision":null,"url":"public/registerSW.js"},{"revision":"b29f852b0f96f5bc1fd24147d9130a5a","url":"manifest.webmanifest"}]);
const oe = "TaskManagerDB", le = 1, f = "tasks";
let h = null;
function g() {
  return new Promise((n, e) => {
    const t = indexedDB.open(oe, le);
    t.onerror = () => e(t.error), t.onsuccess = () => {
      h = t.result, n(h);
    }, t.onupgradeneeded = (s) => {
      const r = s.target.result;
      if (!r.objectStoreNames.contains(f)) {
        const a = r.createObjectStore(f, { keyPath: "id", autoIncrement: !0 });
        a.createIndex("status", "status", { unique: !1 }), a.createIndex("createdAt", "createdAt", { unique: !1 });
      }
    };
  });
}
async function he() {
  return h || await g(), new Promise((n, e) => {
    const s = h.transaction([f], "readonly").objectStore(f).getAll();
    s.onerror = () => e(s.error), s.onsuccess = () => n(s.result);
  });
}
async function ue(n) {
  return h || await g(), new Promise((e, t) => {
    const r = h.transaction([f], "readonly").objectStore(f).index("status").getAll(n);
    r.onerror = () => t(r.error), r.onsuccess = () => e(r.result);
  });
}
async function fe(n) {
  return h || await g(), new Promise((e, t) => {
    const r = h.transaction([f], "readonly").objectStore(f).get(n);
    r.onerror = () => t(r.error), r.onsuccess = () => e(r.result);
  });
}
async function de(n) {
  return h || await g(), new Promise((e, t) => {
    const s = h.transaction([f], "readwrite"), r = {
      ...n,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    }, a = s.objectStore(f).add(r);
    a.onerror = () => t(a.error), a.onsuccess = () => {
      r.id = a.result, e(r);
    };
  });
}
async function pe(n, e) {
  return h || await g(), new Promise((t, s) => {
    const a = h.transaction([f], "readwrite").objectStore(f), c = a.get(n);
    c.onerror = () => s(c.error), c.onsuccess = () => {
      const i = c.result;
      if (!i) {
        s(new Error("Task not found"));
        return;
      }
      const o = { ...i, ...e, updatedAt: (/* @__PURE__ */ new Date()).toISOString() }, l = a.put(o);
      l.onerror = () => s(l.error), l.onsuccess = () => t(o);
    };
  });
}
async function ge(n) {
  return h || await g(), new Promise((e, t) => {
    const r = h.transaction([f], "readwrite").objectStore(f).delete(n);
    r.onerror = () => t(r.error), r.onsuccess = () => e(n);
  });
}
function m(n, e = 200) {
  return new Response(JSON.stringify(n), {
    status: e,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
function y(n, e = 500) {
  return m({ error: n }, e);
}
function we(n) {
  const e = new URL(n), t = e.pathname, s = t.split("/").filter(Boolean);
  return { path: t, parts: s, query: Object.fromEntries(e.searchParams) };
}
async function ye(n) {
  const e = we(n.url), t = n.method, { parts: s } = e;
  try {
    h || await g();
    const r = s.findIndex((i) => i === "api");
    if (r === -1) return y("Invalid API route", 404);
    const a = s.slice(r + 1), c = a.length;
    if (t === "GET" && c === 1 && a[0] === "tasks")
      return m(await he());
    if (t === "GET" && c === 3 && a[0] === "tasks" && a[1] === "status")
      return m(await ue(a[2]));
    if (t === "GET" && c === 2 && a[0] === "tasks") {
      const i = parseInt(a[1], 10);
      if (Number.isNaN(i)) return y("Invalid task ID", 400);
      const o = await fe(i);
      return o ? m(o) : y("Task not found", 404);
    }
    if (t === "POST" && c === 1 && a[0] === "tasks") {
      const i = await n.json(), o = await de(i);
      return m(o, 201);
    }
    if (t === "PUT" && c === 2 && a[0] === "tasks") {
      const i = parseInt(a[1], 10);
      if (Number.isNaN(i)) return y("Invalid task ID", 400);
      const o = await n.json(), l = await pe(i, o);
      return m(l);
    }
    if (t === "DELETE" && c === 2 && a[0] === "tasks") {
      const i = parseInt(a[1], 10);
      return Number.isNaN(i) ? y("Invalid task ID", 400) : (await ge(i), m({ message: "Task deleted successfully" }, 200));
    }
    return t === "OPTIONS" ? new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    }) : y("Route not found", 404);
  } catch (r) {
    return y(r.message || "Internal server error", 500);
  }
}
self.addEventListener("message", (n) => {
  n.data && n.data.type === "SKIP_WAITING" && self.skipWaiting();
});
self.addEventListener("fetch", (n) => {
  const e = new URL(n.request.url).pathname;
  if (e.endsWith("/favicon.ico")) {
    n.respondWith(new Response(null, { status: 204 }));
    return;
  }
  e.includes("/api/") && n.respondWith(ye(n.request.clone()));
});
self.addEventListener("install", (n) => {
  self.skipWaiting(), n.waitUntil(g());
});
self.addEventListener("activate", (n) => {
  n.waitUntil(Promise.all([g(), self.clients.claim()]));
});
