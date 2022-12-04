"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var w=require("webpack"),d=require("fs-require"),h=require("path"),m=require("memfs"),y=require("fs"),q=require("unionfs");function f(e){return e&&typeof e=="object"&&"default"in e?e:{default:e}}var p=f(w),c=f(h),_=f(y);function b(){const e={};return e.promise=new Promise((r,i)=>{e.resolve=r,e.reject=i}),e}const v=e=>{const r=m.createFsFromVolume(m.Volume.fromJSON(e));return Object.assign(r,{join:c.default.join}),r};class j{constructor(r){this.options=r}apply(r){Object.assign(r,this.options)}}const F=()=>({mode:"production",target:"node",context:"/",entry:{index:"/src/index.js"},resolve:{modules:[c.default.resolve("node_modules"),"node_modules"]},resolveLoader:{modules:[c.default.resolve("node_modules"),"node_modules"]},module:{rules:[]},optimization:{minimize:!1},output:{filename:"[name].js",path:"/dist",libraryTarget:"commonjs2",libraryExport:"default"},plugins:[]});function g(e,r,i=p.default){const t=F();return r&&r(t),Array.isArray(t.plugins)||(t.plugins=[]),t.plugins.unshift(new j({inputFileSystem:new q.Union().use(_.default).use(e),outputFileSystem:e})),i(t)}const P=(e,r,i)=>{const t=v(e);return new Promise((a,u)=>{g(t,r,i).run((o,s)=>{if(o){u(o);return}a({stats:s,fs:t,require:d.createFsRequire(t)})})})},x=(e,r,i)=>{const t=v(e),a=g(t,r,i);let u,n=null;return{fs:t,require:d.createFsRequire(t),async build(o=(s=>(s=(i!=null?i:p.default).version)==null?void 0:s.startsWith("4."))()){if(n)throw new Error("Build in progress");return n=b(),u?o&&u.invalidate():u=a.watch({},async(s,l)=>{if(s){n==null||n.reject(s),n=null;return}n==null||n.resolve(l),n=null}),await n.promise},close:()=>new Promise((o,s)=>{if(!u){o();return}u.close(l=>{if(l)return s(l);o()})})}};exports.build=P,exports.watch=x;
