// @ts-check

import { buildAss } from "./ass.js"

/**
 * 获取视频信息
 * @param {number} aid 
 * @param {number} cid 
 */
export const getVideoInfo = async (aid, cid) => {
    const url = `https://api.bilibili.com/x/web-interface/view?aid=${aid}&cid=${cid}`

    const res = await fetch(url)
    if (!res.ok) {
        throw new Error(`${res.status} ${res.statusText}`)
    }

    const json = await res.json()
    return json.data
}

/**
 * @typedef {Object} SubtitleInfo 字幕信息
 * @property {number} id
 * @property {string} lan 字幕语言，例如 "en-US"
 * @property {string} lan_doc 字幕语言描述，例如 "英语（美国）"
 * @property {boolean} is_lock 是否字幕可以在视频上拖动
 * @property {string} subtitle_url 指向字幕数据 json 的 url
 * @property {object} author 作者信息
 */

/**
 * 获取字幕信息列表
 * @param {number} aid 
 * @param {number} cid 
 * @returns {Promise<SubtitleInfo[]>}
 */
export const getSubtitleInfoList = async (aid, cid) => {
    try {
        const videoinfo = await getVideoInfo(aid, cid)
        return videoinfo.subtitle.list
    } catch (error) {
        return []
    }
}

/**
 * @typedef {Object} Dialogue
 * @property {number} from 开始时间
 * @property {number} to 结束时间
 * @property {number} location 默认 2
 * @property {string} content 字幕内容
 */

/**
 * @typedef {Object} SubtitleData 字幕数据
 * @property {number} font_size 默认 0.4
 * @property {string} font_color 默认 "#FFFFFF"
 * @property {number} background_alpha 默认 0.5
 * @property {string} background_color 默认 "#9C27B0"
 * @property {string} Stroke 默认 "none"
 * @property {Dialogue[]} body
 */

/**
 * @param {string} subtitle_url 指向字幕数据 json 的 url
 * @returns {Promise<SubtitleData>}
 */
export const getSubtitleData = async (subtitle_url) => {
    subtitle_url = subtitle_url.replace(/^http:/, "https:")

    const res = await fetch(subtitle_url)
    if (!res.ok) {
        throw new Error(`${res.status} ${res.statusText}`)
    }

    const data = await res.json()
    return data
}

/**
 * @param {number} aid 
 * @param {number} cid 
 */
export const getSubtitles = async (aid, cid) => {
    const list = await getSubtitleInfoList(aid, cid)
    return await Promise.all(
        list.map(async (info) => {
            const subtitleData = await getSubtitleData(info.subtitle_url)
            return {
                language: info.lan,
                language_doc: info.lan_doc,
                url: info.subtitle_url,
                data: subtitleData,
                ass: buildAss(subtitleData, info.lan_doc),
            }
        })
    )
}

export default getSubtitles
