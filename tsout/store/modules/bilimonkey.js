/*
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 *
 * @author qli5 <goodlq11[at](163|gmail).com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const state = () => ({
    mp4: '',
    ass: '',
    flvs: [],
    flvDescriptors: []
});
const initState = state();
const dependencyCollector = ({ cid, playerWin, protocol, options }) => ({
    state,
    mutations: {
        reset(state) {
            Object.assign(state, initState);
        }
    },
    getters: {},
    actions: {
        [cid]: {
            root: true,
            handler({ commit }) { return commit('reset'); }
        }
    },
});
//# sourceMappingURL=bilimonkey.js.map