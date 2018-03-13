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

class BiliPolyfill {
    constructor(playerWin,
        option = {
            setStorage: (n, i) => playerWin.localStorage.setItem(n, i),
            getStorage: n => playerWin.localStorage.getItem(n),
            badgeWatchLater: true,
            dblclick: true,
            scroll: true,
            recommend: true,
            electric: true,
            electricSkippable: false,
            lift: true,
            autoResume: true,
            autoPlay: false,
            autoWideScreen: false,
            autoFullScreen: false,
            oped: true,
            focus: true,
            menuFocus: true,
            limitedKeydown: true,
            speech: false,
            series: true,
        }, hintInfo = () => { }) {
        this.playerWin = playerWin;
        this.video = null;
        this.vanillaPlayer = null;
        this.option = option;
        this.setStorage = option.setStorage;
        this.getStorage = option.getStorage;
        this.hintInfo = hintInfo;
        this.series = [];
        this.userdata = { oped: {} };
    }

    saveUserdata() {
        this.setStorage('biliPolyfill', JSON.stringify(this.userdata));
    }

    retrieveUserdata() {
        try {
            this.userdata = this.getStorage('biliPolyfill');
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
        // 1. Initialize
        this.video = await this.getPlayerVideo();

        // 2. If not enabled, run the process without real actions
        if (!this.option.betabeta) return this.getPlayerMenu();

        // 3. Set up functions that are page static
        if (!videoRefresh) {
            this.retrieveUserdata();
            if (this.option.badgeWatchLater) this.badgeWatchLater();
            if (this.option.scroll) this.scrollToPlayer();
            if (this.option.recommend) this.showRecommendTab();
            if (this.option.autoResume) this.autoResume();
            if (this.option.autoPlay) this.autoPlay();
            if (this.option.autoWideScreen) this.autoWideScreen();
            if (this.option.autoFullScreen) this.autoFullScreen();
            if (this.option.focus) this.focusOnPlayer();
            if (this.option.limitedKeydown) this.limitedKeydownFullScreenPlay();
            if (this.option.series) this.inferNextInSeries();
            this.playerWin.addEventListener('beforeunload', () => this.saveUserdata());
        }

        // 4. Set up functions that are binded to the video DOM
        if (this.option.lift) this.liftBottomDanmuku();
        if (this.option.dblclick) this.dblclickFullScreen();
        if (this.option.electric) this.reallocateElectricPanel();
        if (this.option.oped) this.skipOPED();
        this.video.addEventListener('emptied', () => this.setFunctions({ videoRefresh: true }));

        // 5. Set up functions that require everything to be ready
        await this.getPlayerMenu();
        if (this.option.menuFocus) this.menuFocusOnPlayer();

        // 6. Set up experimental functions
        if (this.option.speech) top.document.body.addEventListener('click', e => e.detail > 2 && this.speechRecognition());
    }

    async inferNextInSeries() {
        let title = top.document.getElementsByTagName('h1')[0].textContent.replace(/\(\d+\)$/, '').trim();

        // 1. Find series name
        let epNumberText = title.match(/\d+/g);
        if (!epNumberText) return this.series = [];
        epNumberText = epNumberText.pop();
        let seriesTitle = title.slice(0, title.lastIndexOf(epNumberText)).trim();
        // 2. Substitude ep number
        let ep = parseInt(epNumberText);
        if (epNumberText === '09') ep = [`08`, `10`];
        else if (epNumberText[0] === '0') ep = [`0${ep - 1}`, `0${ep + 1}`];
        else ep = [`${ep - 1}`, `${ep + 1}`];
        ep = [...ep.map(e => seriesTitle + e), ...ep];

        let mid = top.document.getElementById('r-info-rank') || top.document.querySelector('.user');
        if (!mid) return this.series = [];
        mid = mid.children[0].href.match(/\d+/)[0];
        let vlist = await Promise.all([title, ...ep].map(keyword => new Promise((resolve, reject) => {
            let req = new XMLHttpRequest();
            req.onload = () => resolve((req.response.status && req.response.data.vlist) || []);
            req.onerror = reject;
            req.open('get', `https://space.bilibili.com/ajax/member/getSubmitVideos?mid=${mid}&keyword=${keyword}`);
            req.responseType = 'json';
            req.send();
        })));

        vlist[0] = [vlist[0].find(e => e.title == title)];
        if (!vlist[0][0]) { console && console.warn('BiliPolyfill: inferNextInSeries: cannot find current video in mid space'); return this.series = []; }
        this.series = [vlist[1].find(e => e.created < vlist[0][0].created), vlist[2].reverse().find(e => e.created > vlist[0][0].created)];
        if (!this.series[0]) this.series[0] = vlist[3].find(e => e.created < vlist[0][0].created) || null;
        if (!this.series[1]) this.series[1] = vlist[4].reverse().find(e => e.created > vlist[0][0].created) || null;

        return this.series;
    }

    badgeWatchLater() {
        let li = top.document.getElementById('i_menu_watchLater_btn') || top.document.getElementById('i_menu_later_btn');
        if (!li || !li.children[1]) return;
        li.children[1].style.visibility = 'hidden';
        li.dispatchEvent(new Event('mouseover'));
        let observer = new MutationObserver(() => {
            if (li.children[1].children[0].children[0].className == 'm-w-loading') return;
            observer.disconnect();
            li.dispatchEvent(new Event('mouseout'));
            setTimeout(() => li.children[1].style.visibility = '', 700);
            if (li.children[1].children[0].children[0].className == 'no-data') return;
            let div = top.document.createElement('div');
            div.className = 'num';
            div.style.display = 'block';
            div.style.left = 'initial';
            div.style.right = '-6px';
            if (li.children[1].children[0].children.length > 5) {
                div.textContent = '5+';
            }
            else {
                div.textContent = li.children[1].children[0].children.length;
            }
            li.appendChild(div);

        });
        observer.observe(li.children[1].children[0], { childList: true });
    }

    dblclickFullScreen() {
        this.video.addEventListener('dblclick', () =>
            this.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-fullscreen').click()
        );
    }

    scrollToPlayer() {
        if (top.scrollY < 200) top.document.getElementById('bofqi').scrollIntoView();
    }

    showRecommendTab() {
        let h = this.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-filter-btn-recommend');
        if (h) h.click();
    }

    getCoverImage() {
        let ret = top.document.querySelector('.cover_image')
            || top.document.querySelector('div.info-cover > a > img')
            || top.document.querySelector('[data-state-play="true"]  img')
            || top.document.querySelector('script[type="application/ld+json"]');
        if (!ret) return null;

        ret = ret.src || JSON.parse(ret.textContent).images[0];
        let i;
        i = ret.indexOf('.jpg');
        if (i != -1) ret = ret.slice(0, i + 4);
        i = ret.indexOf('.png');
        if (i != -1) ret = ret.slice(0, i + 4);
        return ret;
    }

    reallocateElectricPanel() {
        if (!this.playerWin.localStorage.bilibili_player_settings) return;
        if (!this.playerWin.localStorage.bilibili_player_settings.includes('"autopart":1') && !this.option.electricSkippable) return;
        this.video.addEventListener('ended', () => {
            setTimeout(() => {
                let i = this.playerWin.document.getElementsByClassName('bilibili-player-electric-panel')[0];
                if (!i) return;
                i.children[2].click();
                i.style.display = 'block';
                i.style.zIndex = 233;
                let j = 5;
                let h = setInterval(() => {
                    if (this.playerWin.document.getElementsByClassName('bilibili-player-video-toast-item-jump')[0]) i.style.zIndex = '';
                    if (j > 0) {
                        i.children[2].children[0].textContent = `0${j}`;
                        j--;
                    }
                    else {
                        clearInterval(h);
                        i.remove();
                    }
                }, 1000);
            }, 0);
        });
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
     */
    // MUST initialize setting panel before click
    // this.playerWin.document.getElementsByName('ctlbar_danmuku_close')[0].dispatchEvent(new Event('mouseenter'));
    // this.playerWin.document.getElementsByName('ctlbar_danmuku_close')[0].dispatchEvent(new Event('mouseleave'));
    restorePreventShade() {
        let input = Array.from(this.playerWin.document.getElementsByName('ctlbar_danmuku_prevent'));
        if (this.userdata.restore['preventshade'] && !input[0].nextSibling.className.includes('bpui-state-active')) {
            input.click();
        }
        let h = e => {
            this.userdata.restore['preventshade'] = e.target.nextSibling.className.includes('bpui-state-active') || undefined;
        };

    }

    restoreDanmukuSwitch() {

    }

    restoreSpeed() {

    }

    restoreWideScreen() {
        if (this.playerWin.document.querySelector('#bilibiliPlayer i.icon-24wideoff'))
        this.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-widescreen').click();
    }


    loadOffineSubtitles() {
        // NO. NOBODY WILL NEED THIS。
        // Hint: https://github.com/jamiees2/ass-to-vtt
        throw 'Not implemented';
    }

    autoResume() {
        let h = () => {
            let span = this.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-toast-bottom div.bilibili-player-video-toast-item-text span:nth-child(2)');
            if (!span) return;
            let [min, sec] = span.textContent.split(':');
            if (!min || !sec) return;
            let time = parseInt(min) * 60 + parseInt(sec);
            if (time < this.video.duration - 10) {
                if (!this.video.paused || this.video.autoplay) {
                    this.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-toast-bottom div.bilibili-player-video-toast-item-jump').click();
                }
                else {
                    let play = this.video.play;
                    this.video.play = () => setTimeout(() => {
                        this.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-start').click();
                        this.video.play = play;
                    }, 0);
                    this.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-toast-bottom div.bilibili-player-video-toast-item-jump').click();
                }
            }
            else {
                this.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-toast-bottom div.bilibili-player-video-toast-item-close').click();
                this.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-toast-bottom').children[0].style.visibility = 'hidden';
            }
        };
        this.video.addEventListener('canplay', h);
        setTimeout(() => this.video && this.video.removeEventListener && this.video.removeEventListener('canplay', h), 3000);
    }

    autoPlay() {
        this.video.autoplay = true;
        setTimeout(() => {
            if (this.video.paused) this.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-start').click()
        }, 0);
    }

    autoFullScreen() {
        if (this.playerWin.document.querySelector('#bilibiliPlayer div.video-state-fullscreen-off'))
            this.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-fullscreen').click();
    }

    getCollectionId() {
        return (top.location.pathname.match(/av\d+/) || top.location.hash.match(/av\d+/) || top.document.querySelector('div.bangumi-info a').href).toString();
    }

    markOPEDPosition(index) {
        let collectionId = this.getCollectionId();
        if (!Array.isArray(this.userdata.oped[collectionId])) this.userdata.oped[collectionId] = [];
        this.userdata.oped[collectionId][index] = this.video.currentTime;
    }

    clearOPEDPosition() {
        let collectionId = this.getCollectionId();
        this.userdata.oped[collectionId] = undefined;
    }

    skipOPED() {
        let collectionId = this.getCollectionId();
        if (!Array.isArray(this.userdata.oped[collectionId]) || !this.userdata.oped[collectionId].length) return;

        /**
         * structure:
         *   listen for time update -> || <- skip -> || <- remove event listenner
         */
        if (!this.userdata.oped[collectionId][0] && this.userdata.oped[collectionId][1]) {
            let h = () => {
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
        if (this.userdata.oped[collectionId][0] && this.userdata.oped[collectionId][1]) {
            let h = () => {
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
        if (this.userdata.oped[collectionId][2] && !this.userdata.oped[collectionId][3]) {
            let h = () => {
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
        if (this.userdata.oped[collectionId][2] && this.userdata.oped[collectionId][3]) {
            let h = () => {
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
    }

    focusOnPlayer() {
        this.playerWin.document.getElementsByClassName('bilibili-player-video-progress')[0].click();
    }

    menuFocusOnPlayer() {
        this.playerWin.document.getElementsByClassName('bilibili-player-context-menu-container black')[0].addEventListener('click', () => setTimeout(() => this.focusOnPlayer(), 0));
    }

    limitedKeydownFullScreenPlay() {
        let h = e => {
            if (!e.isTrusted) return;
            if (e.key == 'Enter') {
                if (this.playerWin.document.querySelector('#bilibiliPlayer div.video-state-fullscreen-off')) {
                    this.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-fullscreen').click();
                }
                if (this.video.paused) {
                    if (this.video.readyState) {
                        this.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-start').click();
                    }
                    else {
                        let i = () => {
                            this.playerWin.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-start').click();
                            this.video.removeEventListener('canplay', i);
                        }
                        this.video.addEventListener('canplay', i);
                    }
                }
            }
            top.document.removeEventListener('keydown', h);
            top.document.removeEventListener('click', h);
        };
        top.document.addEventListener('keydown', h);
        top.document.addEventListener('click', h);
    }

    speechRecognition() {
        const SpeechRecognition = top.SpeechRecognition || top.webkitSpeechRecognition;
        const SpeechGrammarList = top.SpeechGrammarList || top.webkitSpeechGrammarList;
        alert('Yahaha! You found me!\nBiliTwin支持的语音命令: 播放 暂停 全屏 关闭 加速 减速 下一集\nChrome may support Cantonese or Hakka as well. See BiliPolyfill::speechRecognition.');
        if (!SpeechRecognition || !SpeechGrammarList) alert('浏览器太旧啦~彩蛋没法运行~');
        let player = ['播放', '暂停', '全屏', '关闭', '加速', '减速', '下一集'];
        let grammar = '#JSGF V1.0; grammar player; public <player> = ' + player.join(' | ') + ' ;';
        let recognition = new SpeechRecognition();
        let speechRecognitionList = new SpeechGrammarList();
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
            let last = e.results.length - 1;
            let transcript = e.results[last][0].transcript;
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
        if (!option) throw 'usage: substitudeFullscreenPlayer({cid, aid[, p][, ...otherOptions]})';
        if (!option.cid) throw 'player init: cid missing';
        if (!option.aid) throw 'player init: aid missing';
        let h = this.playerWin.document;
        let i = [h.webkitExitFullscreen, h.mozExitFullScreen, h.msExitFullscreen, h.exitFullscreen];
        h.webkitExitFullscreen = h.mozExitFullScreen = h.msExitFullscreen = h.exitFullscreen = () => { };
        this.playerWin.player.destroy();
        this.playerWin.player = new bilibiliPlayer(option);
        if (option.p) this.playerWin.callAppointPart(option.p);
        [h.webkitExitFullscreen, h.mozExitFullScreen, h.msExitFullscreen, h.exitFullscreen] = i;
    }

    async getPlayerVideo() {
        if (this.playerWin.document.getElementsByTagName('video').length) {
            return this.video = this.playerWin.document.getElementsByTagName('video')[0];
        }
        else {
            return new Promise(resolve => {
                let observer = new MutationObserver(() => {
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
                let observer = new MutationObserver(() => {
                    if (this.playerWin.document.getElementsByClassName('bilibili-player-context-menu-container black').length) {
                        observer.disconnect();
                        resolve(this.playerWin.document.getElementsByClassName('bilibili-player-context-menu-container black')[0]);
                    }
                });
                observer.observe(this.playerWin.document.getElementById('bilibiliPlayer'), { childList: true });
            });
        }
    }

    static async openMinimizedPlayer(option = { cid: top.cid, aid: top.aid, playerWin: top }) {
        if (!option) throw 'usage: openMinimizedPlayer({cid[, aid]})';
        if (!option.cid) throw 'player init: cid missing';
        if (!option.aid) option.aid = top.aid;
        if (!option.playerWin) option.playerWin = top;

        let h = top.open(`//www.bilibili.com/blackboard/html5player.html?cid=${option.cid}&aid=${option.aid}&crossDomain=${top.document.domain != 'www.bilibili.com' ? 'true' : ''}`, undefined, ' ');
        let res = top.location.href.includes('bangumi') && await new Promise(resolve => {
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

        await new Promise(resolve => {
            let i = setInterval(() => h.document.getElementById('bilibiliPlayer') && resolve(), 500);
            h.addEventListener('load', resolve);
            setTimeout(() => {
                clearInterval(i);
                h.removeEventListener('load', resolve);
                resolve();
            }, 6000);
        });
        let div = h.document.getElementById('bilibiliPlayer');
        if (!div) { console.warn('openMinimizedPlayer: document load timeout'); return; }

        if (res) {
            await new Promise(resolve => {
                const jq = h.jQuery;
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
                h.player = new h.bilibiliPlayer({ cid: option.cid, aid: option.aid });
                // h.eval(`player = new bilibiliPlayer({ cid: ${option.cid}, aid: ${option.aid} })`);
                // console.log(`player = new bilibiliPlayer({ cid: ${option.cid}, aid: ${option.aid} })`);
            })
        }

        await new Promise(resolve => {
            if (h.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-fullscreen')) resolve();
            else {
                let observer = new MutationObserver(() => {
                    if (h.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-fullscreen')) {
                        observer.disconnect();
                        resolve();
                    }
                });
                observer.observe(h.document.getElementById('bilibiliPlayer'), { childList: true });
            }
        });
        let i = [div.webkitRequestFullscreen, div.mozRequestFullScreen, div.msRequestFullscreen, div.requestFullscreen];
        div.webkitRequestFullscreen = div.mozRequestFullScreen = div.msRequestFullscreen = div.requestFullscreen = () => { };
        if (h.document.querySelector('#bilibiliPlayer div.video-state-fullscreen-off'))
            h.document.querySelector('#bilibiliPlayer div.bilibili-player-video-btn-fullscreen').click();
        [div.webkitRequestFullscreen, div.mozRequestFullScreen, div.msRequestFullscreen, div.requestFullscreen] = i;
    }

    static parseHref(href = top.location.href) {
        if (href.includes('bangumi')) {
            let anime, play;
            anime = (anime = /anime\/\d+/.exec(href)) ? anime[0].slice(6) : null;
            play = (play = /play#\d+/.exec(href)) ? play[0].slice(5) : null;
            if (!anime || !play) return null;
            return `bangumi.bilibili.com/anime/${anime}/play#${play}`;
        }
        else {
            let aid, pid;
            aid = (aid = /av\d+/.exec(href)) ? aid[0].slice(2) : null;
            if (!aid) return null;
            pid = (pid = /page=\d+/.exec(href)) ? pid[0].slice(5) : (pid = /index_\d+.html/.exec(href)) ? pid[0].slice(6, -5) : null;
            if (!pid) return `www.bilibili.com/video/av${aid}`;
            return `www.bilibili.com/video/av${aid}/index_${pid}.html`;
        }
    }

    static secondToReadable(s) {
        if (s > 60) return `${parseInt(s / 60)}分${parseInt(s % 60)}秒`;
        else return `${parseInt(s % 60)}秒`;
    }

    static clearAllUserdata(playerWin = top) {
        if (playerWin.GM_setValue) return GM_setValue('biliPolyfill', '');
        playerWin.localStorage.removeItem('biliPolyfill');
    }

    static _UNIT_TEST() {
        console.warn('This test is impossible.');
        console.warn('You need to close the tab, reopen it, etc.');
        console.warn('Maybe you also want to test between bideo parts, etc.');
        console.warn('I am too lazy to find workarounds.');
    }
}

export default BiliPolyfill;
