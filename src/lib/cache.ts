import { unstable_cache as nextCache } from "next/cache";
import { cache as reactCache } from "react";

// Define a type alias for a callback function that returns a Promise and can accept any arguments
type Callback = (...args: any[]) => Promise<any>;

// A function to cache the result of an asynchronous callback using Next.js and React's caching mechanisms
export function cache<T extends Callback>(
  cb: T, // The callback function to be cached
  keyParts: string[], // An array of strings to generate a unique cache key
  options: { revalidate?: number | false; tags?: string[] } = {}, // Optional cache control options
) {
  // Use React's cache function to cache the callback, and then pass it to Next.js's caching mechanism
  return nextCache(reactCache(cb), keyParts, options);
}

// NOTE:
/*
unstable_cache (Next.js Cache):

Part of the Next.js API that enables caching at the framework level.
The unstable_cache function allows developers to cache the result of a function, improving performance by avoiding repeated calculations or fetching of the same data.
cache (React Cache):

Part of React's experimental features, used to cache asynchronous functions in React components.
Helps in caching data within React's rendering lifecycle, ensuring that the same data isn't refetched or recalculated on each render.
Callback Type:

Defines a type alias for a function that can take any arguments and returns a Promise. This ensures the cached function adheres to this signature.
keyParts:

An array of strings that uniquely identify the cached data.
Used to generate a unique cache key for each combination of inputs to ensure that different results are cached separately.
options:

Optional configuration for the cache:
revalidate: Specifies the revalidation time in seconds or false for no revalidation.
tags: An array of tags to associate with the cache entry, useful for cache invalidation.
*/