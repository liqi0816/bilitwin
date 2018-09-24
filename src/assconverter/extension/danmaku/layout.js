    import font from '../font/font.js';
    
    const rtlCanvas = function (options) {
      const {
        resolutionX: wc, // width of canvas
        resolutionY: hc, // height of canvas
        bottomReserved: b, // reserved bottom height for subtitle
        rtlDuration: u, // duration appeared on screen
        maxDelay: maxr, // max allowed delay
      } = options;

      // Initial canvas border
      let used = [
        // p: top
        // m: bottom
        // tf: time completely enter screen
        // td: time completely leave screen
        // b: allow conflict with subtitle
        // add a fake danmaku for describe top of screen
        { p: -Infinity, m: 0, tf: Infinity, td: Infinity, b: false },
        // add a fake danmaku for describe bottom of screen
        { p: hc, m: Infinity, tf: Infinity, td: Infinity, b: false },
        // add a fake danmaku for placeholder of subtitle
        { p: hc - b, m: hc, tf: Infinity, td: Infinity, b: true },
      ];
      // Find out some position is available
      const available = (hv, t0s, t0l, b) => {
        const suggestion = [];
        // Upper edge of candidate position should always be bottom of other danmaku (or top of screen)
        used.forEach(i => {
          if (i.m + hv >= hc) return;
          const p = i.m;
          const m = p + hv;
          let tas = t0s;
          let tal = t0l;
          // and left border should be right edge of others
          used.forEach(j => {
            if (j.p >= m) return;
            if (j.m <= p) return;
            if (j.b && b) return;
            tas = Math.max(tas, j.tf);
            tal = Math.max(tal, j.td);
          });
          const r = Math.max(tas - t0s, tal - t0l);
          if (r > maxr) return;
          // save a candidate position
          suggestion.push({ p, r });
        });
        // sorted by its vertical position
        suggestion.sort((x, y) => x.p - y.p);
        let mr = maxr;
        // the bottom and later choice should be ignored
        const filtered = suggestion.filter(i => {
          if (i.r >= mr) return false;
          mr = i.r;
          return true;
        });
        return filtered;
      };
      // mark some area as used
      let use = (p, m, tf, td) => {
        used.push({ p, m, tf, td, b: false });
      };
      // remove danmaku not needed anymore by its time
      const syn = (t0s, t0l) => {
        used = used.filter(i => i.tf > t0s || i.td > t0l);
      };
      // give a score in range [0, 1) for some position
      const score = i => {
        if (i.r > maxr) return -Infinity;
        return 1 - Math.hypot(i.r / maxr, i.p / hc) * Math.SQRT1_2;
      };
      // add some danmaku
      return line => {
        const {
          time: t0s, // time sent (start to appear if no delay)
          width: wv, // width of danmaku
          height: hv, // height of danmaku
          bottom: b, // is subtitle
        } = line;
        const t0l = wc / (wv + wc) * u + t0s; // time start to leave
        syn(t0s, t0l);
        const al = available(hv, t0s, t0l, b);
        if (!al.length) return null;
        const scored = al.map(i => [score(i), i]);
        const best = scored.reduce((x, y) => {
          return x[0] > y[0] ? x : y;
        })[1];
        const ts = t0s + best.r; // time start to enter
        const tf = wv / (wv + wc) * u + ts; // time complete enter
        const td = u + ts; // time complete leave
        use(best.p, best.p + hv, tf, td);
        return {
          top: best.p,
          time: ts,
        };
      };
    };

    const fixedCanvas = function (options) {
      const {
        resolutionY: hc,
        bottomReserved: b,
        fixDuration: u,
        maxDelay: maxr,
      } = options;
      let used = [
        { p: -Infinity, m: 0, td: Infinity, b: false },
        { p: hc, m: Infinity, td: Infinity, b: false },
        { p: hc - b, m: hc, td: Infinity, b: true },
      ];
      // Find out some available position
      const fr = (p, m, t0s, b) => {
        let tas = t0s;
        used.forEach(j => {
          if (j.p >= m) return;
          if (j.m <= p) return;
          if (j.b && b) return;
          tas = Math.max(tas, j.td);
        });
        const r = tas - t0s;
        if (r > maxr) return null;
        return { r, p, m };
      };
      // layout for danmaku at top
      const top = (hv, t0s, b) => {
        const suggestion = [];
        used.forEach(i => {
          if (i.m + hv >= hc) return;
          suggestion.push(fr(i.m, i.m + hv, t0s, b));
        });
        return suggestion.filter(x => x);
      };
      // layout for danmaku at bottom
      const bottom = (hv, t0s, b) => {
        const suggestion = [];
        used.forEach(i => {
          if (i.p - hv <= 0) return;
          suggestion.push(fr(i.p - hv, i.p, t0s, b));
        });
        return suggestion.filter(x => x);
      };
      const use = (p, m, td) => {
        const l = { p, m, td, b: false };
        used.push({ p, m, td, b: false });
      };
      const syn = t0s => {
        used = used.filter(i => i.td > t0s);
      };
      // Score every position
      const score = (i, is_top) => {
        if (i.r > maxr) return -Infinity;
        const f = p => is_top ? p : (hc - p);
        return 1 - (i.r / maxr * (31 / 32) + f(i.p) / hc * (1 / 32));
      };
      return function (line) {
        const { time: t0s, height: hv, bottom: b } = line;
        const is_top = line.mode === 'TOP';
        syn(t0s);
        const al = (is_top ? top : bottom)(hv, t0s, b);
        if (!al.length) return null;
        const scored = al.map(function (i) { return [score(i, is_top), i]; });
        const best = scored.reduce(function (x, y) {
          return x[0] > y[0] ? x : y;
        }, [-Infinity, null])[1];
        if (!best) return null;
        use(best.p, best.m, best.r + t0s + u);
        return { top: best.p, time: best.r + t0s };
      };
    };

    const placeDanmaku = function (options) {
      const layers = options.maxOverlap;
      const normal = Array(layers).fill(null).map(x => rtlCanvas(options));
      const fixed = Array(layers).fill(null).map(x => fixedCanvas(options));
      return function (line) {
        line.fontSize = Math.round(line.size * options.fontSize);
        line.height = line.fontSize;
        line.width = line.width || font.text(options.fontFamily, line.text, line.fontSize) || 1;

        if (line.mode === 'RTL') {
          const pos = normal.reduce((pos, layer) => pos || layer(line), null);
          if (!pos) return null;
          const { top, time } = pos;
          line.layout = {
            type: 'Rtl',
            start: {
              x: options.resolutionX + line.width / 2,
              y: top + line.height,
              time,
            },
            end: {
              x: -line.width / 2,
              y: top + line.height,
              time: options.rtlDuration + time,
            },
          };
        } else if (['TOP', 'BOTTOM'].includes(line.mode)) {
          const pos = fixed.reduce((pos, layer) => pos || layer(line), null);
          if (!pos) return null;
          const { top, time } = pos;
          line.layout = {
            type: 'Fix',
            start: {
              x: Math.round(options.resolutionX / 2),
              y: top + line.height,
              time,
            },
            end: {
              time: options.fixDuration + time,
            },
          };
        }
        return line;
      };
    };

    // main layout algorithm
    const layout = async function (danmaku, optionGetter) {
      const options = JSON.parse(JSON.stringify(optionGetter));
      const sorted = danmaku.slice(0).sort(({ time: x }, { time: y }) => x - y);
      const place = placeDanmaku(options);
      const result = Array(sorted.length);
      let length = 0;
      for (let i = 0, l = sorted.length; i < l; i++) {
        let placed = place(sorted[i]);
        if (placed) result[length++] = placed;
        if ((i + 1) % 1000 === 0) {
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }
      result.length = length;
      result.sort((x, y) => x.layout.start.time - y.layout.start.time);
      return result;
    };
    
    export default layout;
