/***
 * BiliPolyfill
 * A bilibili user script
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

import HookedFunction from '../util/hooked-function.js';

class BiliPolyfill {
    /***
     * Assumption: aid, cid, pageno does not change during lifecycle
     * Create a new BiliPolyfill if assumption breaks
     */
    constructor(playerWin, option = BiliPolyfill.optionDefaults, hintInfo = () => { }) {
        this.playerWin = playerWin;
        this.option = option;
        this.hintInfo = hintInfo;

        this.video = null;

        this.series = [];
        this.userdata = { oped: {}, restore: {} };

        this.destroy = new HookedFunction();
        this.playerWin.addEventListener('beforeunload', this.destroy);
        this.destroy.addCallback(() => this.playerWin.removeEventListener('beforeunload', this.destroy));

        this.BiliDanmakuSettings =
            class BiliDanmakuSettings {
                static getPlayerSettings() {
                    return playerWin.localStorage.bilibili_player_settings && JSON.parse(playerWin.localStorage.bilibili_player_settings)
                }
                static get(key) {
                    const player_settings = BiliDanmakuSettings.getPlayerSettings()
                    return player_settings.setting_config && player_settings.setting_config[key]
                }
                static set(key, value) {
                    const player_settings = BiliDanmakuSettings.getPlayerSettings()
                    player_settings.setting_config[key] = value
                    playerWin.localStorage.bilibili_player_settings = JSON.stringify(player_settings)
                }
            }
    }

    saveUserdata() {
        this.option.setStorage('biliPolyfill', JSON.stringify(this.userdata));
    }

    retrieveUserdata() {
        try {
            this.userdata = this.option.getStorage('biliPolyfill');
            if (this.userdata.length > 1073741824) top.alert('BiliPolyfill脚本数据已经快满了，在播放器上右键->BiliPolyfill->片头片尾->检视数据，删掉一些吧。');
            this.userdata = JSON.parse(this.userdata);
        }
        catch (e) { }
        finally {
            if (!this.userdata) this.userdata = {};
            if (!(this.userdata.oped instanceof Object)) this.userdata.oped = {};
            if (!(this.userdata.restore instanceof Object)) this.userdata.restore = {};
        }
    }

    async setFunctions({ videoRefresh = false } = {}) {
        // 1. initialize
        this.video = await this.getPlayerVideo();

        if (!videoRefresh) {
            this.retrieveUserdata();
        }

        // 2. if not enabled, run the process without real actions
        if (!this.option.betabeta) return this.getPlayerMenu();

        try {
            // 3. set up functions that are cid static
            if (!videoRefresh) {
                if (this.option.badgeWatchLater) {
                    await this.getWatchLaterBtn()
                    this.badgeWatchLater();
                }
                if (this.option.scroll) this.scrollToPlayer();

                if (this.option.series) this.inferNextInSeries();

                if (this.option.recommend) this.showRecommendTab();
                if (this.option.focus) this.focusOnPlayer();
                if (this.option.restorePrevent) this.restorePreventShade();
                if (this.option.restoreDanmuku) this.restoreDanmukuSwitch();
                if (this.option.restoreSpeed) this.restoreSpeed();
                if (this.option.restoreWide) {
                    await this.getWideScreenBtn()
                    this.restoreWideScreen();
                }
                if (this.option.autoResume) this.autoResume();
                if (this.option.autoPlay) this.autoPlay();
                if (this.option.autoFullScreen) this.autoFullScreen();
                if (this.option.limitedKeydown) this.limitedKeydownFullScreenPlay();
                this.destroy.addCallback(() => this.saveUserdata());
            }

            // 4. set up functions that are binded to the video DOM
            if (this.option.dblclick) this.dblclickFullScreen();
            if (this.option.electric) this.reallocateElectricPanel();
            if (this.option.oped) this.skipOPED();
            this.video.addEventListener('emptied', () => this.setFunctions({ videoRefresh: true }), { once: true });
        } catch (err) {
            console.error(err)
        }

        // 5. set up functions that require everything to be ready
        await this.getPlayerMenu();
        if (this.option.menuFocus) this.menuFocusOnPlayer();

        // 6. set up experimental functions
        if (this.option.speech) top.document.body.addEventListener('click', e => e.detail > 2 && this.speechRecognition());
    }

    async inferNextInSeries() {
        // 1. find current title
        const title = top.document.getElementsByTagName('h1')[0].textContent.replace(/\(\d+\)$/, '').trim();

        // 2. find current ep number
        const ep = title.match(/\d+(?=[^\d]*$)/);
        if (!ep) return this.series = [];

        // 3. current title - current ep number => series common title
        const seriesTitle = title.slice(0, title.lastIndexOf(ep)).trim();

        // 4. find sibling ep number
        const epNumber = parseInt(ep);
        const epSibling = ep[0] == '0' ?
            [(epNumber - 1).toString().padStart(ep.length, '0'), (epNumber + 1).toString().padStart(ep.length, '0')] :
            [(epNumber - 1).toString(), (epNumber + 1).toString()];

        // 5. build search keywords
        //    [self, seriesTitle + epSibling, epSibling]
        const keywords = [title, ...epSibling.map(e => seriesTitle + e), ...epSibling];

        // 6. find mid
        const midParent = top.document.querySelector('.u-info > .name') || top.document.getElementById('r-info-rank') || top.document.querySelector('.user');
        if (!midParent) return this.series = [];
        const mid = midParent.children[0].href.match(/\d+/)[0];

        // 7. fetch query
        const vlist = await Promise.all(keywords.map(keyword => new Promise((resolve, reject) => {
            const req = new XMLHttpRequest();
            req.onload = () => resolve((req.response.status && req.response.data.vlist) || []);
            req.onerror = reject;
            req.open('get', `https://space.bilibili.com/ajax/member/getSubmitVideos?mid=${mid}&keyword=${keyword}`);
            req.responseType = 'json';
            req.send();
        })));

        // 8. verify current video exists
        vlist[0] = vlist[0].filter(e => e.title == title);
        if (!vlist[0][0]) { console && console.warn('BiliPolyfill: inferNextInSeries: cannot find current video in mid space'); return this.series = []; }

        // 9. if seriesTitle + epSibling qurey has reasonable results => pick
        this.series = [vlist[1].find(e => e.created < vlist[0][0].created), vlist[2].reverse().find(e => e.created > vlist[0][0].created)];

        // 10. fallback: if epSibling qurey has reasonable results => pick
        if (!this.series[0]) this.series[0] = vlist[3].find(e => e.created < vlist[0][0].created);
        if (!this.series[1]) this.series[1] = vlist[4].reverse().find(e => e.created > vlist[0][0].created);

        return this.series;
    }

    badgeWatchLater() {
        // 1. find watchlater button
        const li = top.document.getElementById('i_menu_watchLater_btn') || top.document.getElementById('i_menu_later_btn') || top.document.querySelector('li.nav-item[report-id=playpage_watchlater]');
        if (!li) return;

        // 2. initialize watchlater panel
        const observer = new MutationObserver(() => {

            // 3. hide watchlater panel
            observer.disconnect();
            li.children[1].style.visibility = 'hidden';

            // 4. loading => wait
            if (li.children[1].children[0].children[0].className == 'm-w-loading') {
                const observer = new MutationObserver(() => {

                    // 5. clean up watchlater panel
                    observer.disconnect();
                    li.dispatchEvent(new Event('mouseleave'));
                    setTimeout(() => li.children[1].style.visibility = '', 700);

                    // 6.1 empty list => do nothing
                    if (li.children[1].children[0].children[0].className == 'no-data') return;

                    // 6.2 otherwise => append div
                    const div = top.document.createElement('div');
                    div.className = 'num';
                    if (li.children[1].children[0].children[0].children.length > 5) {
                        div.textContent = '5+';
                    }
                    else {
                        div.textContent = li.children[1].children[0].children[0].children.length;
                    }
                    li.children[0].append(div);
                    this.destroy.addCallback(() => div.remove());
                });
                observer.observe(li.children[1].children[0], { childList: true });
            }

            // 4.2 otherwise => error
            else {
                throw 'badgeWatchLater: cannot find m-w-loading panel';
            }
        });
        observer.observe(li, { childList: true });
        li.dispatchEvent(new Event('mouseenter'));
    }

    dblclickFullScreen() {
        this.video.addEventListener('dblclick', () =>
            this.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-fullscreen').click()
        );
    }

    scrollToPlayer() {
        if (top.scrollY < 200) top.document.getElementById('bilibili-player').scrollIntoView();
    }

    showRecommendTab() {
        const h = this.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-filter-btn-recommend');
        if (h) h.click();
    }

    async getCoverImage() { // 番剧用原来的方法只能获取到番剧的封面，改用API可以获取到每集的封面
        const viewUrl = "https://api.bilibili.com/x/web-interface/view?aid=" + aid

        try {
            const res = await fetch(viewUrl)
            const viewJson = await res.json()
            return viewJson.data.pic.replace("http://", "https://")
        }
        catch (e) {
            return null
        }
    }

    reallocateElectricPanel() {
        // 1. autopart == wait => ok
        if (!this.playerWin.localStorage.bilibili_player_settings) return;
        if (!this.playerWin.localStorage.bilibili_player_settings.includes('"autopart":1') && !this.option.electricSkippable) return;

        // 2. wait for electric panel
        this.video.addEventListener('ended', () => {
            setTimeout(() => {
                // 3. click skip
                const electricPanel = this.playerWin.document.getElementsByClassName('bilibili-player-electric-panel')[0];
                if (!electricPanel) return;
                electricPanel.children[2].click();

                // 4. but display a fake electric panel
                electricPanel.style.display = 'block';
                electricPanel.style.zIndex = 233;

                // 5. and perform a fake countdown
                let countdown = 5;
                const h = setInterval(() => {
                    // 5.1 yield to next part hint
                    if (this.playerWin.document.getElementsByClassName('bilibili-player-video-toast-item-jump')[0]) electricPanel.style.zIndex = '';

                    // 5.2 countdown > 0 => update textContent
                    if (countdown > 0) {
                        electricPanel.children[2].children[0].textContent = `0${countdown}`;
                        countdown--;
                    }

                    // 5.3 countdown == 0 => clean up
                    else {
                        clearInterval(h);
                        electricPanel.remove();
                    }
                }, 1000);
            }, 0);
        }, { once: true });
    }

    /**
     * As of March 2018:
     * opacity: 
     *   bilibili_player_settings.setting_config.opacity
     *   persist :)
     * preventshade:
     *   bilibili_player_settings.setting_config.preventshade
     *   will be overwritten
     *   bilibili has a broken setting roaming scheme where the preventshade default is always used
     * type_bottom, type_scroll, type_top:
     *   bilibili_player_settings.setting_config.type_(bottom|scroll|top)
     *   sessionStorage ONLY
     *   not sure if it is a feature or a bug
     * danmaku switch:
     *   not stored
     * videospeed:
     *   bilibili_player_settings.video_status.videospeed
     *   sessionStorage ONLY
     *   same as above
     * widescreen:
     *   same as above
     */
    restorePreventShade() {
        // 1. restore option should be an array
        if (!Array.isArray(this.userdata.restore.preventShade)) this.userdata.restore.preventShade = [];

        // 2. find corresponding option index
        const index = top.location.href.includes('bangumi') ? 0 : 1;

        // 3. MUST initialize setting panel before click
        let danmaku_btn = this.playerWin.document.querySelector('.bilibili-player-video-btn-danmaku, .bilibili-player-video-danmaku-setting');
        if (!danmaku_btn) return;
        danmaku_btn.dispatchEvent(new Event('mouseover'));

        // 4. restore if true
        const input = this.playerWin.document.querySelector(".bilibili-player-video-danmaku-setting-left-preventshade input");
        if (this.userdata.restore.preventShade[index] && !input.checked) {
            input.click();
        }

        // 5. clean up setting panel
        danmaku_btn.dispatchEvent(new Event('mouseout'));

        // 6. memorize option
        this.destroy.addCallback(() => {
            this.userdata.restore.preventShade[index] = input.checked;
        });
    }

    restoreDanmukuSwitch() {
        // 1. restore option should be an array
        if (!Array.isArray(this.userdata.restore.danmukuSwitch)) this.userdata.restore.danmukuSwitch = [];
        if (!Array.isArray(this.userdata.restore.danmukuScrollSwitch)) this.userdata.restore.danmukuScrollSwitch = [];
        if (!Array.isArray(this.userdata.restore.danmukuTopSwitch)) this.userdata.restore.danmukuTopSwitch = [];
        if (!Array.isArray(this.userdata.restore.danmukuBottomSwitch)) this.userdata.restore.danmukuBottomSwitch = [];
        if (!Array.isArray(this.userdata.restore.danmukuColorSwitch)) this.userdata.restore.danmukuColorSwitch = [];
        if (!Array.isArray(this.userdata.restore.danmukuSpecialSwitch)) this.userdata.restore.danmukuSpecialSwitch = [];

        // 2. find corresponding option index
        const index = top.location.href.includes('bangumi') ? 0 : 1;

        // 3. MUST initialize setting panel before click
        let danmaku_btn = this.playerWin.document.querySelector('.bilibili-player-video-btn-danmaku, .bilibili-player-video-danmaku-setting');
        if (!danmaku_btn) return;
        danmaku_btn.dispatchEvent(new Event('mouseover'));

        // 4. restore if true
        // 4.1 danmukuSwitch
        const danmukuSwitchInput = this.playerWin.document.querySelector('.bilibili-player-video-danmaku-switch input');
        if (this.userdata.restore.danmukuSwitch[index] && danmukuSwitchInput.checked) {
            danmukuSwitchInput.click();
        }

        // 4.2 danmukuScrollSwitch danmukuTopSwitch danmukuBottomSwitch danmukuColorSwitch danmukuSpecialSwitch
        const [danmukuScrollSwitchDiv, danmukuTopSwitchDiv, danmukuBottomSwitchDiv, danmukuColorSwitchDiv, danmukuSpecialSwitchDiv] = this.playerWin.document.querySelector('.bilibili-player-video-danmaku-setting-left-block-content').children;
        if (this.userdata.restore.danmukuScrollSwitch[index] && !danmukuScrollSwitchDiv.classList.contains('disabled')) {
            danmukuScrollSwitchDiv.click();
        }
        if (this.userdata.restore.danmukuTopSwitch[index] && !danmukuTopSwitchDiv.classList.contains('disabled')) {
            danmukuTopSwitchDiv.click();
        }
        if (this.userdata.restore.danmukuBottomSwitch[index] && !danmukuBottomSwitchDiv.classList.contains('disabled')) {
            danmukuBottomSwitchDiv.click();
        }
        if (this.userdata.restore.danmukuColorSwitch[index] && !danmukuColorSwitchDiv.classList.contains('disabled')) {
            danmukuColorSwitchDiv.click();
        }
        if (this.userdata.restore.danmukuSpecialSwitch[index] && !danmukuSpecialSwitchDiv.classList.contains('disabled')) {
            danmukuSpecialSwitchDiv.click();
        }

        // 5. clean up setting panel
        danmaku_btn.dispatchEvent(new Event('mouseout'));

        // 6. memorize final option
        this.destroy.addCallback(() => {
            this.userdata.restore.danmukuSwitch[index] = !danmukuSwitchInput.checked;
            this.userdata.restore.danmukuScrollSwitch[index] = danmukuScrollSwitchDiv.classList.contains('disabled');
            this.userdata.restore.danmukuTopSwitch[index] = danmukuTopSwitchDiv.classList.contains('disabled');
            this.userdata.restore.danmukuBottomSwitch[index] = danmukuBottomSwitchDiv.classList.contains('disabled');
            this.userdata.restore.danmukuColorSwitch[index] = danmukuColorSwitchDiv.classList.contains('disabled');
            this.userdata.restore.danmukuSpecialSwitch[index] = danmukuSpecialSwitchDiv.classList.contains('disabled');
        });
    }

    restoreSpeed() {
        // 1. restore option should be an array
        if (!Array.isArray(this.userdata.restore.speed)) this.userdata.restore.speed = [];

        // 2. find corresponding option index
        const index = top.location.href.includes('bangumi') ? 0 : 1;

        // 3. restore if different
        if (this.userdata.restore.speed[index] && this.userdata.restore.speed[index] != this.video.playbackRate) {
            this.video.playbackRate = this.userdata.restore.speed[index];
        }

        // 4. memorize option
        this.playerWin.player.addEventListener("video_before_destroy", () => this.saveSpeed());

        const observer = new MutationObserver(() => {
            const changeSpeedBtn = this.playerWin.document.querySelectorAll(".bilibili-player-contextmenu-subwrapp")[0]
            if (changeSpeedBtn && !changeSpeedBtn._memorize_speed) {
                changeSpeedBtn.addEventListener("click", () => this.saveSpeed())
                changeSpeedBtn._memorize_speed = true
            }
        });
        observer.observe(this.playerWin.document.querySelector("#bilibiliPlayer"), { childList: true, subtree: true });
    }

    saveSpeed() {
        if (this.option.restoreSpeed) {
            // 1. restore option should be an array
            if (!Array.isArray(this.userdata.restore.speed)) this.userdata.restore.speed = [];

            // 2. find corresponding option index
            const index = top.location.href.includes('bangumi') ? 0 : 1;

            // 3. memorize
            this.userdata.restore.speed[index] = this.video.playbackRate;
        }
    }

    restoreWideScreen() {
        // 1. restore option should be an array
        if (!Array.isArray(this.userdata.restore.wideScreen)) this.userdata.restore.wideScreen = [];

        // 2. find corresponding option index
        const index = top.location.href.includes('bangumi') ? 0 : 1;

        // 3. restore if different
        const i = this.playerWin.document.querySelector('.bilibili-player-video-btn-widescreen')
        if (this.userdata.restore.wideScreen[index] && !i.classList.contains('closed') && !i.firstElementChild.classList.contains('icon-24wideon')) {
            i.click();
        }

        // 4. memorize option
        this.destroy.addCallback(() => {
            this.userdata.restore.wideScreen[index] = i.classList.contains('closed') || i.firstElementChild.classList.contains('icon-24wideon');
        });
    }

    loadOffineSubtitles() {
        // NO. NOBODY WILL NEED THIS。
        // Hint: https://github.com/jamiees2/ass-to-vtt
        throw 'Not implemented';
    }

    autoResume() {
        // 1. wait for canplay => wait for resume popup
        const h = () => {
            // 2. parse resume popup
            const span = this.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-toast-bottom div.bilibili-player-video-toast-item-text span:nth-child(2)');
            if (!span) return;
            const [min, sec] = span.textContent.split(':');
            if (!min || !sec) return;

            // 3. parse last playback progress
            const time = parseInt(min) * 60 + parseInt(sec);

            // 3.1 still far from end => reasonable to resume => click
            if (time < this.video.duration - 10) {
                // 3.1.1 already playing => no need to pause => simply jump
                if (!this.video.paused || this.video.autoplay) {
                    this.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-toast-bottom div.bilibili-player-video-toast-item-jump').click();
                }

                // 3.1.2 paused => should remain paused after jump => hook video.play
                else {
                    const play = this.video.play;
                    this.video.play = () => setTimeout(() => {
                        this.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-start').click();
                        this.video.play = play;
                    }, 0);
                    this.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-toast-bottom div.bilibili-player-video-toast-item-jump').click();
                }
            }

            // 3.2 near end => silent popup
            else {
                this.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-toast-bottom div.bilibili-player-video-toast-item-close').click();
                this.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-toast-bottom').children[0].style.visibility = 'hidden';
            }
        };
        this.video.addEventListener('canplay', h, { once: true });
        setTimeout(() => this.video && this.video.removeEventListener && this.video.removeEventListener('canplay', h), 3000);
    }

    autoPlay() {
        this.video.autoplay = true;
        setTimeout(() => {
            if (this.video.paused) this.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-start').click()
        }, 0);
    }

    autoFullScreen() {
        if (this.playerWin.document.querySelector('#bilibiliPlayer div.video-state-fullscreen-off')) {
            this.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-fullscreen').click();
        }
    }

    getCollectionId() {
        if (aid) {
            return `av${aid}`
        }

        return (top.location.pathname.match(/av\d+/) || top.location.hash.match(/av\d+/) || top.document.querySelector('div.bangumi-info a, .media-title').href).toString();
    }

    markOPEDPosition(index) {
        const collectionId = this.getCollectionId();
        if (!Array.isArray(this.userdata.oped[collectionId])) this.userdata.oped[collectionId] = [];
        this.userdata.oped[collectionId][index] = this.video.currentTime;
        this.saveUserdata()
    }

    clearOPEDPosition() {
        const collectionId = this.getCollectionId();
        this.userdata.oped[collectionId] = undefined;
    }

    skipOPED() {
        // 1. find corresponding userdata
        const collectionId = this.getCollectionId();
        if (!Array.isArray(this.userdata.oped[collectionId]) || !this.userdata.oped[collectionId].length) return;

        /**
         * structure:
         *   listen for time update -> || <- skip -> || <- remove event listenner
         */

        // 2. | 0 <- opening -> oped[collectionId][1] | <- play --
        if (!this.userdata.oped[collectionId][0] && this.userdata.oped[collectionId][1]) {
            const h = () => {
                if (this.video.currentTime >= this.userdata.oped[collectionId][1] - 1) {
                    this.video.removeEventListener('timeupdate', h);
                }
                else {
                    this.video.currentTime = this.userdata.oped[collectionId][1];
                    this.hintInfo('BiliPolyfill: 已跳过片头');
                }
            }
            this.video.addEventListener('timeupdate', h);
        }

        // 3. | <- play -> | oped[collectionId][0] <- opening -> oped[collectionId][1] | <- play --
        if (this.userdata.oped[collectionId][0] && this.userdata.oped[collectionId][1]) {
            const h = () => {
                if (this.video.currentTime >= this.userdata.oped[collectionId][1] - 1) {
                    this.video.removeEventListener('timeupdate', h);
                }
                else if (this.video.currentTime > this.userdata.oped[collectionId][0]) {
                    this.video.currentTime = this.userdata.oped[collectionId][1];
                    this.hintInfo('BiliPolyfill: 已跳过片头');
                }
            }
            this.video.addEventListener('timeupdate', h);
        }

        // 4. -- play -> | oped[collectionId][2] <- ending -> end |
        if (this.userdata.oped[collectionId][2] && !this.userdata.oped[collectionId][3]) {
            const h = () => {
                if (this.video.currentTime >= this.video.duration - 1) {
                    this.video.removeEventListener('timeupdate', h);
                }
                else if (this.video.currentTime > this.userdata.oped[collectionId][2]) {
                    this.video.currentTime = this.video.duration;
                    this.hintInfo('BiliPolyfill: 已跳过片尾');
                }
            }
            this.video.addEventListener('timeupdate', h);
        }

        // 5.-- play -> | oped[collectionId][2] <- ending -> oped[collectionId][3] | <- play -> end |
        if (this.userdata.oped[collectionId][2] && this.userdata.oped[collectionId][3]) {
            const h = () => {
                if (this.video.currentTime >= this.userdata.oped[collectionId][3] - 1) {
                    this.video.removeEventListener('timeupdate', h);
                }
                else if (this.video.currentTime > this.userdata.oped[collectionId][2]) {
                    this.video.currentTime = this.userdata.oped[collectionId][3];
                    this.hintInfo('BiliPolyfill: 已跳过片尾');
                }
            }
            this.video.addEventListener('timeupdate', h);
        }
    }

    setVideoSpeed(speed) {
        if (speed < 0 || speed > 10) return;
        this.video.playbackRate = speed;
        this.saveSpeed()
    }

    focusOnPlayer() {
        let player = this.playerWin.document.getElementsByClassName('bilibili-player-video-progress')[0]
        if (player) player.click();
    }

    menuFocusOnPlayer() {
        this.playerWin.document.getElementsByClassName('bilibili-player-context-menu-container black')[0].addEventListener('click', () =>
            setTimeout(() => this.focusOnPlayer(), 0)
        );
    }

    limitedKeydownFullScreenPlay() {
        // 1. listen for any user guesture
        const h = e => {
            // 2. not real user guesture => do nothing
            if (!e.isTrusted) return;

            // 3. key down is Enter => full screen play
            if (e.key == 'Enter') {
                // 3.1 full screen
                if (this.playerWin.document.querySelector('#bilibiliPlayer div.video-state-fullscreen-off')) {
                    this.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-fullscreen').click();
                }

                // 3.2 play
                if (this.video.paused) {
                    if (this.video.readyState) {
                        this.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-start').click();
                    }
                    else {
                        this.video.addEventListener('canplay', () => {
                            this.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-start').click()
                        }, { once: true });
                    }
                }
            }

            // 4. clean up listener
            top.document.removeEventListener('keydown', h);
            top.document.removeEventListener('click', h);
        };
        top.document.addEventListener('keydown', h);
        top.document.addEventListener('click', h);
    }

    speechRecognition() {
        // 1. polyfill
        const SpeechRecognition = top.SpeechRecognition || top.webkitSpeechRecognition;
        const SpeechGrammarList = top.SpeechGrammarList || top.webkitSpeechGrammarList;

        // 2. give hint
        alert('Yahaha! You found me!\nBiliTwin支持的语音命令: 播放 暂停 全屏 关闭 加速 减速 下一集\nChrome may support Cantonese or Hakka as well. See BiliPolyfill::speechRecognition.');
        if (!SpeechRecognition || !SpeechGrammarList) alert('浏览器太旧啦~彩蛋没法运行~');

        // 3. setup recognition
        const player = ['播放', '暂停', '全屏', '关闭', '加速', '减速', '下一集'];
        const grammar = '#JSGF V1.0; grammar player; public <player> = ' + player.join(' | ') + ' ;';
        const recognition = new SpeechRecognition();
        const speechRecognitionList = new SpeechGrammarList();
        speechRecognitionList.addFromString(grammar, 1);
        recognition.grammars = speechRecognitionList;
        // cmn: Mandarin(Putonghua), yue: Cantonese, hak: Hakka
        // See https://www.iana.org/assignments/language-subtag-registry/language-subtag-registry
        recognition.lang = 'cmn';
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.start();
        recognition.onresult = e => {
            const last = e.results.length - 1;
            const transcript = e.results[last][0].transcript;
            switch (transcript) {
                case '播放':
                    if (this.video.paused) this.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-start').click();
                    this.hintInfo(`BiliPolyfill: 语音:播放`);
                    break;
                case '暂停':
                    if (!this.video.paused) this.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-start').click();
                    this.hintInfo(`BiliPolyfill: 语音:暂停`);
                    break;
                case '全屏':
                    this.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-fullscreen').click();
                    this.hintInfo(`BiliPolyfill: 语音:全屏`);
                    break;
                case '关闭':
                    top.close();
                    break;
                case '加速':
                    this.setVideoSpeed(2);
                    this.hintInfo(`BiliPolyfill: 语音:加速`);
                    break;
                case '减速':
                    this.setVideoSpeed(0.5);
                    this.hintInfo(`BiliPolyfill: 语音:减速`);
                    break;
                case '下一集':
                    this.video.dispatchEvent(new Event('ended'));
                default:
                    this.hintInfo(`BiliPolyfill: 语音:"${transcript}"？`);
                    break;
            }
            typeof console == "object" && console.log(e.results);
            typeof console == "object" && console.log(`transcript:${transcript} confidence:${e.results[0][0].confidence}`);
        };
    }

    substitudeFullscreenPlayer(option) {
        // 1. check param
        if (!option) throw 'usage: substitudeFullscreenPlayer({cid, aid[, p][, ...otherOptions]})';
        if (!option.cid) throw 'player init: cid missing';
        if (!option.aid) throw 'player init: aid missing';

        // 2. hook exitFullscreen
        const playerDoc = this.playerWin.document;
        const hook = [playerDoc.webkitExitFullscreen, playerDoc.mozExitFullScreen, playerDoc.msExitFullscreen, playerDoc.exitFullscreen];
        playerDoc.webkitExitFullscreen = playerDoc.mozExitFullScreen = playerDoc.msExitFullscreen = playerDoc.exitFullscreen = () => { };

        // 3. substitude player
        this.playerWin.player.destroy();
        this.playerWin.player = new bilibiliPlayer(option);
        if (option.p) this.playerWin.callAppointPart(option.p);

        // 4. restore exitFullscreen
        [playerDoc.webkitExitFullscreen, playerDoc.mozExitFullScreen, playerDoc.msExitFullscreen, playerDoc.exitFullscreen] = hook;
    }

    async getPlayerVideo() {
        if (this.playerWin.document.getElementsByTagName('video').length) {
            return this.video = this.playerWin.document.getElementsByTagName('video')[0];
        }
        else {
            return new Promise(resolve => {
                const observer = new MutationObserver(() => {
                    if (this.playerWin.document.getElementsByTagName('video').length) {
                        observer.disconnect();
                        resolve(this.video = this.playerWin.document.getElementsByTagName('video')[0]);
                    }
                });
                observer.observe(this.playerWin.document.getElementById('bilibiliPlayer'), { childList: true });
            });
        }
    }

    async getPlayerMenu() {
        if (this.playerWin.document.getElementsByClassName('bilibili-player-context-menu-container black').length) {
            return this.playerWin.document.getElementsByClassName('bilibili-player-context-menu-container black')[0];
        }
        else {
            return new Promise(resolve => {
                const observer = new MutationObserver(() => {
                    if (this.playerWin.document.getElementsByClassName('bilibili-player-context-menu-container black').length) {
                        observer.disconnect();
                        resolve(this.playerWin.document.getElementsByClassName('bilibili-player-context-menu-container black')[0]);
                    }
                });
                observer.observe(this.playerWin.document.getElementById('bilibiliPlayer'), { childList: true });
            });
        }
    }

    async getWatchLaterBtn() {
        let li = top.document.getElementById('i_menu_watchLater_btn') || top.document.getElementById('i_menu_later_btn') || top.document.querySelector('li.nav-item[report-id=playpage_watchlater]');

        if (!document.cookie.includes("DedeUserID")) return; // 未登录

        if (!li) {
            return new Promise(resolve => {
                const observer = new MutationObserver(() => {
                    li = top.document.getElementById('i_menu_watchLater_btn') || top.document.getElementById('i_menu_later_btn') || top.document.querySelector('li.nav-item[report-id=playpage_watchlater]');
                    if (li) {
                        observer.disconnect();
                        resolve(li);
                    }
                });
                observer.observe(this.playerWin.document.getElementById('bilibiliPlayer'), { childList: true });
            });
        }
    }

    async getWideScreenBtn() {
        let li = top.document.querySelector('.bilibili-player-video-btn-widescreen');

        if (!li) {
            return new Promise(resolve => {
                const observer = new MutationObserver(() => {
                    li = top.document.querySelector('.bilibili-player-video-btn-widescreen');
                    if (li) {
                        observer.disconnect();
                        resolve(li);
                    }
                });
                observer.observe(this.playerWin.document.getElementById('bilibiliPlayer'), { childList: true });
            });
        }
    }

    static async openMinimizedPlayer(option = { cid: top.cid, aid: top.aid, playerWin: top }) {
        // 1. check param
        if (!option) throw 'usage: openMinimizedPlayer({cid[, aid]})';
        if (!option.cid) throw 'player init: cid missing';
        if (!option.aid) option.aid = top.aid;
        if (!option.playerWin) option.playerWin = top;

        // 2. open a new window
        const miniPlayerWin = top.open(`//www.bilibili.com/blackboard/html5player.html?cid=${option.cid}&aid=${option.aid}&crossDomain=${top.document.domain != 'www.bilibili.com' ? 'true' : ''}`, undefined, ' ');

        // 3. bangumi => request referrer must match => hook response of current page
        const res = top.location.href.includes('bangumi') && await new Promise(resolve => {
            const jq = option.playerWin.jQuery;
            const _ajax = jq.ajax;

            jq.ajax = function (a, c) {
                if (typeof c === 'object') { if (typeof a === 'string') c.url = a; a = c; c = undefined };
                if (a.url.includes('interface.bilibili.com/v2/playurl?') || a.url.includes('bangumi.bilibili.com/player/web_api/v2/playurl?')) {
                    a.success = resolve;
                    jq.ajax = _ajax;
                }
                return _ajax.call(jq, a, c);
            };
            option.playerWin.player.reloadAccess();
        });

        // 4. wait for miniPlayerWin load
        await new Promise(resolve => {
            // 4.1 check for every500ms
            const i = setInterval(() => miniPlayerWin.document.getElementById('bilibiliPlayer') && resolve(), 500);

            // 4.2 explict event listener
            miniPlayerWin.addEventListener('load', resolve, { once: true });

            // 4.3 timeout after 6s
            setTimeout(() => {
                clearInterval(i);
                miniPlayerWin.removeEventListener('load', resolve);
                resolve();
            }, 6000);
        });
        // 4.4 cannot find bilibiliPlayer => load timeout
        const playerDiv = miniPlayerWin.document.getElementById('bilibiliPlayer');
        if (!playerDiv) { console.warn('openMinimizedPlayer: document load timeout'); return; }

        // 5. need to inject response => new bilibiliPlayer
        if (res) {
            await new Promise(resolve => {
                const jq = miniPlayerWin.jQuery;
                const _ajax = jq.ajax;

                jq.ajax = function (a, c) {
                    if (typeof c === 'object') { if (typeof a === 'string') c.url = a; a = c; c = undefined };
                    if (a.url.includes('interface.bilibili.com/v2/playurl?') || a.url.includes('bangumi.bilibili.com/player/web_api/v2/playurl?')) {
                        a.success(res)
                        jq.ajax = _ajax;
                        resolve();
                    }
                    else {
                        return _ajax.call(jq, a, c);
                    }
                };
                miniPlayerWin.player = new miniPlayerWin.bilibiliPlayer({ cid: option.cid, aid: option.aid });
                // miniPlayerWin.eval(`player = new bilibiliPlayer({ cid: ${option.cid}, aid: ${option.aid} })`);
                // console.log(`player = new bilibiliPlayer({ cid: ${option.cid}, aid: ${option.aid} })`);
            })
        }

        // 6.  wait for bilibiliPlayer load
        await new Promise(resolve => {
            if (miniPlayerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-fullscreen')) resolve();
            else {
                const observer = new MutationObserver(() => {
                    if (miniPlayerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-fullscreen')) {
                        observer.disconnect();
                        resolve();
                    }
                });
                observer.observe(playerDiv, { childList: true });
            }
        });

        // 7. adopt full screen player style withour really trigger full screen
        // 7.1 hook requestFullscreen
        const hook = [playerDiv.webkitRequestFullscreen, playerDiv.mozRequestFullScreen, playerDiv.msRequestFullscreen, playerDiv.requestFullscreen];
        playerDiv.webkitRequestFullscreen = playerDiv.mozRequestFullScreen = playerDiv.msRequestFullscreen = playerDiv.requestFullscreen = () => { };

        // 7.2 adopt full screen player style
        if (miniPlayerWin.document.querySelector('#bilibiliPlayer div.video-state-fullscreen-off'))
            miniPlayerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-fullscreen').click();

        // 7.3 restore requestFullscreen
        [playerDiv.webkitRequestFullscreen, playerDiv.mozRequestFullScreen, playerDiv.msRequestFullscreen, playerDiv.requestFullscreen] = hook;
    }

    static async biligameInit() {
        const game_id = location.href.match(/id=(\d+)/)[1]
        const api_url = `https://line1-h5-pc-api.biligame.com/game/detail/gameinfo?game_base_id=${game_id}`

        const req = await fetch(api_url, { credentials: 'include' })
        const data = (await req.json()).data

        const aid = data.video_url
        const video_url = `https://www.bilibili.com/video/av${aid}`

        const tabs = document.querySelector(".tab-head")
        const tab = document.createElement("a")
        tab.href = video_url
        tab.textContent = "查看视频"
        tab.target = "_blank"
        tabs.appendChild(tab)
    }

    static showBangumiCoverImage() {
        const imgElement = document.querySelector(".media-preview img")
        if (!imgElement) return;

        imgElement.style.cursor = "pointer"

        imgElement.onclick = () => {
            const cover_img = imgElement.src.match(/.+?\.(png|jpg)/)[0]
            top.window.open(cover_img, '_blank')
        }
    }

    static secondToReadable(s) {
        if (s > 60) return `${parseInt(s / 60)}分${parseInt(s % 60)}秒`;
        else return `${parseInt(s % 60)}秒`;
    }

    static clearAllUserdata(playerWin = top) {
        if (playerWin.GM_setValue) return GM_setValue('biliPolyfill', '');
        if (playerWin.GM.setValue) return GM.setValue('biliPolyfill', '');
        playerWin.localStorage.removeItem('biliPolyfill');
    }

    static get optionDescriptions() {
        return [
            ['betabeta', '增强组件总开关 <---------更加懒得测试了，反正以后B站也会自己提供这些功能。也许吧。'],

            // 1. user interface
            ['badgeWatchLater', '稍后再看添加数字角标'],
            ['recommend', '弹幕列表换成相关视频'],
            ['electric', '整合充电榜与换P倒计时'],
            ['electricSkippable', '跳过充电榜', 'disabled'],

            // 2. automation
            ['scroll', '自动滚动到播放器'],
            ['focus', '自动聚焦到播放器(新页面直接按空格会播放而不是向下滚动)'],
            ['menuFocus', '关闭菜单后聚焦到播放器'],
            ['restorePrevent', '记住防挡字幕'],
            ['restoreDanmuku', '记住弹幕开关(顶端/底端/滚动/全部)'],
            ['restoreSpeed', '记住播放速度'],
            ['restoreWide', '记住宽屏'],
            ['autoResume', '自动跳转上次看到'],
            ['autoPlay', '自动播放(需要在浏览器站点权限设置中允许自动播放)'],
            ['autoFullScreen', '自动全屏'],
            ['oped', '标记后自动跳OP/ED'],
            ['series', '尝试自动找上下集'],

            // 3. interaction
            ['limitedKeydown', '首次回车键可全屏自动播放(需要在脚本加载完毕后使用)'],
            ['dblclick', '双击全屏'],

            // 4. easter eggs
            ['speech', '(彩蛋)(需墙外)任意三击鼠标左键开启语音识别'],
        ];
    }

    static get optionDefaults() {
        return {
            betabeta: false,

            // 1. user interface
            badgeWatchLater: true,
            recommend: true,
            electric: true,
            electricSkippable: false,

            // 2. automation
            scroll: true,
            focus: false,
            menuFocus: true,
            restorePrevent: false,
            restoreDanmuku: false,
            restoreSpeed: true,
            restoreWide: true,
            autoResume: true,
            autoPlay: false,
            autoFullScreen: false,
            oped: true,
            series: true,

            // 3. interaction
            limitedKeydown: true,
            dblclick: true,

            // 4. easter eggs
            speech: false,
        }
    }

    static _UNIT_TEST() {
        console.warn('This test is impossible.');
        console.warn('You need to close the tab, reopen it, etc.');
        console.warn('Maybe you also want to test between bideo parts, etc.');
        console.warn('I am too lazy to find workarounds.');
    }
}

export default BiliPolyfill;
