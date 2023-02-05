"use strict";(self.webpackChunkarktype_io=self.webpackChunkarktype_io||[]).push([[844],{9613:(e,n,t)=>{t.d(n,{Zo:()=>l,kt:()=>f});var r=t(9496);function a(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function o(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function i(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?o(Object(t),!0).forEach((function(n){a(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):o(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function s(e,n){if(null==e)return{};var t,r,a=function(e,n){if(null==e)return{};var t,r,a={},o=Object.keys(e);for(r=0;r<o.length;r++)t=o[r],n.indexOf(t)>=0||(a[t]=e[t]);return a}(e,n);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)t=o[r],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(a[t]=e[t])}return a}var p=r.createContext({}),c=function(e){var n=r.useContext(p),t=n;return e&&(t="function"==typeof e?e(n):i(i({},n),e)),t},l=function(e){var n=c(e.components);return r.createElement(p.Provider,{value:n},e.children)},d={inlineCode:"code",wrapper:function(e){var n=e.children;return r.createElement(r.Fragment,{},n)}},u=r.forwardRef((function(e,n){var t=e.components,a=e.mdxType,o=e.originalType,p=e.parentName,l=s(e,["components","mdxType","originalType","parentName"]),u=c(t),f=a,m=u["".concat(p,".").concat(f)]||u[f]||d[f]||o;return t?r.createElement(m,i(i({ref:n},l),{},{components:t})):r.createElement(m,i({ref:n},l))}));function f(e,n){var t=arguments,a=n&&n.mdxType;if("string"==typeof e||a){var o=t.length,i=new Array(o);i[0]=u;var s={};for(var p in n)hasOwnProperty.call(n,p)&&(s[p]=n[p]);s.originalType=e,s.mdxType="string"==typeof e?e:a,i[1]=s;for(var c=2;c<o;c++)i[c]=t[c];return r.createElement.apply(null,i)}return r.createElement.apply(null,t)}u.displayName="MDXCreateElement"},5090:(e,n,t)=>{t.d(n,{g:()=>x});var r=t(9346),a=t(7374),o=t(3913),i=t(1269),s=t(9496),p=t(1360);var c={},l={type:'import { type } from "arktype"\n\n// Define a type...\nexport const user = type({\n    name: "string",\n    device: {\n        platform: "\'android\'|\'ios\'",\n        "version?": "number"\n    }\n})\n\n// Infer it...\nexport type User = typeof user.infer\n\n// Validate your data anytime, anywhere, with the same clarity and precision you expect from TypeScript.\nexport const { data, problems } = user({\n    name: "Alan Turing",\n    device: {\n        platform: "enigma"\n    }\n})\n\nif (problems) {\n    // "device/platform must be \'android\' or \'ios\' (was \'enigma\')"\n    console.log(problems.summary)\n}\n',scope:'import { scope } from "../api.js"\n\n// Scopes are collections of types that can reference each other.\nexport const types = scope({\n    package: {\n        name: "string",\n        "dependencies?": "package[]",\n        "devDependencies?": "package[]",\n        "contributors?": "contributor[]"\n    },\n    contributor: {\n        // Subtypes like \'email\' are inferred like \'string\' but provide additional validation at runtime.\n        email: "email",\n        "packages?": "package[]"\n    }\n}).compile()\n\n// Cyclic types are inferred to arbitrary depth...\nexport type Package = typeof types.package.infer\n\n// And can validate cyclic data.\nexport const readPackageData = () => {\n    const packageData: Package = {\n        name: "arktype",\n        dependencies: [],\n        devDependencies: [{ name: "typescript" }],\n        contributors: [{ email: "david@sharktypeio" }]\n    }\n    packageData.devDependencies![0].dependencies = [packageData]\n    return packageData\n}\n\nexport const { problems } = types.package(readPackageData())\n'},d={},u=function(e){for(var n,t={},r=(0,p.Z)(e);!(n=r()).done;){var a=n.value;t[a+".ts"]=c[a]}return t};var f={"index.html":'<head>\n    <link href="http://fonts.cdnfonts.com/css/cascadia-code" rel="stylesheet" />\n</head>\n<div id="demo">\n    <div id="input">\n        <div class="section">\n            <h3>Definition</h3>\n            <div class="card">\n                <pre><code id="definition"></code></pre>\n            </div>\n        </div>\n        <div class="section">\n            <h3>Data</h3>\n            <div class="card">\n                <pre id="data"></pre>\n            </div>\n        </div>\n    </div>\n    <div class="section">\n        <h3>Result</h3>\n        <div class="card">\n            <p id="result"></p>\n        </div>\n    </div>\n</div>\n',"demo.css":'body {\n    font-family: "Cascadia Code", sans-serif;\n    background-color: hsl(220 18% 10%);\n}\n\n#demo {\n    display: flex;\n    flex-direction: column;\n    gap: 16px;\n    margin: -8px;\n    padding: 8px;\n}\n\n#input {\n    display: flex;\n    flex-direction: row;\n    flex-wrap: wrap;\n    gap: 8px;\n}\n\n.section {\n    display: flex;\n    flex-direction: column;\n    flex-grow: 1;\n    gap: 8px;\n}\n\n.card {\n    padding: 8px;\n    background-color: rgb(18, 18, 18);\n    color: rgb(255, 255, 255);\n    /* transition: box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms; */\n    border-radius: 4px;\n    box-shadow: rgba(0, 0, 0, 0.2) 0px 2px 1px -1px,\n        rgba(0, 0, 0, 0.14) 0px 1px 1px 0px, rgba(0, 0, 0, 0.12) 0px 1px 3px 0px;\n    background-image: linear-gradient(\n        rgba(255, 255, 255, 0.05),\n        rgba(255, 255, 255, 0.05)\n    );\n    height: 100%;\n}\n\np {\n    white-space: pre-wrap;\n}\n\npre {\n    white-space: pre-wrap;\n}\n\nh3 {\n    margin: 0px;\n    color: #fff;\n}\n\n.key {\n    color: #0067a5;\n}\n.val {\n    color: #e3ab57;\n}\n',"populateDemo.ts":'import "./demo.css"\n\ntype PopulateDemoArgs = {\n    data: object\n    definition: object\n    error: string\n}\nexport const populateDemo = ({ data, definition, error }: PopulateDemoArgs) => {\n    const defElement = document.querySelector("#definition")!\n    defElement.textContent = JSON.stringify(definition, null, 2)\n    defElement.innerHTML = recolor(defElement.innerHTML)\n\n    const dataElement = document.querySelector("#data")!\n    dataElement.textContent = JSON.stringify(data, null, 2)\n    dataElement.innerHTML = recolor(dataElement.innerHTML)\n\n    document.querySelector("#result")!.textContent = error ?? "Looks good!"\n}\n\nconst recolor = (input: string) => {\n    const lines = input.split("\\n")\n    const fixedInput: string[] = []\n    for (const line of lines) {\n        if (line.includes(":")) {\n            const parts = line.split(":")\n            fixedInput.push(`${buildKey(parts[0])}: ${buildVal(parts[1])}`)\n        } else {\n            fixedInput.push(line)\n        }\n    }\n    return fixedInput.join("\\n")\n}\n\nconst buildKey = (key: string) => {\n    return `<span class=\'key\'>${key}</span>`\n}\nconst buildVal = (val: string) => {\n    const formatted = val.trim()\n    if (formatted.at(-1) === ",") {\n        return `<span class=\'val\'>${formatted.replace(",", "")}</span>,`\n    } else if (formatted.at(-1) === "{") {\n        return "{"\n    }\n    return `<span class=\'val\'>${formatted}</span>`\n}\n',"tsconfig.json":JSON.stringify({compilerOptions:{module:"esnext",target:"esnext",strict:!0}},null,4)},m=t(9087),y=function(e){var n=g[e];return'import {populateDemo} from "./populateDemo"\n(async () => {\n    try {\n        '+n[0]+"\n        populateDemo("+n[1]+')\n    } catch(e) {\n        populateDemo({ \n            definition: {},\n            data: {},\n            error: "ParseError: " + e.originalErr.message,\n          })\n    }\n})()'},g={type:['const { user, fetchUser, errors } = await import("./type")',"{ definition: user.definition, data: fetchUser(), error: errors?.summary }"],scope:['const { types, readPackageData, errors } = await import("./scope")',"{ definition: types.$root.dictionary, data: readPackageData(), error: errors?.summary }"]},v="arktype-demo",b=function(){var e=(0,a.Z)((0,r.Z)().mark((function e(n){var t,a,o;return(0,r.Z)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return o=n.embedId,e.abrupt("return",m.Z.embedProject(v,{files:Object.assign((t={},t[o+".ts"]=l[o],t["index.ts"]=y(o),t),f,u(null!=(a=d[o])?a:[])),title:o,description:"Demo for "+o,template:"typescript",dependencies:{arktype:"0.1.0"},settings:{compile:{clearConsole:!1}}},{height:"100%",openFile:o+".ts"}));case 2:case"end":return e.stop()}}),e)})));return function(n){return e.apply(this,arguments)}}(),x=function(e){var n=(0,s.useState)(!0),t=n[0],p=n[1];return(0,s.useEffect)((function(){(0,a.Z)((0,r.Z)().mark((function n(){return(0,r.Z)().wrap((function(n){for(;;)switch(n.prev=n.next){case 0:return n.next=2,b(e);case 2:p(!1);case 3:case"end":return n.stop()}}),n)})))()}),[]),s.createElement(o.Z,{style:{width:"100%",height:"660px",border:0,marginLeft:-8,marginRight:-8,padding:16,overflow:"hidden",borderRadius:"8px",display:"flex",justifyContent:"center",alignItems:"center"}},t?s.createElement(i.Z,{style:{position:"absolute"},color:"secondary"}):null,s.createElement("div",{style:{opacity:t?0:1},id:v}))}},1495:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>d,contentTitle:()=>c,default:()=>m,frontMatter:()=>p,metadata:()=>l,toc:()=>u});var r=t(4250),a=t(7075),o=(t(9496),t(9613)),i=t(5090),s=["components"],p={id:"intro",hide_table_of_contents:!0,title:"Intro"},c="Getting Started",l={unversionedId:"intro",id:"version-0.1.0/intro",title:"Intro",description:"Installation \ud83d\udce6",source:"@site/versioned_docs/version-0.1.0/index.mdx",sourceDirName:".",slug:"/",permalink:"/docs/",draft:!1,tags:[],version:"0.1.0",frontMatter:{id:"intro",hide_table_of_contents:!0,title:"Intro"},sidebar:"sidebar",next:{title:"Scopes",permalink:"/docs/scopes"}},d={},u=[{value:"Installation \ud83d\udce6",id:"installation-",level:2},{value:"Your first type",id:"your-first-type",level:2}],f={toc:u};function m(e){var n=e.components,t=(0,a.Z)(e,s);return(0,o.kt)("wrapper",(0,r.Z)({},f,t,{components:n,mdxType:"MDXLayout"}),(0,o.kt)("h1",{id:"getting-started"},"Getting Started"),(0,o.kt)("h2",{id:"installation-"},"Installation \ud83d\udce6"),(0,o.kt)("p",null,(0,o.kt)("inlineCode",{parentName:"p"},"npm install arktype")),(0,o.kt)("p",null,"(feel free to substitute ",(0,o.kt)("inlineCode",{parentName:"p"},"yarn"),", ",(0,o.kt)("inlineCode",{parentName:"p"},"pnpm"),", et al.)"),(0,o.kt)("p",null,"If you're using TypeScript, you'll need at least ",(0,o.kt)("inlineCode",{parentName:"p"},"4.8"),"."),(0,o.kt)("h2",{id:"your-first-type"},"Your first type"),(0,o.kt)(i.g,{embedId:"type",mdxType:"StackBlitzDemo"}))}m.isMDXComponent=!0}}]);