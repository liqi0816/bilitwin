import { BiliMonkeyFLVHandler, BiliMonkeyFLVHandlerArray } from "./service/bilimonkey-flv-handler.js";
import { BiliUserJS, PlayerWindow } from './service/biliuserjs.js';
import { BiliMonkey } from './service/bilimonkey.js';

Object.assign(window, {
    BiliMonkeyFLVHandler,
    BiliMonkeyFLVHandlerArray,
    BiliUserJS,
    BiliMonkey
})

//////////////////////////

let u = new BiliUserJS();
u.connect(top as PlayerWindow);
var m = new BiliMonkey(u);
m.sniffDefaultFormat();

//////////////////////////

Object.assign(window, {
    u, m
})
