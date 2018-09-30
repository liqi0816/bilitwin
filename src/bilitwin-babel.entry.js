"${metadata}"

if (document.readyState == 'loading') {
    var h = () => {
        load();
        document.removeEventListener('DOMContentLoaded', h);
    };
    document.addEventListener('DOMContentLoaded', h);
}
else {
    load();
}

function load() {
    if (typeof TextEncoder === 'undefined') {
        top.TextEncoder = function () {
            this.encoding = 'utf-8';
            this.encode = function (str) {
                var binstr = unescape(encodeURIComponent(str)),
                    arr = new Uint8Array(binstr.length);
                binstr.split('').forEach(function (char, i) {
                    arr[i] = char.charCodeAt(0);
                });
                return arr;
            };
        }
    }

    if (typeof _babelPolyfill === 'undefined') {
        new Promise(function (resolve) {
            var req = new XMLHttpRequest();
            req.onload = function () { resolve(req.responseText); };
            req.open('get', 'https://cdn.bootcss.com/babel-polyfill/7.0.0-beta.42/polyfill.min.js');
            req.send();
        }).then(function (script) {
            top.eval(script);
        }).then(function () {
            script();
            _babelPolyfill = false;
        });
    }
    else {
        script();
        _babelPolyfill = false;
    }
}

function script() {
    "${transpiledCode}"
}


