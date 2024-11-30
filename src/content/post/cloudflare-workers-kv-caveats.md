---
layout: ../../layouts/post.astro
title: "Cloudflare: Workers KV caveats"
description: "Discover key limitations of Cloudflare Workers KV from real production experience: unavailability in China market, cold cache latency issues of up to 500ms, and practical workarounds learned during migration from DynamoDB at EF Education First."
dateFormatted: "November 17, 2019"
---

> Workers KV is a global, low-latency, key-value data store. It supports exceptionally high read volumes with low latency, making it possible to build highly dynamic APIs and websites that respond as quickly as a cached static file would.

[Cloudflare Workers KV Overview](https://developers.cloudflare.com/workers/reference/storage/overview/)

At EF Education First, we migrated some functionality from a monolith application to a Cloudflare Worker. Part of the challenge was figuring out how to use existing data (stored in DynamoDB) in the Worker. Worker KV seemed like a perfect tool for the job due to its:

- **Key-value store**  
- **Low-latency reads**  
- **High availability**  
- **Worker API**  

After months of development, a few production releases, and countless hours of debugging, here are the caveats I discovered.

---

## Not Available in China

If you need to support the Chinese market, Worker KV won’t work. This limitation requires a fallback solution, which can make Worker KV an impractical choice. If you have to build a custom storage solution for China, you might as well extend it globally to avoid dealing with special cases.

Here’s an excerpt from my conversation with Cloudflare support:

> *I just checked with my colleagues, and unfortunately you are correct, Workers KV does not work in China.*  
> *It seems that the KV won’t be supported in China for a while now. Our team had a meeting with Baidu regarding this, but it seems that they couldn’t agree on any solution.*

### Fix?

- If your data fits in a Worker (total script limit is 1MB), put it directly in the Worker script.
- Store your data as JSON on a publicly accessible origin and cache it.

---

## “Cold Cache” is Slow and Frequent

Worker KV’s read performance depends on the read volume for a given key. Maximum performance for a key isn’t achieved unless it’s being read at least a couple of times per minute in any given data center.

[Cloudflare Workers KV Limitations](https://developers.cloudflare.com/workers/reference/storage/limitations/)

I observed response times for `NAMESPACE.get(key)` taking as long as ~500ms at times from the Zurich edge location. This wasn’t as much of an issue in North America, so we contacted support about these slow response times.

> *Depending on where in the world the request is coming from, the request time for a cold-start is on average about 100–300ms — the storage is held in the central US.*

This adds an extra ~300ms to **TTFB (Time to First Byte)**, which is pretty bad. 

For cached keys, response times were excellent: ~6–8ms. 👍

From my investigation, cached keys are invalidated after 60 seconds, as described in the official documentation:

> *While writes will often be visible globally immediately, it can take up to 60 seconds before reads in all edge locations are guaranteed to see the new value.*

### Fix?

- **Keep the cache “hot”** by pinging each key every minute. However, this has to be done for every data center.  
- **Reduce the number of keys** by storing more data under a single key (value size limit per key is 10MB).  
- **Store data directly in the Worker script** if it fits (1MB total script limit).  
- Store your data as JSON on a publicly accessible origin and cache it.

---

## Conclusion

Cloudflare is a great product, but Worker KV is currently a bit disappointing. While it provides much-needed functionality, it doesn’t deliver as expected in its current state. Developers must be aware of its limitations and adjust their usage patterns to avoid introducing performance bottlenecks.

The **China availability issue** is particularly concerning, as there’s no mention of it in the documentation. Without a fallback solution from Cloudflare, Worker KV is unusable for businesses supporting customers in China.

