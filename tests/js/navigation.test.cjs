const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('app/static/js/ui.js', 'utf8');
const fn = source.slice(source.indexOf('    function mountSidebarToggle'), source.indexOf('    function ensureConfirmStyles'));
for (const [mobile, reduced] of [[false,false],[true,false],[false,true]]) {
    test(`menu manual, movimento 1.2s, mobile=${mobile}, reduced=${reduced}`, () => {
        const states = new Set(), handlers = {}, animations = [];
        const classList = { toggle(k, v) { const on = v === undefined ? !states.has(k) : v; on ? states.add(k) : states.delete(k); return on; } };
        const button = { setAttribute() {}, addEventListener(k, fn) { handlers[k] = fn; }, querySelector() { return { animate() {} }; } };
        const animate = (frames, options) => { const a = { frames, options, cancelled:false, cancel() { this.cancelled=true; } }; animations.push(a); return a; };
        const sidebar = { querySelector(s) { return s === '.aapm-nav-toggle' ? button : null; }, querySelectorAll() { return []; }, getBoundingClientRect() { return {width:states.has('aapm-nav-collapsed')?76:260,height:states.has('aapm-nav-collapsed')?60:210}; }, animate };
        const layout = { style:{}, classList:{toggle(){}}, animate };
        const context = { document:{body:{classList}},window:{matchMedia(q){return {matches:q.includes('reduced')?reduced:mobile,addEventListener(){}};}} };
        vm.createContext(context); vm.runInContext(fn,context);
        context.mountSidebarToggle(sidebar,layout);
        assert.equal(states.has('aapm-nav-collapsed'),false);
        handlers.click(); assert.equal(states.has('aapm-nav-collapsed'),true);
        if (reduced) assert.equal(animations.length,0);
        else {
            assert.equal(animations[0].options.duration,1200);
            assert.equal(mobile?animations[0].frames[1].height:animations[0].frames[1].gridTemplateColumns,mobile?'60px':'76px minmax(0, 1fr)');
        }
        handlers.click(); assert.equal(states.has('aapm-nav-collapsed'),false);
        if (!reduced) assert.equal(animations[0].cancelled,true);
    });
}
