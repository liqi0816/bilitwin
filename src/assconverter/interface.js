/***
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

import parser from './extension/danmaku/parser.js';
import genLayout from './extension/danmaku/layout.js';
import assembleASS from './extension/danmaku/ass.js';
import { normalize } from './extension/options/ext_options.js';
import { convertToBlob } from './extension/download/download.js';

/**
 * An API wrapper of tiansh/ass-danmaku for liqi0816/bilitwin
 */
class ASSConverter {
    /**
     * @typedef {ExtOption}
     * @property {number} resolutionX canvas width for drawing danmaku (px)
     * @property {number} resolutionY canvas height for drawing danmaku (px)
     * @property {number} bottomReserved reserved height at bottom for drawing danmaku (px)
     * @property {string} fontFamily danmaku font family
     * @property {number} fontSize danmaku font size (ratio)
     * @property {number} textSpace space between danmaku (px)
     * @property {number} rtlDuration duration of right to left moving danmaku appeared on screen (s)
     * @property {number} fixDuration duration of keep bottom / top danmaku appeared on screen (s)
     * @property {number} maxDelay // maxinum amount of allowed delay (s)
     * @property {number} textOpacity // opacity of text, in range of [0, 1]
     * @property {number} maxOverlap // maxinum layers of danmaku
     */

    /**
     * @param {ExtOption} option tiansh/ass-danmaku compatible option
     */
    constructor(option = {}) {
        this.option = option;
    }

    get option() {
        return this.normalizedOption;
    }

    set option(e) {
        return this.normalizedOption = normalize(e);
    }

    /**
     * @param {Danmaku[]} danmaku use ASSConverter.parseXML
     * @param {string} title 
     * @param {string} originalURL 
     */
    async genASS(danmaku, title = 'danmaku', originalURL = 'anonymous xml') {
        const layout = await genLayout(danmaku, this.option);
        const ass = assembleASS({
            content: danmaku,
            layout,
            meta: {
                name: title,
                url: originalURL
            }
        }, this.option);
        return ass;
    }

    async genASSBlob(danmaku, title = 'danmaku', originalURL = 'anonymous xml') {
        return convertToBlob(await this.genASS(danmaku, title, originalURL));
    }

    /**
     * @typedef DanmakuColor
     * @property {number} r
     * @property {number} g
     * @property {number} b
     */

    /**
     * @typedef Danmaku
     * @property {string} text
     * @property {number} time
     * @property {string} mode
     * @property {number} size
     * @property {DanmakuColor} color
     * @property {boolean} bottom
     * @property {string=} sender
     */

    /**
     * @param {string} xml bilibili danmaku xml
     * @returns {Danmaku[]}
     */
    static parseXML(xml) {
        return parser.bilibili(xml).danmaku;
    }


    static _UNIT_TEST() {
        const e = new ASSConverter();
        const xml = `<?xml version="1.0" encoding="UTF-8"?><i><chatserver>chat.bilibili.com</chatserver><chatid>32873758</chatid><mission>0</mission><maxlimit>6000</maxlimit><state>0</state><realname>0</realname><source>k-v</source><d p="0.00000,1,25,16777215,1519733589,0,d286a97b,4349604072">真第一</d><d p="7.29900,1,25,16777215,1519733812,0,3548796c,4349615908">五分钟前</d><d p="587.05100,1,25,16777215,1519734291,0,f2ed792f,4349641325">惊呆了！</d><d p="136.82200,1,25,16777215,1519734458,0,1e5784f,4349652071">神王代表虚空</d><d p="0.00000,1,25,16777215,1519736251,0,f16cbf44,4349751461">66666666666666666</d><d p="590.60400,1,25,16777215,1519736265,0,fbb3d1b3,4349752331">这要吹多长时间</d><d p="537.15500,1,25,16777215,1519736280,0,1e5784f,4349753170">反而不是，疾病是个恶魔，别人说她伪装成了精灵</d><d p="872.08200,1,25,16777215,1519736881,0,1e5784f,4349787709">精灵都会吃</d><d p="2648.42500,1,25,16777215,1519737840,0,e9e6b2b4,4349844463">就不能大部分都是铜币么？</d><d p="2115.09400,1,25,16777215,1519738271,0,3548796c,4349870808">吓死我了。。。</d><d p="11.45400,1,25,16777215,1519739974,0,9937b428,4349974512">???</d><d p="1285.73900,1,25,16777215,1519748274,0,3bb4c9ee,4350512859">儿砸</d><d p="595.48600,1,25,16777215,1519757148,0,f3ed26b6,4350787048">怕是要吹到缺氧哦</d><d p="1206.31500,1,25,16777215,1519767204,0,62a9186a,4350882680">233333333333333</d><d p="638.68700,1,25,16777215,1519769219,0,de0a99ae,4350893310">菜鸡的借口</d><d p="655.76500,1,25,16777215,1519769236,0,de0a99ae,4350893397">竟然吹蜡烛打医生</d><d p="2235.89600,1,25,16777215,1519769418,0,de0a99ae,4350894325">这暴击率太高了</d><d p="389.88700,1,25,16777215,1519780435,0,8879732c,4351021740">医生好想进10万，血，上万甲</d><d p="2322.47900,1,25,16777215,1519780901,0,e509a801,4351032321">前一个命都没了</d><d p="2408.93600,1,25,16777215,1519801350,0,1a692eb6,4351826484">23333333333333</d><d p="1290.62000,1,25,16777215,1519809649,0,af8f12dc,4352159267">儿砸~</d><d p="917.96300,1,25,16777215,1519816770,0,fef64b6a,4352474878">应该姆西自己控制洛斯   七杀点太快了差评</d><d p="2328.03100,1,25,16777215,1519825291,0,8549205d,4352919003">现在前一个连命都没了啊喂</d><d p="1246.16700,1,25,16777215,1519827514,0,fef64b6a,4353052309">不如走到面前用扫射   基本全中  伤害爆表</d><d p="592.38100,1,25,16777215,1519912489,0,edc3f0a9,4355960085">这是这个游戏最震撼的几幕之一</d></i>`;
        console.log(window.ass = e.genASSBlob(ASSConverter.parseXML(xml)));
    }
}

export default ASSConverter;
