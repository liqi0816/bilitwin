/***
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

import BiliUserJS from '../biliuserjs/biliuserjs';

class UI extends BiliUserJS {
    // Title Append
    static titleAppend(monkey) {
        const tminfo = document.querySelector('div.tminfo') || document.querySelector('div.info-second');
        let div = document.createElement('div');
        let flvA = document.createElement('a');
        let mp4A = document.createElement('a');
        let assA = document.createElement('a');
        flvA.textContent = '超清FLV';
        mp4A.textContent = '原生MP4';
        assA.textContent = '弹幕ASS';

        flvA.onmouseover = async () => {
            flvA.textContent = '正在FLV';
            flvA.onmouseover = null;
            let href = await monkey.queryInfo('flv');
            if (href == 'does_not_exist') return flvA.textContent = '没有FLV';
            flvA.textContent = '超清FLV';
            let flvDiv = UI.genFLVDiv(monkey);
            document.body.appendChild(flvDiv);
            flvA.onclick = () => flvDiv.style.display = 'block';
        };
        mp4A.onmouseover = async () => {
            mp4A.textContent = '正在MP4';
            mp4A.onmouseover = null;
            let href = await monkey.queryInfo('mp4');
            if (href == 'does_not_exist') return mp4A.textContent = '没有MP4';
            mp4A.href = href;
            mp4A.textContent = '原生MP4';
            mp4A.download = '';
            mp4A.referrerPolicy = 'origin';
        };
        assA.onmouseover = async () => {
            assA.textContent = '正在ASS';
            assA.onmouseover = null;
            assA.href = await monkey.queryInfo('ass');
            assA.textContent = '弹幕ASS';
            if (monkey.mp4 && monkey.mp4.match) assA.download = monkey.mp4.match(/\d(?:\d|-|hd)*(?=\.mp4)/)[0] + '.ass';
            else assA.download = monkey.cid + '.ass';
        };
        div.addEventListener('click', e => e.stopPropagation());

        flvA.style.fontSize = mp4A.style.fontSize = assA.style.fontSize = '15px';
        div.appendChild(flvA);
        div.appendChild(document.createTextNode(' '));
        div.appendChild(mp4A);
        div.appendChild(document.createTextNode(' '));
        div.appendChild(assA);
        div.className = 'bilitwin';
        div.style.float = 'left';
        div.style.clear = 'left';
        tminfo.style.float = 'none';
        tminfo.style.marginLeft = '185px';
        tminfo.parentElement.insertBefore(div, tminfo);
        return { flvA, mp4A, assA };
    }

    static genFLVDiv(monkey, flvs = monkey.flvs, cache = monkey.cache) {
        let div = UI.genDiv();

        let table = document.createElement('table');
        table.style.width = '100%';
        table.style.lineHeight = '2em';
        for (let i = 0; i < flvs.length; i++) {
            let tr = table.insertRow(-1);
            tr.insertCell(0).innerHTML = `<a href="${flvs[i]}">FLV分段 ${i + 1}</a>`;
            tr.insertCell(1).innerHTML = '<a>缓存本段</a>';
            tr.insertCell(2).innerHTML = '<progress value="0" max="100">进度条</progress>';
            tr.children[1].children[0].onclick = () => {
                UI.downloadFLV(tr.children[1].children[0], monkey, i, tr.children[2].children[0]);
            }
        }
        let tr = table.insertRow(-1);
        tr.insertCell(0).innerHTML = '<a>全部复制到剪贴板</a>';
        tr.insertCell(1).innerHTML = '<a>缓存全部+自动合并</a>';
        tr.insertCell(2).innerHTML = `<progress value="0" max="${flvs.length + 1}">进度条</progress>`;
        if (top.location.href.includes('bangumi')) {
            tr.children[0].children[0].onclick = () => UI.copyToClipboard(flvs.join('\n'));
        }
        else {
            tr.children[0].innerHTML = '<a download="biliTwin.ef2">IDM导出</a>';
            tr.children[0].children[0].href = URL.createObjectURL(new Blob([UI.exportIDM(flvs, top.location.origin)]));
        }
        tr.children[1].children[0].onclick = () => UI.downloadAllFLVs(tr.children[1].children[0], monkey, table);
        table.insertRow(-1).innerHTML = '<td colspan="3">合并功能推荐配置：至少8G RAM。把自己下载的分段FLV拖动到这里，也可以合并哦~</td>';
        table.insertRow(-1).innerHTML = cache ? '<td colspan="3">下载的缓存分段会暂时停留在电脑里，过一段时间会自动消失。建议只开一个标签页。</td>' : '<td colspan="3">建议只开一个标签页。关掉标签页后，缓存就会被清理。别忘了另存为！</td>';
        UI.displayQuota(table.insertRow(-1));
        div.appendChild(table);

        div.ondragenter = div.ondragover = e => UI.allowDrag(e);
        div.ondrop = async e => {
            UI.allowDrag(e);
            let files = Array.from(e.dataTransfer.files);
            if (files.every(e => e.name.search(/\d+-\d+(?:\d|-|hd)*\.flv/) != -1)) {
                files.sort((a, b) => a.name.match(/\d+-(\d+)(?:\d|-|hd)*\.flv/)[1] - b.name.match(/\d+-(\d+)(?:\d|-|hd)*\.flv/)[1]);
            }
            for (let file of files) {
                table.insertRow(-1).innerHTML = `<td colspan="3">${file.name}</td>`;
            }
            let outputName = files[0].name.match(/\d+-\d+(?:\d|-|hd)*\.flv/);
            if (outputName) outputName = outputName[0].replace(/-\d/, "");
            else outputName = 'merge_' + files[0].name;
            let url = await UI.mergeFLVFiles(files);
            table.insertRow(-1).innerHTML = `<td colspan="3"><a href="${url}" download="${outputName}">${outputName}</a></td>`;
        }

        let buttons = [];
        for (let i = 0; i < 3; i++) buttons.push(document.createElement('button'));
        buttons.forEach(btn => btn.style.padding = '0.5em');
        buttons.forEach(btn => btn.style.margin = '0.2em');
        buttons[0].textContent = '关闭';
        buttons[0].onclick = () => {
            div.style.display = 'none';
        }
        buttons[1].textContent = '清空这个视频的缓存';
        buttons[1].onclick = () => {
            monkey.cleanAllFLVsInCache();
        }
        buttons[2].textContent = '清空所有视频的缓存';
        buttons[2].onclick = () => {
            UI.clearCacheDB(cache);
        }
        buttons.forEach(btn => div.appendChild(btn));

        return div;
    }

    static async downloadAllFLVs(a, monkey, table) {
        if (table.rows[0].cells.length < 3) return;
        monkey.hangPlayer();
        table.insertRow(-1).innerHTML = '<td colspan="3">已屏蔽网页播放器的网络链接。切换清晰度可重新激活播放器。</td>';

        for (let i = 0; i < monkey.flvs.length; i++) {
            if (table.rows[i].cells[1].children[0].textContent == '缓存本段')
                table.rows[i].cells[1].children[0].click();
        }

        let bar = a.parentNode.nextSibling.children[0];
        bar.max = monkey.flvs.length + 1;
        bar.value = 0;
        for (let i = 0; i < monkey.flvs.length; i++) monkey.getFLV(i).then(e => bar.value++);

        let blobs;
        blobs = await monkey.getAllFLVs();
        let mergedFLV = await FLV.mergeBlobs(blobs);
        let ass = await monkey.ass;
        let url = URL.createObjectURL(mergedFLV);
        let outputName = top.document.getElementsByTagName('h1')[0].textContent.trim();

        bar.value++;
        table.insertRow(0).innerHTML = `
        <td colspan="3" style="border: 1px solid black">
            <a href="${url}" download="${outputName}.flv">保存合并后FLV</a> 
            <a href="${ass}" download="${outputName}.ass">弹幕ASS</a> 
            <a>打包MKV(软字幕封装)</a>
            记得清理分段缓存哦~
        </td>
        `;
        table.rows[0].cells[0].children[2].onclick = () => new MKVTransmuxer().exec(url, ass, `${outputName}.mkv`);
        return url;
    }

    static async downloadFLV(a, monkey, index, bar = {}) {
        let handler = e => UI.beforeUnloadHandler(e);
        window.addEventListener('beforeunload', handler);

        a.textContent = '取消';
        a.onclick = () => {
            a.onclick = null;
            window.removeEventListener('beforeunload', handler);
            a.textContent = '已取消';
            monkey.abortFLV(index);
        };

        let url;
        try {
            url = await monkey.getFLV(index, (loaded, total) => {
                bar.value = loaded;
                bar.max = total;
            });
            url = URL.createObjectURL(url);
            if (bar.value == 0) bar.value = bar.max = 1;
        } catch (e) {
            a.onclick = null;
            window.removeEventListener('beforeunload', handler);
            a.textContent = '错误';
            throw e;
        }

        a.onclick = null;
        window.removeEventListener('beforeunload', handler);
        a.textContent = '另存为';
        a.download = monkey.flvs[index].match(/\d+-\d+(?:\d|-|hd)*\.flv/)[0];
        a.href = url;
        return url;
    }

    static async mergeFLVFiles(files) {
        let merged = await FLV.mergeBlobs(files)
        return URL.createObjectURL(merged);
    }

    static async clearCacheDB(cache) {
        if (cache) return cache.deleteEntireDB();
    }

    static async displayQuota(tr) {
        return new Promise(resolve => {
            let temporaryStorage = window.navigator.temporaryStorage
                || window.navigator.webkitTemporaryStorage
                || window.navigator.mozTemporaryStorage
                || window.navigator.msTemporaryStorage;
            if (!temporaryStorage) return resolve(tr.innerHTML = `<td colspan="3">这个浏览器不支持缓存呢~关掉标签页后，缓存马上就会消失哦</td>`);
            temporaryStorage.queryUsageAndQuota((usage, quota) =>
                resolve(tr.innerHTML = `<td colspan="3">缓存已用空间：${Math.round(usage / 1048576)}MB / ${Math.round(quota / 1048576)}MB 也包括了B站本来的缓存</td>`)
            );
        });
    }

    // Menu Append
    static menuAppend(playerWin, { monkey, monkeyTitle, polyfill, displayPolyfillDataDiv, optionDiv }) {
        let monkeyMenu = UI.genMonkeyMenu(playerWin, { monkey, monkeyTitle, optionDiv });
        let polyfillMenu = UI.genPolyfillMenu(playerWin, { polyfill, displayPolyfillDataDiv, optionDiv });
        let div = playerWin.document.getElementsByClassName('bilibili-player-context-menu-container black')[0];
        let ul = playerWin.document.createElement('ul');
        ul.className = 'bilitwin';
        ul.style.borderBottom = '1px solid rgba(255,255,255,.12)';
        div.insertBefore(ul, div.children[0]);
        ul.appendChild(monkeyMenu);
        ul.appendChild(polyfillMenu);
    }

    static genMonkeyMenu(playerWin, { monkey, monkeyTitle, optionDiv }) {
        let li = playerWin.document.createElement('li');
        li.className = 'context-menu-menu bilitwin';
        li.innerHTML = `
            <a class="context-menu-a">
                BiliMonkey
                <span class="bpui-icon bpui-icon-arrow-down" style="transform:rotate(-90deg);margin-top:3px;"></span>
            </a>
            <ul>
                <li class="context-menu-function">
                    <a class="context-menu-a">
                        <span class="video-contextmenu-icon"></span> 下载FLV
                    </a>
                </li>
                <li class="context-menu-function">
                    <a class="context-menu-a">
                        <span class="video-contextmenu-icon"></span> 下载MP4
                    </a>
                </li>
                <li class="context-menu-function">
                    <a class="context-menu-a">
                        <span class="video-contextmenu-icon"></span> 下载ASS
                    </a>
                </li>
                <li class="context-menu-function">
                    <a class="context-menu-a">
                        <span class="video-contextmenu-icon"></span> 设置/帮助/关于
                    </a>
                </li>
                <li class="context-menu-function">
                    <a class="context-menu-a">
                        <span class="video-contextmenu-icon"></span> (测)批量下载
                    </a>
                </li>
                <li class="context-menu-function">
                    <a class="context-menu-a">
                        <span class="video-contextmenu-icon"></span> (测)载入缓存FLV
                    </a>
                </li>
                <li class="context-menu-function">
                    <a class="context-menu-a">
                        <span class="video-contextmenu-icon"></span> (测)强制刷新
                    </a>
                </li>
                <li class="context-menu-function">
                    <a class="context-menu-a">
                        <span class="video-contextmenu-icon"></span> (测)重启脚本
                    </a>
                </li>
                <li class="context-menu-function">
                    <a class="context-menu-a">
                        <span class="video-contextmenu-icon"></span> (测)销毁播放器
                    </a>
                </li>
            </ul>
            `;
        li.onclick = () => playerWin.document.getElementById('bilibiliPlayer').click();
        let ul = li.children[1];
        ul.children[0].onclick = async () => { if (monkeyTitle.flvA.onmouseover) await monkeyTitle.flvA.onmouseover(); monkeyTitle.flvA.click(); };
        ul.children[1].onclick = async () => { if (monkeyTitle.mp4A.onmouseover) await monkeyTitle.mp4A.onmouseover(); monkeyTitle.mp4A.click(); };
        ul.children[2].onclick = async () => { if (monkeyTitle.assA.onmouseover) await monkeyTitle.assA.onmouseover(); monkeyTitle.assA.click(); };
        ul.children[3].onclick = () => { optionDiv.style.display = 'block'; };
        ul.children[4].onclick = async () => { await BiliMonkey.getAllPageDefaultFormats(playerWin) };
        ul.children[5].onclick = async () => {
            monkey.proxy = true;
            monkey.flvs = null;
            UI.hintInfo('请稍候，可能需要10秒时间……', playerWin);
            // Yes, I AM lazy.
            playerWin.document.querySelector('div.bilibili-player-video-btn-quality > div ul li[data-value="80"]').click();
            await new Promise(r => playerWin.document.getElementsByTagName('video')[0].addEventListener('emptied', r));
            return monkey.queryInfo('flv');
        };
        ul.children[6].onclick = () => { top.location.reload(true); };
        ul.children[7].onclick = () => { playerWin.dispatchEvent(new Event('unload')); };
        ul.children[8].onclick = () => { playerWin.player && playerWin.player.destroy() };
        return li;
    }

    static genPolyfillMenu(playerWin, { polyfill, displayPolyfillDataDiv, optionDiv }) {
        let li = playerWin.document.createElement('li');
        li.className = 'context-menu-menu bilitwin';
        li.innerHTML = `
            <a class="context-menu-a">
                BiliPolyfill
                <span class="bpui-icon bpui-icon-arrow-down" style="transform:rotate(-90deg);margin-top:3px;"></span>
            </a>
            <ul>
                <li class="context-menu-function">
                    <a class="context-menu-a">
                        <span class="video-contextmenu-icon"></span> 获取封面
                    </a>
                </li>
                <li class="context-menu-menu">
                    <a class="context-menu-a">
                        <span class="video-contextmenu-icon"></span> 更多播放速度
                        <span class="bpui-icon bpui-icon-arrow-down" style="transform:rotate(-90deg);margin-top:3px;"></span>
                    </a>
                    <ul>
                        <li class="context-menu-function">
                            <a class="context-menu-a">
                                <span class="video-contextmenu-icon"></span> 0.1
                            </a>
                        </li>
                        <li class="context-menu-function">
                            <a class="context-menu-a">
                                <span class="video-contextmenu-icon"></span> 3
                            </a>
                        </li>
                        <li class="context-menu-function">
                            <a class="context-menu-a">
                                <span class="video-contextmenu-icon"></span> 点击确认
                                <input type="text" style="width: 35px; height: 70%">
                            </a>
                        </li>
                    </ul>
                </li>
                <li class="context-menu-menu">
                    <a class="context-menu-a">
                        <span class="video-contextmenu-icon"></span> 片头片尾
                        <span class="bpui-icon bpui-icon-arrow-down" style="transform:rotate(-90deg);margin-top:3px;"></span>
                    </a>
                    <ul>
                        <li class="context-menu-function">
                            <a class="context-menu-a">
                                <span class="video-contextmenu-icon"></span> 片头开始:<span></span>
                            </a>
                        </li>
                        <li class="context-menu-function">
                            <a class="context-menu-a">
                                <span class="video-contextmenu-icon"></span> 片头结束:<span></span>
                            </a>
                        </li>
                        <li class="context-menu-function">
                            <a class="context-menu-a">
                                <span class="video-contextmenu-icon"></span> 片尾开始:<span></span>
                            </a>
                        </li>
                        <li class="context-menu-function">
                            <a class="context-menu-a">
                                <span class="video-contextmenu-icon"></span> 片尾结束:<span></span>
                            </a>
                        </li>
                        <li class="context-menu-function">
                            <a class="context-menu-a">
                                <span class="video-contextmenu-icon"></span> 取消标记
                            </a>
                        </li>
                        <li class="context-menu-function">
                            <a class="context-menu-a">
                                <span class="video-contextmenu-icon"></span> 检视数据/说明
                            </a>
                        </li>
                    </ul>
                </li>
                <li class="context-menu-menu">
                    <a class="context-menu-a">
                        <span class="video-contextmenu-icon"></span> 找上下集
                        <span class="bpui-icon bpui-icon-arrow-down" style="transform:rotate(-90deg);margin-top:3px;"></span>
                    </a>
                    <ul>
                        <li class="context-menu-function">
                            <a class="context-menu-a">
                                <span class="video-contextmenu-icon"></span> <span></span>
                            </a>
                        </li>
                        <li class="context-menu-function">
                            <a class="context-menu-a">
                                <span class="video-contextmenu-icon"></span> <span></span>
                            </a>
                        </li>
                    </ul>
                </li>
                <li class="context-menu-function">
                    <a class="context-menu-a">
                        <span class="video-contextmenu-icon"></span> 小窗播放
                    </a>
                </li>
                <li class="context-menu-function">
                    <a class="context-menu-a">
                        <span class="video-contextmenu-icon"></span> 设置/帮助/关于
                    </a>
                </li>
                <li class="context-menu-function">
                    <a class="context-menu-a">
                        <span class="video-contextmenu-icon"></span> (测)立即保存数据
                    </a>
                </li>
                <li class="context-menu-function">
                    <a class="context-menu-a">
                        <span class="video-contextmenu-icon"></span> (测)强制清空数据
                    </a>
                </li>
            </ul>
            `;
        li.onclick = () => playerWin.document.getElementById('bilibiliPlayer').click();
        if (!polyfill.option.betabeta) li.children[0].childNodes[0].textContent += '(到设置开启)';
        let ul = li.children[1];
        ul.children[0].onclick = () => { top.window.open(polyfill.getCoverImage(), '_blank'); };

        ul.children[1].children[1].children[0].onclick = () => { polyfill.setVideoSpeed(0.1); };
        ul.children[1].children[1].children[1].onclick = () => { polyfill.setVideoSpeed(3); };
        ul.children[1].children[1].children[2].onclick = e => { polyfill.setVideoSpeed(e.target.getElementsByTagName('input')[0].value); };
        ul.children[1].children[1].children[2].getElementsByTagName('input')[0].onclick = e => e.stopPropagation();

        ul.children[2].children[1].children[0].onclick = () => { polyfill.markOPEDPosition(0); };
        ul.children[2].children[1].children[1].onclick = () => { polyfill.markOPEDPosition(1); };
        ul.children[2].children[1].children[2].onclick = () => { polyfill.markOPEDPosition(2); };
        ul.children[2].children[1].children[3].onclick = () => { polyfill.markOPEDPosition(3); };
        ul.children[2].children[1].children[4].onclick = () => { polyfill.clearOPEDPosition(); };
        ul.children[2].children[1].children[5].onclick = () => { displayPolyfillDataDiv(polyfill); };

        ul.children[3].children[1].children[0].getElementsByTagName('a')[0].style.width = 'initial';
        ul.children[3].children[1].children[1].getElementsByTagName('a')[0].style.width = 'initial';

        ul.children[4].onclick = () => { BiliPolyfill.openMinimizedPlayer(); };
        ul.children[5].onclick = () => { optionDiv.style.display = 'block'; };
        ul.children[6].onclick = () => { polyfill.saveUserdata() };
        ul.children[7].onclick = () => {
            BiliPolyfill.clearAllUserdata(playerWin);
            polyfill.retrieveUserdata();
        };

        li.onmouseenter = () => {
            let ul = li.children[1];
            ul.children[1].children[1].children[2].getElementsByTagName('input')[0].value = polyfill.video.playbackRate;

            let oped = polyfill.userdata.oped[polyfill.getCollectionId()] || [];
            ul.children[2].children[1].children[0].getElementsByTagName('span')[1].textContent = oped[0] ? BiliPolyfill.secondToReadable(oped[0]) : '无';
            ul.children[2].children[1].children[1].getElementsByTagName('span')[1].textContent = oped[1] ? BiliPolyfill.secondToReadable(oped[1]) : '无';
            ul.children[2].children[1].children[2].getElementsByTagName('span')[1].textContent = oped[2] ? BiliPolyfill.secondToReadable(oped[2]) : '无';
            ul.children[2].children[1].children[3].getElementsByTagName('span')[1].textContent = oped[3] ? BiliPolyfill.secondToReadable(oped[3]) : '无';

            ul.children[3].children[1].children[0].onclick = () => { if (polyfill.series[0]) top.window.open(`https://www.bilibili.com/video/av${polyfill.series[0].aid}`, '_blank'); };
            ul.children[3].children[1].children[1].onclick = () => { if (polyfill.series[1]) top.window.open(`https://www.bilibili.com/video/av${polyfill.series[1].aid}`, '_blank'); };
            ul.children[3].children[1].children[0].getElementsByTagName('span')[1].textContent = polyfill.series[0] ? polyfill.series[0].title : '找不到';
            ul.children[3].children[1].children[1].getElementsByTagName('span')[1].textContent = polyfill.series[1] ? polyfill.series[1].title : '找不到';
        }
        return li;
    }

    static genOptionDiv(option) {
        let div = UI.genDiv();

        div.appendChild(UI.genMonkeyOptionTable(option));
        div.appendChild(UI.genPolyfillOptionTable(option));
        let table = document.createElement('table');
        table.style = 'width: 100%; line-height: 2em;';
        table.insertRow(-1).innerHTML = '<td>设置自动保存，刷新后生效。</td>';
        table.insertRow(-1).innerHTML = '<td>视频下载组件的缓存功能只在Windows+Chrome测试过，如果出现问题，请关闭缓存。</td>';
        table.insertRow(-1).innerHTML = '<td>功能增强组件尽量保证了兼容性。但如果有同功能脚本/插件，请关闭本插件的对应功能。</td>';
        table.insertRow(-1).innerHTML = '<td>这个脚本乃“按原样”提供，不附带任何明示，暗示或法定的保证，包括但不限于其没有缺陷，适合特定目的或非侵权。</td>';
        table.insertRow(-1).innerHTML = '<td><a href="https://greasyfork.org/zh-CN/scripts/27819" target="_blank">更新/讨论</a> <a href="https://github.com/liqi0816/bilitwin/" target="_blank">GitHub</a> Author: qli5. Copyright: qli5, 2014+, 田生, grepmusic</td>';
        div.appendChild(table);

        let buttons = [];
        for (let i = 0; i < 3; i++) buttons.push(document.createElement('button'));
        buttons.forEach(btn => btn.style.padding = '0.5em');
        buttons.forEach(btn => btn.style.margin = '0.2em');
        buttons[0].textContent = '保存并关闭';
        buttons[0].onclick = () => {
            div.style.display = 'none';;
        }
        buttons[1].textContent = '保存并刷新';
        buttons[1].onclick = () => {
            top.location.reload();
        }
        buttons[2].textContent = '重置并刷新';
        buttons[2].onclick = () => {
            UI.saveOption({ setStorage: option.setStorage });
            top.location.reload();
        }
        buttons.forEach(btn => div.appendChild(btn));

        return div;
    }

    static genMonkeyOptionTable(option = {}) {
        const description = [
            ['autoDefault', '尝试自动抓取：不会拖慢页面，抓取默认清晰度，但可能抓不到。'],
            ['autoFLV', '强制自动抓取FLV：会拖慢页面，如果默认清晰度也是超清会更慢，但保证抓到。'],
            ['autoMP4', '强制自动抓取MP4：会拖慢页面，如果默认清晰度也是高清会更慢，但保证抓到。'],
            ['cache', '关标签页不清缓存：保留完全下载好的分段到缓存，忘记另存为也没关系。'],
            ['partial', '断点续传：点击“取消”保留部分下载的分段到缓存，忘记点击会弹窗确认。'],
            ['proxy', '用缓存加速播放器：如果缓存里有完全下载好的分段，直接喂给网页播放器，不重新访问网络。小水管利器，播放只需500k流量。如果实在搞不清怎么播放ASS弹幕，也可以就这样用。'],
            ['blocker', '弹幕过滤：在网页播放器里设置的屏蔽词也对下载的弹幕生效。'],
            ['font', '自定义字体：在网页播放器里设置的字体、大小、加粗、透明度也对下载的弹幕生效。']
        ];

        let table = document.createElement('table');
        table.style.width = '100%';
        table.style.lineHeight = '2em';

        table.insertRow(-1).innerHTML = '<td style="text-align:center">BiliMonkey（视频抓取组件）</td>';
        table.insertRow(-1).innerHTML = '<td style="text-align:center">因为作者偷懒了，缓存的三个选项最好要么全开，要么全关。最好。</td>';
        for (let d of description) {
            let checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = option[d[0]];
            checkbox.onchange = () => { option[d[0]] = checkbox.checked; UI.saveOption(option); };
            let td = table.insertRow(-1).insertCell(0);
            let label = document.createElement('label');
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(d[1]));
            td.appendChild(label);
        }

        return table;
    }

    static genPolyfillOptionTable(option = {}) {
        const description = [
            ['betabeta', '增强组件总开关 <---------更加懒得测试了，反正以后B站也会自己提供这些功能。也许吧。'], //betabeta
            ['badgeWatchLater', '稍后再看添加数字角标'],
            ['dblclick', '双击全屏'],
            ['scroll', '自动滚动到播放器'],
            ['recommend', '弹幕列表换成相关视频'],
            ['electric', '整合充电榜与换P倒计时'],
            ['electricSkippable', '跳过充电榜', 'disabled'],
            ['lift', '自动防挡字幕'],
            ['autoResume', '自动跳转上次看到'],
            ['autoPlay', '自动播放'],
            ['autoWideScreen', '自动宽屏'],
            ['autoFullScreen', '自动全屏'],
            ['oped', '标记后自动跳OP/ED'],
            ['focus', '自动聚焦到播放器'],
            ['menuFocus', '关闭菜单后聚焦到播放器'],
            ['limitedKeydown', '首次回车键可全屏自动播放'],
            ['series', '尝试自动找上下集'],
            ['speech', '(测)(需墙外)任意三击鼠标左键开启语音识别'],
        ];

        let table = document.createElement('table');
        table.style.width = '100%';
        table.style.lineHeight = '2em';

        table.insertRow(-1).innerHTML = '<td style="text-align:center">BiliPolyfill（功能增强组件）</td>';
        table.insertRow(-1).innerHTML = '<td style="text-align:center">懒鬼作者还在测试的时候，B站已经上线了原生的稍后再看(๑•̀ㅂ•́)و✧</td>';
        for (let d of description) {
            let checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = option[d[0]];
            checkbox.onchange = () => { option[d[0]] = checkbox.checked; UI.saveOption(option); };
            let td = table.insertRow(-1).insertCell(0);
            let label = document.createElement('label');
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(d[1]));
            if (d[2] == 'disabled') {
                checkbox.disabled = true;
                label.style.textDecoration = 'line-through';
            }
            td.appendChild(label);
        }

        return table;
    }

    static displayPolyfillDataDiv(polyfill) {
        let div = UI.genDiv();
        let p = document.createElement('p');
        p.textContent = '这里是脚本储存的数据。所有数据都只存在浏览器里，别人不知道，B站也不知道，脚本作者更不知道(这个家伙连服务器都租不起 摔';
        p.style.margin = '0.3em';
        div.appendChild(p);

        let textareas = [];
        for (let i = 0; i < 2; i++) textareas.push(document.createElement('textarea'));
        textareas.forEach(ta => ta.style = 'resize:vertical; width: 100%; height: 200px');

        p = document.createElement('p');
        p.textContent = 'B站已上线原生的稍后观看功能。';
        p.style.margin = '0.3em';
        div.appendChild(p);
        //textareas[0].textContent = JSON.stringify(polyfill.userdata.watchLater).replace(/\[/, '[\n').replace(/\]/, '\n]').replace(/,/g, ',\n');
        //div.appendChild(textareas[0]);

        p = document.createElement('p');
        p.textContent = '这里是片头片尾。格式是，av号或番剧号:[片头开始(默认=0),片头结束(默认=不跳),片尾开始(默认=不跳),片尾结束(默认=无穷大)]。可以任意填写null，脚本会自动采用默认值。';
        p.style.margin = '0.3em';
        div.appendChild(p);
        textareas[1].textContent = JSON.stringify(polyfill.userdata.oped).replace(/{/, '{\n').replace(/}/, '\n}').replace(/],/g, '],\n');
        div.appendChild(textareas[1]);

        p = document.createElement('p');
        p.textContent = '当然可以直接清空啦。只删除其中的一些行的话，一定要记得删掉多余的逗号。';
        p.style.margin = '0.3em';
        div.appendChild(p);

        let buttons = [];
        for (let i = 0; i < 3; i++) buttons.push(document.createElement('button'));
        buttons.forEach(btn => btn.style.padding = '0.5em');
        buttons.forEach(btn => btn.style.margin = '0.2em');
        buttons[0].textContent = '关闭';
        buttons[0].onclick = () => {
            div.remove();
        }
        buttons[1].textContent = '验证格式';
        buttons[1].onclick = () => {
            if (!textareas[0].value) textareas[0].value = '{\n\n}';
            textareas[0].value = textareas[0].value.replace(/,(\s|\n)*}/, '\n}').replace(/,(\s|\n),/g, ',\n');
            if (!textareas[1].value) textareas[1].value = '{\n\n}';
            textareas[1].value = textareas[1].value.replace(/,(\s|\n)*}/, '\n}').replace(/,(\s|\n),/g, ',\n').replace(/,(\s|\n)*]/g, ']');
            let userdata = {};
            try {
                //userdata.watchLater = JSON.parse(textareas[0].value);
            } catch (e) { alert('稍后观看列表: ' + e); throw e; }
            try {
                userdata.oped = JSON.parse(textareas[1].value);
            } catch (e) { alert('片头片尾: ' + e); throw e; }
            buttons[1].textContent = ('格式没有问题！');
            return userdata;
        }
        buttons[2].textContent = '尝试保存';
        buttons[2].onclick = () => {
            polyfill.userdata = buttons[1].onclick();
            polyfill.saveUserdata();
            buttons[2].textContent = ('保存成功');
        }
        buttons.forEach(btn => div.appendChild(btn));

        document.body.appendChild(div);
        div.style.display = 'block';
    }

    // Common
    static genDiv() {
        let div = document.createElement('div');
        div.style.position = 'fixed';
        div.style.zIndex = '10036';
        div.style.top = '50%';
        div.style.marginTop = '-200px';
        div.style.left = '50%';
        div.style.marginLeft = '-320px';
        div.style.width = '540px';
        div.style.maxHeight = '400px';
        div.style.overflowY = 'auto';
        div.style.padding = '30px 50px';
        div.style.backgroundColor = 'white';
        div.style.borderRadius = '6px';
        div.style.boxShadow = 'rgba(0, 0, 0, 0.6) 1px 1px 40px 0px';
        div.style.display = 'none';
        div.className = 'bilitwin';
        div.addEventListener('click', e => e.stopPropagation());
        return div;
    }

    static requestH5Player() {
        let h = document.querySelector('div.tminfo');
        h.insertBefore(document.createTextNode('[[脚本需要HTML5播放器(弹幕列表右上角三个点的按钮切换)]] '), h.firstChild);
    }

    static copyToClipboard(text) {
        const textarea = document.createElement('textarea');
        document.body.appendChild(textarea);
        textarea.value = text;
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }

    static exportIDM(urls, referrer) {
        return urls.map(e => `<\r\n${e}\r\nreferer: ${referrer}\r\n>\r\n`).join('');
    }

    static allowDrag(e) {
        e.stopPropagation();
        e.preventDefault();
    }

    static beforeUnloadHandler(e) {
        return e.returnValue = '脚本还没做完工作，真的要退出吗？';
    }

    static hintInfo(text, playerWin) {
        let infoDiv = playerWin.document.createElement('div');
        infoDiv.className = 'bilibili-player-video-toast-bottom';
        infoDiv.innerHTML = `
        <div class="bilibili-player-video-toast-item">
            <div class="bilibili-player-video-toast-item-text">
                <span>${text}</span>
            </div>
        </div>
        `;
        playerWin.document.getElementsByClassName('bilibili-player-video-toast-wrp')[0].appendChild(infoDiv);
        setTimeout(() => infoDiv.remove(), 3000);
    }

    static getOption(playerWin) {
        let rawOption = null;
        try {
            rawOption = JSON.parse(playerWin.localStorage.getItem('BiliTwin'));
        }
        catch (e) { }
        finally {
            if (!rawOption) rawOption = {};
            rawOption.setStorage = (n, i) => playerWin.localStorage.setItem(n, i);
            rawOption.getStorage = n => playerWin.localStorage.getItem(n);
            const defaultOption = {
                autoDefault: true,
                autoFLV: false,
                autoMP4: false,
                cache: true,
                partial: true,
                proxy: true,
                blocker: true,
                font: true,
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
                betabeta: false
            };
            return Object.assign({}, defaultOption, rawOption, debugOption);
        }
    }

    static saveOption(option) {
        return option.setStorage('BiliTwin', JSON.stringify(option));
    }

    static outdatedEngineClearance() {
        if (!Promise || !MutationObserver) {
            alert('这个浏览器实在太老了，脚本决定罢工。');
            throw 'BiliTwin: browser outdated: Promise or MutationObserver unsupported';
        }
    }

    static firefoxClearance() {
        if (navigator.userAgent.includes('Firefox')) {
            debugOption.proxy = false;
            if (!window.navigator.temporaryStorage && !window.navigator.mozTemporaryStorage) window.navigator.temporaryStorage = { queryUsageAndQuota: func => func(-1048576, 10484711424) };
        }
    }

    static xpcWrapperClearance() {
        if (top.unsafeWindow) {
            Object.defineProperty(window, 'cid', {
                configurable: true,
                get: () => String(unsafeWindow.cid)
            });
            Object.defineProperty(window, 'player', {
                configurable: true,
                get: () => ({ destroy: unsafeWindow.player.destroy, reloadAccess: unsafeWindow.player.reloadAccess })
            });
            Object.defineProperty(window, 'jQuery', {
                configurable: true,
                get: () => unsafeWindow.jQuery,
            });
            Object.defineProperty(window, 'fetch', {
                configurable: true,
                get: () => unsafeWindow.fetch.bind(unsafeWindow),
                set: _fetch => unsafeWindow.fetch = _fetch.bind(unsafeWindow)
            });
        }
    }

    static styleClearance() {
        let ret = `
        .bilibili-player-context-menu-container.black ul.bilitwin li.context-menu-function > a:hover {
            background: rgba(255,255,255,.12);
            transition: all .3s ease-in-out;
            cursor: pointer;
        }
        `;
        if (top.getComputedStyle(top.document.body).color != 'rgb(34, 34, 34)') ret += `
        .bilitwin a {
            cursor: pointer;
            color: #00a1d6;
        }

        .bilitwin a:hover {
            color: #f25d8e;
        }

        .bilitwin button {
            color: #fff;
            cursor: pointer;
            text-align: center;
            border-radius: 4px;
            background-color: #00a1d6;
            vertical-align: middle;
            border: 1px solid #00a1d6;
            transition: .1s;
            transition-property: background-color,border,color;
            user-select: none;
        }

        .bilitwin button:hover {
            background-color: #00b5e5;
            border-color: #00b5e5;
        }

        .bilitwin progress {
            -webkit-appearance: progress;
        }
        `;
        let style = document.createElement('style');
        style.type = 'text/css';
        style.rel = 'stylesheet';
        style.textContent = ret;
        document.head.appendChild(style);
    }

    static cleanUp() {
        Array.from(document.getElementsByClassName('bilitwin'))
            .filter(e => e.textContent.includes('FLV分段'))
            .forEach(e => Array.from(e.getElementsByTagName('a')).forEach(
                e => e.textContent == '取消' && e.click()
            ));
        Array.from(document.getElementsByClassName('bilitwin')).forEach(e => e.remove());
    }

    static async start() {
        let cidRefresh = new AsyncContainer();
        let href = location.href;

        // 1. playerWin and option
        let playerWin;
        try {
            playerWin = await UI.getPlayerWin();
        } catch (e) {
            if (e == 'Need H5 Player') UI.requestH5Player();
            throw e;
        }
        let option = UI.getOption(playerWin);
        let optionDiv = UI.genOptionDiv(option);
        document.body.appendChild(optionDiv);

        // 2. monkey and polyfill
        let monkeyTitle;
        let displayPolyfillDataDiv = polyfill => UI.displayPolyfillDataDiv(polyfill);
        let [monkey, polyfill] = await Promise.all([
            (async () => {
                let monkey = new BiliMonkey(playerWin, option);
                await monkey.execOptions();
                monkeyTitle = UI.titleAppend(monkey);
                return monkey;
            })(),
            (async () => {
                let polyfill = new BiliPolyfill(playerWin, option, t => UI.hintInfo(t, playerWin));
                await polyfill.setFunctions();
                return polyfill;
            })()
        ]);
        if (href != location.href) return UI.cleanUp();

        // 3. menu
        UI.menuAppend(playerWin, { monkey, monkeyTitle, polyfill, displayPolyfillDataDiv, optionDiv });

        // 4. refresh
        let h = () => {
            let video = playerWin.document.getElementsByTagName('video')[0];
            if (video) video.addEventListener('emptied', h);
            else setTimeout(() => cidRefresh.resolve(), 0);
        }
        playerWin.document.getElementsByTagName('video')[0].addEventListener('emptied', h);
        playerWin.addEventListener('unload', () => setTimeout(() => cidRefresh.resolve(), 0));

        // 5. debug
        if (debugOption.debug && top.console) top.console.clear();
        if (debugOption.debug) ([(top.unsafeWindow || top).m, (top.unsafeWindow || top).p] = [monkey, polyfill]);

        await cidRefresh;
        monkey.destroy();
        polyfill.destroy();
        UI.cleanUp();
    }

    /***
     * userscripts may change states within the following scopes:
     * 1. page scope
     * 2. aid scope
     * 3. cid scope
     * 4. video dom scope
     * 
     * BiliMonkey => cid scope
     *            => page scope (fetch hook)
     * 
     * BiliPolyfill => video dom scope
     *              => cid scope
     *              => aid scope
     *              => page scope
     */
    static async init() {
        if (!document.body) return;
        UI.outdatedEngineClearance();
        UI.firefoxClearance();
        UI.styleClearance();

        while (1) {
            await UI.start();
        }
    }

    static get optionDescriptions() {
        return [
            // 1. automation
            ['autoDanmaku', '下载视频也触发下载弹幕'],

            // 2. user interface
            ['title', '在视频标题旁添加链接'],
            ['menu', '在视频菜单栏添加增强'],

            // 3. download
            ['aria2', '导出aria2'],
            ['aria2RPC', '发送到aria2 RPC'],
            ['m3u8', '(限VLC兼容播放器)导出m3u8'],
            ['clipboard', '(测)(请自行解决referrer)强制导出剪贴板'],
        ];
    }

    static get optionDefaults() {
        return {
            // 1. automation
            autoDanmaku: false,

            // 2. user interface
            title: true,
            menu: true,

            // 3. download
            aria2: false,
            m3u8: false,
            clipboard: false,
        }
    }
}

export default UI;
