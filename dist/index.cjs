"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var w=require("fs"),h=require("webpack"),y=require("unionfs"),m=require("fs-require"),_=require("path"),p=require("memfs");function c(e){return e&&typeof e=="object"&&"default"in e?e:{default:e}}var b=c(w),a=c(h),d=c(_);function q(){const e={};return e.promise=new Promise((r,u)=>{e.resolve=r,e.reject=u}),e}class j{constructor(r){this.options=r}apply(r){Object.assign(r,this.options)}}const v=e=>{const r=p.createFsFromVolume(p.Volume.fromJSON(e));return Object.assign(r,{join:d.default.join}),r},F=()=>({mode:"production",target:"node",context:"/",entry:{index:"/src/index.js"},resolve:{modules:[d.default.resolve("node_modules"),"node_modules"]},resolveLoader:{modules:[d.default.resolve("node_modules"),"node_modules"]},module:{rules:[]},optimization:{minimize:!1},output:{filename:"[name].js",path:"/dist",libraryTarget:"commonjs2",libraryExport:"default"},plugins:[]});function g(e,r,u=a.default){const t=F();return r&&r(t),Array.isArray(t.plugins)||(t.plugins=[]),t.plugins.unshift(new j({inputFileSystem:y.ufs.use(b.default).use(e),outputFileSystem:e})),u(t)}function P(e,r,u=a.default){const t=v(e);return new Promise((f,n)=>{g(t,r,u).run((s,o)=>{if(s){n(s);return}f({stats:o,fs:t,require:m.createFsRequire(t)})})})}function x(e,r,u=a.default){const t=v(e),f=g(t,r,u);let n,i=null;return{fs:t,require:m.createFsRequire(t),async build(s=a.default.version.startsWith("4.")){if(i)throw new Error("Build in progress");return i=q(),n?s&&n.invalidate():n=f.watch({},async(o,l)=>{if(o){i==null||i.reject(o),i=null;return}i==null||i.resolve(l),i=null}),await i.promise},close(){return new Promise((s,o)=>{n.close(l=>{if(l)return o(l);s()})})}}}exports.build=P,exports.watch=x;