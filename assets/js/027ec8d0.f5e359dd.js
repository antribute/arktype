"use strict";(self.webpackChunkarktype_io=self.webpackChunkarktype_io||[]).push([[9765],{9613:(e,t,r)=>{r.d(t,{Zo:()=>m,kt:()=>d});var n=r(9496);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function o(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function l(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?o(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):o(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function i(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},o=Object.keys(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var p=n.createContext({}),s=function(e){var t=n.useContext(p),r=t;return e&&(r="function"==typeof e?e(t):l(l({},t),e)),r},m=function(e){var t=s(e.components);return n.createElement(p.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},c=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,o=e.originalType,p=e.parentName,m=i(e,["components","mdxType","originalType","parentName"]),c=s(r),d=a,g=c["".concat(p,".").concat(d)]||c[d]||u[d]||o;return r?n.createElement(g,l(l({ref:t},m),{},{components:r})):n.createElement(g,l({ref:t},m))}));function d(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=r.length,l=new Array(o);l[0]=c;var i={};for(var p in t)hasOwnProperty.call(t,p)&&(i[p]=t[p]);i.originalType=e,i.mdxType="string"==typeof e?e:a,l[1]=i;for(var s=2;s<o;s++)l[s]=r[s];return n.createElement.apply(null,l)}return n.createElement.apply(null,r)}c.displayName="MDXCreateElement"},2449:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>m,contentTitle:()=>p,default:()=>d,frontMatter:()=>i,metadata:()=>s,toc:()=>u});var n=r(4250),a=r(7075),o=(r(9496),r(9613)),l=["components"],i={},p="Default Errors",s={unversionedId:"examples/error",id:"version-0.6.0/examples/error",title:"Default Errors",description:"---",source:"@site/versioned_docs/version-0.6.0/examples/error.mdx",sourceDirName:"examples",slug:"/examples/error",permalink:"/docs/0.6.0/examples/error",draft:!1,tags:[],version:"0.6.0",frontMatter:{}},m={},u=[{value:"Divisor",id:"divisor",level:2},{value:"Domain",id:"domain",level:2},{value:"Props",id:"props",level:2},{value:"Range",id:"range",level:2},{value:"Regex",id:"regex",level:2}],c={toc:u};function d(e){var t=e.components,r=(0,a.Z)(e,l);return(0,o.kt)("wrapper",(0,n.Z)({},c,r,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("h1",{id:"default-errors"},"Default Errors"),(0,o.kt)("hr",null),(0,o.kt)("h2",{id:"divisor"},"Divisor"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts"},'import { type } from "arktype"\n\nconst isEven = type("number%2")\n\nisEven(3)\n// {problems: `3 is not divisible by 2.`}\n')),(0,o.kt)("h2",{id:"domain"},"Domain"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts"},'import { type } from "arktype"\n\nconst aString = type("string")\n\naString(25)\n// {problems: `number is not assignable to string.`}\n')),(0,o.kt)("h2",{id:"props"},"Props"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts"},'import { type } from "arktype"\n\nconst User = type({ name: "string", age: "number" })\n\nUser({ name: "Arktype" })\n// {problems: `age is required.`}\n')),(0,o.kt)("h2",{id:"range"},"Range"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts"},'import { type } from "arktype"\n\nconst gt3 = type("number>3")\n\ngt3(2)\n// {problems: `Must be greater than 3(got 2)`}\n')),(0,o.kt)("h2",{id:"regex"},"Regex"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts"},'import { type } from "arktype"\n\nconst matchesRegex = type("/@arktype.io/$")\nmatchesRegex("john@doe.com")\n// {problems: `\'john@doe.com\' must match expression /\\\\w@arktype.io/.`}\n')),(0,o.kt)("h1",{id:"custom-errors"},"Custom Errors"),(0,o.kt)("p",null,"Custom errors can be added in as an option to ",(0,o.kt)("inlineCode",{parentName:"p"},"type")," by providing the respected\nerror"),(0,o.kt)("table",null,(0,o.kt)("thead",{parentName:"table"},(0,o.kt)("tr",{parentName:"thead"},(0,o.kt)("th",{parentName:"tr",align:null},"Rule"),(0,o.kt)("th",{parentName:"tr",align:null},"Error"))),(0,o.kt)("tbody",{parentName:"table"},(0,o.kt)("tr",{parentName:"tbody"},(0,o.kt)("td",{parentName:"tr",align:null},"Divisor"),(0,o.kt)("td",{parentName:"tr",align:null},"DivisorViolation")),(0,o.kt)("tr",{parentName:"tbody"},(0,o.kt)("td",{parentName:"tr",align:null},"Domain"),(0,o.kt)("td",{parentName:"tr",align:null},"Unassignable")),(0,o.kt)("tr",{parentName:"tbody"},(0,o.kt)("td",{parentName:"tr",align:null},"Props"),(0,o.kt)("td",{parentName:"tr",align:null},"MissingKey")),(0,o.kt)("tr",{parentName:"tbody"},(0,o.kt)("td",{parentName:"tr",align:null},"Range"),(0,o.kt)("td",{parentName:"tr",align:null},"RangeViolation")),(0,o.kt)("tr",{parentName:"tbody"},(0,o.kt)("td",{parentName:"tr",align:null},"Regex"),(0,o.kt)("td",{parentName:"tr",align:null},"RegexMismatch")))),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts"},'const isEven = type("number%2", {\n    diagnostics: {\n        DivisorViolation: {\n            message: (value: number) => `${value} is not even.`\n        }\n    }\n})\n')))}d.isMDXComponent=!0}}]);