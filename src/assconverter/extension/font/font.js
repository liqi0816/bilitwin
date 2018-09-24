const font = {};

// Meansure using canvas
font.textByCanvas = function () {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  return function (fontname, text, fontsize) {
    context.font = `bold ${fontsize}px ${fontname}`;
    return Math.ceil(context.measureText(text).width);
  };
};

// Meansure using <div>
font.textByDom = function () {
  const container = document.createElement('div');
  container.setAttribute('style', 'all: initial !important');
  const content = document.createElement('div');
  content.setAttribute('style', [
    'top: -10000px', 'left: -10000px',
    'width: auto', 'height: auto', 'position: absolute',
  ].map(item => item + ' !important;').join(' '));
  const active = () => { document.body.parentNode.appendChild(content); };
  if (!document.body) document.addEventListener('DOMContentLoaded', active);
  else active();
  return (fontname, text, fontsize) => {
    content.textContent = text;
    content.style.font = `bold ${fontsize}px ${fontname}`;
    return content.clientWidth;
  };
};

font.text = (function () {
  // https://bugzilla.mozilla.org/show_bug.cgi?id=561361
  if (/linux/i.test(navigator.platform)) {
    return font.textByDom();
  } else {
    return font.textByCanvas();
  }
}());

font.valid = (function () {
  const cache = new Map();
  const textWidth = font.text;
  // Use following texts for checking
  const sampleText = [
    'The quick brown fox jumps over the lazy dog',
    '7531902468', ',.!-', '，。：！',
    '天地玄黄', '則近道矣',
    'あいうえお', 'アイウエオガパ', 'ｱｲｳｴｵｶﾞﾊﾟ',
  ].join('');
  // Some given font family is avaliable iff we can meansure different width compared to other fonts
  const sampleFont = [
    'monospace', 'sans-serif', 'sans',
    'Symbol', 'Arial', 'Comic Sans MS', 'Fixed', 'Terminal',
    'Times', 'Times New Roman',
    'SimSum', 'Microsoft YaHei', 'PingFang SC', 'Heiti SC', 'WenQuanYi Micro Hei',
    'Pmingliu', 'Microsoft JhengHei', 'PingFang TC', 'Heiti TC',
    'MS Gothic', 'Meiryo', 'Hiragino Kaku Gothic Pro', 'Hiragino Mincho Pro',
  ];
  const diffFont = function (base, test) {
    const baseSize = textWidth(base, sampleText, 72);
    const testSize = textWidth(test + ',' + base, sampleText, 72);
    return baseSize !== testSize;
  };
  const validFont = function (test) {
    if (cache.has(test)) return cache.get(test);
    const result = sampleFont.some(base => diffFont(base, test));
    cache.set(test, result);
    return result;
  };
  return validFont;
}());

export default font;
