"${metadata}"

if (document.readyState == 'loading') {
    var h = function () {
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

    if (typeof TextDecoder === 'undefined') {
        top.TextDecoder = function () {
            this.encoding = 'utf-8';
            this.decode = function (input) {
                if (input instanceof ArrayBuffer) {
                    input = new Uint8Array(input);
                } else {
                    input = new Uint8Array(input.buffer);
                }

                var l = Array.prototype.map.call(input, function (x) { return String.fromCharCode(x) }).join("");
                return decodeURIComponent(escape(l));
            };
        }
    }

    if (typeof _babelPolyfill === 'undefined') {
        new Promise(function (resolve) {
            var req = new XMLHttpRequest();
            req.onload = function () { resolve(req.responseText); };
            req.open('get', 'https://cdn.staticfile.org/babel-polyfill/7.7.0/polyfill.min.js');
            req.send();
        }).then(function (script) {
            top.eval(script);
            _babelPolyfill = false;
        }).then(function () {
            script();
        });
    }
    else {
        script();
    }
}

function script() {
    "${transpiledCode}"
}


