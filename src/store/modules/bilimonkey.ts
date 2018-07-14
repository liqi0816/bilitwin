/* 
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { StoreOptions } from 'vuex';

const state = () => ({
    mp4: '',
    ass: '',
    flvs: [] as string[],
    flvDescriptors: [] as {
        remote: string
        local: string
        blob: Blob
        loaded: number
        total: number
        controller: { abort(): void }
    }[]
})

const initState = state();

type BiliMonkeyState = typeof initState

interface BiliMonkeyDependencies {
    cid: string
    playerWin: string
    protocol: string
    options: string
}

const dependencyCollector = ({ cid, playerWin, protocol, options }: BiliMonkeyDependencies): StoreOptions<BiliMonkeyState> => ({
    state,
    mutations: {
        reset(state) {
            Object.assign(state, initState);
        }
    },
    getters: {

    },
    actions: {
        [cid]: {
            root: true,
            handler({ commit }) { return commit('reset'); }
        }
    },
})
