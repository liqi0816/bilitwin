# EMERGENCY:

- [ ] decouple UI and Twin (remove cross reference!)
- [ ] compatibility with player V0.10.0 

# TO DO:

1. cache-db

   - [x] Firefox has introduced IDBMutableFile. We should use it.
   - [x] Chrome has fixed its webkitFilesystem writer.seek. 

2. detailed-fetch-blob

   - [x] ~~We now have AbortController in both Chrome and Firefox.~~
     why not just the standard stream control(abort, cancel) ? 

   - [x] If we streamify cache-db, we can also streamify fetch.
     pipeline: fetch >> flowmeter: {abort, end, error, progress, (throttle)} >>  disk

3. streamify flv merge

   - [x] Use a cache-db/tmp
     pipeline: cachedb >> transform >> disk/temp

4. remove Promise anti-pattern
   *low priority*

   - [ ] deprecate AsyncContainer
   - [ ] deprecate Mutex
