import { suite, test } from "mocha"
import type { TypeNode } from "../../src/main.js"
import { arrayIndexInput } from "../../src/nodes/composite/indexed.js"
import { node } from "../../src/nodes/composite/type.js"
import type { Out } from "../../src/parse/ast/morph.js"
import { attest } from "../attest/main.js"

suite("node definitions", () => {
    suite("basis", () => {
        test("domain", () => {
            const t = node({
                basis: "string"
            })
            attest(t).typed as TypeNode<string>
        })
        test("class", () => {
            const t = node({
                basis: Date
            })
            attest(t).typed as TypeNode<Date>
        })
        test("value", () => {
            const t = node({
                basis: ["===", 3.14159]
            })
            attest(t).typed as TypeNode<3.14159>
        })
    })
    test("optional props", () => {
        const t = node({
            basis: "object",
            props: {
                a: {
                    value: { basis: "string" }
                },
                b: {
                    optional: true,
                    value: { basis: "number" }
                }
            }
        })
        attest(t).typed as TypeNode<{
            a: string
            b?: boolean
        }>
    })
    test("arrays", () => {
        const t = node({
            basis: Array,
            props: [
                {},
                {
                    key: arrayIndexInput(),
                    value: {
                        basis: "object",
                        props: {
                            name: {
                                kind: "required",
                                value: { basis: "string" }
                            }
                        }
                    }
                }
            ]
        })
        attest(t).typed as TypeNode<{ name: string }[]>
    })
    test("variadic tuple", () => {
        const t = node({
            basis: Array,
            props: [
                {
                    0: {
                        kind: "required",
                        value: { basis: "string" }
                    },
                    // works for numeric or string keys
                    "1": {
                        kind: "required",
                        value: { basis: "number" }
                    }
                },
                {
                    key: arrayIndexInput(2),
                    value: {
                        basis: "symbol"
                    }
                }
            ]
        })
        attest(t).typed as TypeNode<[string, number, ...symbol[]]>
    })
    test("non-variadic tuple", () => {
        const t = node({
            basis: Array,
            props: {
                0: {
                    value: {
                        basis: "object",
                        props: {
                            a: { value: { basis: "string" } },
                            b: { value: { basis: "number" } }
                        }
                    }
                },
                1: {
                    value: {
                        basis: ["===", "arktype"]
                    }
                },
                length: {
                    prerequisite: true,
                    value: { basis: ["===", 2] }
                }
            }
        })
        attest(t).typed as TypeNode<
            [
                {
                    a: string
                    b: number
                },
                "arktype"
            ]
        >
    })
    test("branches", () => {
        const t = node(
            { basis: ["===", "foo"] },
            { basis: ["===", "bar"] },
            { basis: "number" },
            {
                basis: "object",
                props: { a: { kind: "required", value: { basis: "bigint" } } }
            }
        )
        attest(t).typed as TypeNode<number | "foo" | "bar" | { a: bigint }>
    })
    test("narrow", () => {
        const t = node({
            basis: "string",
            narrow: (s): s is "foo" => s === "foo"
        })
        attest(t).typed as TypeNode<"foo">
    })
    test("narrow array", () => {
        const t = node({
            basis: "object",
            narrow: [
                (o): o is { a: string } => typeof o.a === "string",
                (o): o is { b: boolean } => typeof o.b === "boolean"
            ] as const
        })
        attest(t).typed as TypeNode<{
            a: string
            b: boolean
        }>
    })
    test("morph", () => {
        const t = node({
            basis: "string",
            morph: (s: string) => s.length
        })
        attest(t).typed as TypeNode<(In: string) => Out<number>>
    })
    test("morph list", () => {
        const t = node({
            basis: "string",
            morph: [(s: string) => s.length, (n: number) => ({ n })] as const
        })
        attest(t).typed as TypeNode<(In: string) => Out<{ n: number }>>
    })
    test("never", () => {
        const t = node()
        attest(t).typed as TypeNode<never>
    })
    test("errors on rule in wrong domain", () => {
        attest(() =>
            node({
                basis: "number",
                divisor: 5,
                // @ts-expect-error
                regex: "/.*/"
            })
        ).throws.snap(
            "Error: regex constraint may only be applied to a string (was number)"
        )
    })
    test("errors on filter literal", () => {
        attest(() =>
            node({
                basis: ["===", true],
                // @ts-expect-error
                narrow: (b: boolean) => b === true
            })
        ).throws(
            "narrow constraint may only be applied to a non-literal type (was the value true)"
        )
    })
})
