# TO DO:

1. cache-db

   - [x] Firefox has introduced IDBMutableFile. We should use it.
   - [x] Chrome has fixed its webkitFilesystem writer.seek. 

2. detailed-fetch-blob

   - [ ] ~~We now have AbortController in both Chrome and Firefox.~~
     why not just the standard stream control(abort, cancel) ? 

   - [ ] If we streamify cache-db, we can also streamify fetch.
     pipeline: fetch >> flowmeter: {abort, end, error, progress, (throttle, delay)} >>  disk

3. streamify flv merge

   - [ ] Use a cache-db/tmp
     pipeline: cachedb >> transform >> disk/temp

4. remove Promise anti-pattern

   - [ ] deprecate AsyncContainer
   - [ ] deprecate Mutex
