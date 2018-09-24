/**
 * @file Common works for reading / writing optinos
 */

  import fontModule from '../font/font.js';

  const optionKey = 'options';

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

  /** @type {ExtOption} */
  const options = {};

  /**
   * @returns {string}
   */
  const predefFontFamily = () => {
    // const sc = ['Microsoft YaHei', 'PingFang SC', 'Noto Sans CJK SC'];
    // replaced with bilibili defaults
    const sc = ["SimHei", "'Microsoft JhengHei'", "SimSun", "NSimSun", "FangSong", "'Microsoft YaHei'", "'Microsoft Yahei UI Light'", "'Noto Sans CJK SC Bold'", "'Noto Sans CJK SC DemiLight'", "'Noto Sans CJK SC Regular'"];
    const tc = ['Microsoft JhengHei', 'PingFang TC', 'Noto Sans CJK TC'];
    const ja = ['MS PGothic', 'Hiragino Kaku Gothic Pro', 'Noto Sans CJK JP'];
    const lang = navigator.language;
    const fonts = /^ja/.test(lang) ? ja : /^zh(?!.*Hans).*(?:TW|HK|MO)/.test(lang) ? tc : sc;
    const chosed = fonts.find(font => fontModule.valid(font)) || fonts[0];
    return chosed;
  };

  const attributes = [
    { name: 'resolutionX', type: 'number', min: 480, predef: 560 },
    { name: 'resolutionY', type: 'number', min: 360, predef: 420 },
    { name: 'bottomReserved', type: 'number', min: 0, predef: 60 },
    { name: 'fontFamily', type: 'string', predef: predefFontFamily(), valid: font => fontModule.valid(font) },
    { name: 'fontSize', type: 'number', min: 0, predef: 1, step: 0.01 },
    { name: 'textSpace', type: 'number', min: 0, predef: 0 },
    { name: 'rtlDuration', type: 'number', min: 0.1, predef: 8, step: 0.1 },
    { name: 'fixDuration', type: 'number', min: 0.1, predef: 4, step: 0.1 },
    { name: 'maxDelay', type: 'number', min: 0, predef: 6, step: 0.1 },
    { name: 'textOpacity', type: 'number', min: 10, max: 100, predef: 60 },
    { name: 'maxOverlap', type: 'number', min: 1, max: 20, predef: 1 },
    { name: 'bold', type: 'boolean', predef: true },
    { name: 'title', type: 'string', predef: 'danmaku', valid: title => title != 'undefined' },
    { name: 'originalURL', type: 'string', predef: 'anonymous xml', valid: url => url != 'undefined' },
  ];

  const attrNormalize = (option, { name, type, min = -Infinity, max = Infinity, step = 1, predef, valid }) => {
    let value = option;
    if (type === 'number') value = +value;
    else if (type === 'string') value = '' + value;
    else if (type === 'boolean') value = !!value;
    if (valid && !valid(value)) value = predef;
    if (type === 'number') {
      if (Number.isNaN(value)) value = predef;
      if (value < min) value = min;
      if (value > max) value = max;
      value = Math.round((value - min) / step) * step + min;
    }
    return value;
  };

  /**
   * @param {ExtOption} option
   * @returns {ExtOption}
   */
  const normalize = function (option) {
    return Object.assign({},
      ...attributes.map(attr => ({ [attr.name]: attrNormalize(option[attr.name], attr) }))
    );
  };

  /**
   * @param {ExtOption} option
   * @returns {Promise.<ExtOption>}
   */
  const set = async function (proxied) {
    const write = { [optionKey]: JSON.stringify(proxied) };
    await browser.storage.sync.set(write);
    return proxied;
  };

  /**
   * @returns {Promise.<ExtOption>}
   */
  const get = async function () {
    let option;
    try {
      const read = (await browser.storage.sync.get({ [optionKey]: '{}' }))[optionKey];
      option = JSON.parse(read);
    } catch (e) { option = {}; }
    const normalized = normalize(option);
    if (JSON.stringify(normalized) !== JSON.stringify(option)) set(normalized);
    return normalized;
  };

  const proxy = function () {
    const proxied = new Proxy(options, {
      get: (options, prop) => {
        const attr = attributes.find(({ name }) => name === prop);
        return attrNormalize(options[prop], attr);
      },
      set: (option, prop, value) => {
        const attr = attributes.find(({ name }) => name === prop);
        option[prop] === value;
        Object.assign(option, attr ? { [attr.name]: attrNormalize(option[prop], attr) } : {});
      },
    });
  };

  /**
   * @param {ExtOption} option
   * @param {HTMLElement} dom
   */
  const bindDom = function (proxied, dom) {
    const values = Array.from(dom.querySelectorAll('[data-value]'));
    Array.from(dom.querySelectorAll('input[name]')).forEach(element => {
      const name = element.getAttribute('name');
      const outputs = values.filter(output => output.dataset.value === name);

      const attr = attributes.find(({ name: attr }) => attr === name);
      element.addEventListener('input', event => {
        const option = element.value;
        const normalized = attrNormalize(option, attr);
        proxied[name] = normalized;
        set(proxied);
        outputs.forEach(output => { output.value = normalized; });
      });
      element.addEventListener('blur', event => {
        element.value = proxied[name];
      });
      element.value = proxied[name];
      outputs.forEach(output => { output.value = proxied[name]; });
    });
    return proxied;
  };

  const exp = { get, bindDom };

  export default exp;
  export { normalize };
