<!-- 
   - Copyright (C) 2018 Qli5. All Rights Reserved.
   -
   - @author qli5 <goodlq11[at](163|gmail).com>
   - 
   - This Source Code Form is subject to the terms of the Mozilla Public
   - License, v. 2.0. If a copy of the MPL was not distributed with this
   - file, You can obtain one at http://mozilla.org/MPL/2.0/. -->

<template>
    <BlankPanel 
        v-if="display"
        @dragenter.stop.prevent
        @dragover.stop.prevent
        @drop.stop.prevent="mergeFLV"
    >
        <table>
            <tr v-for="({ url, downloader, blob, blobUrl }, index) of flvDesriptors" :key="url">
                <td><a :href="url">FLV分段 {{ index }}</a></td>
                <td>
                    <a v-if="!blob" @click="downloadFLV(flv)">缓存本段</a>
                    <a v-else-if="flv.readyState === 3"></a>
                </td>
                <td><progress :value="loaded" :max="total">进度条</progress></td>
            </tr>
        </table>
    </BlankPanel>
</template>

<script>
import BlankPanel from "./base-panel.vue";
import BlankPanelButton from "./base-panel-button.vue";

export default {};
</script>


<style scoped>
</style>
