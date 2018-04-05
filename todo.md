# TO DO:

1. cache-db

   - [x] Firefox has introduced IDBMutableFile. We should use it.

   - [x] Chrome has fixed its writer.seek. 

2. detailed-fetch-blob

   - [ ] ~~We now have AbortController in both Chrome and Firefox.~~
     
     why not just the standard stream control(abort, cancel) ?

   - [ ] If we refactor cache-db, we can also streamify fetch.

     pipeline: fetch >> flowmeter: {abort, end, error, progress, throttle, delay} >>  disk

3. streamify flv merge

   - [ ] Use a cache-db/tmp

     pipeline: cachedb >> transform >> disk/temp
