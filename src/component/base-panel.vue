<!-- 
   - Copyright (C) 2018 Qli5. All Rights Reserved.
   -
   - @author qli5 <goodlq11[at](163|gmail).com>
   - 
   - This Source Code Form is subject to the terms of the Mozilla Public
   - License, v. 2.0. If a copy of the MPL was not distributed with this
   - file, You can obtain one at http://mozilla.org/MPL/2.0/. -->

<template>
    <div class="panel"></div>
</template>

<script>
export default {};
</script>

<style scoped>
.panel {
  position: fixed;
  top: 100px;
  bottom: 100px;
  left: 50%;
  width: 540px;
  margin-left: -270px;

  z-index: 10036;
  overflow-y: auto;

  padding: 30px 50px;
  background: white;
  border: 6px;
  box-shadow: rgba(0, 0, 0, 0.6) 1px 1px 40px 0px;
}
</style>
