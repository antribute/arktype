import { suite, test } from "mocha"
import { type } from "../../src/main.js"
import { attest } from "../attest/main.js"

suite("object literal", () => {
    test("empty", () => {
        const o = type({})
        attest(o.condition).equals(type("object").condition)
    })
    test("required", () => {
        const o = type({ a: "string", b: "boolean" })
        attest(o.infer).typed as { a: string; b: boolean }
        attest(o.root.condition).snap(`
if (!(typeof $arkRoot.a === "string")) {
            return false
        }
(() => {
          if (!($arkRoot.b === false)) {
            return false
        }
          return true
      }) || (() => {
          if (!($arkRoot.b === true)) {
            return false
        }
          return true
      })`)
    })
    test("optional keys", () => {
        const o = type({ "a?": "string", b: "boolean" })
        attest(o.infer).typed as { a?: string; b: boolean }
        attest(o.root.condition).snap(`
(() => {
          if (!($arkRoot.b === false)) {
            return false
        }
          return true
      }) || (() => {
          if (!($arkRoot.b === true)) {
            return false
        }
          return true
      })
if('a' in $arkRoot) {
            if (!(typeof $arkRoot.a === "string")) {
            return false
        }
        }`)
    })
    test("nested", () => {
        const t = type({ "a?": { b: "boolean" } })
        attest(t.infer).typed as { a?: { b: boolean } }
        attest(t.root.condition).snap(`
if('a' in $arkRoot) {
            
(() => {
          if (!($arkRoot.a.b === false)) {
            return false
        }
          return true
      }) || (() => {
          if (!($arkRoot.a.b === true)) {
            return false
        }
          return true
      })
        }`)
    })

    test("intersections", () => {
        const a = { "a?": "string" } as const
        const b = { b: "string" } as const
        const c = { "c?": "string" } as const
        const abc = type(a).and(b).and(c)
        attest(abc.infer).typed as {
            a?: string
            b: string
            c?: string
        }
        attest(abc.condition).equals(type({ ...a, ...b, ...c }).condition)
        attest(abc.condition).equals(type([[a, "&", b], "&", c]).condition)
    })
    test("traverse optional", () => {
        const o = type({ "a?": "string" }).configure({ keys: "strict" })
        attest(o({ a: "a" }).data).snap({ a: "a" })
        attest(o({}).data).snap({})
        attest(o({ a: 1 }).problems?.summary).snap(
            "a must be a string (was number)"
        )
    })
    test("intersection", () => {
        const t = type({ a: "number" }).and({ b: "boolean" })
        // Should be simplified from {a: number} & {b: boolean} to {a: number, b: boolean}
        attest(t.infer).types.toString.snap("{ a: number; b: boolean; }")
        attest(t.condition).is(type({ a: "number", b: "boolean" }).condition)
    })
    test("escaped optional token", () => {
        const t = type({ "a\\?": "string" })
        attest(t.infer).typed as { "a?": string }
    })
    test("multiple bad strict", () => {
        const t = type({ a: "string", b: "boolean" }).configure({
            keys: "strict"
        })
        attest(t({ a: 1, b: 2 }).problems?.summary).snap(
            "a must be a string (was number)\nb must be boolean (was number)"
        )
    })
})
