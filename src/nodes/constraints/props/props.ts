import { fromEntries, hasKeys } from "../../../utils/records.js"
import type { DisjointsSources } from "../../disjoint.js"
import { Disjoint } from "../../disjoint.js"
import type { Node } from "../../node.js"
import { defineNodeKind } from "../../node.js"
import { neverTypeNode } from "../../type.js"
import type { IndexedPropInput, IndexedPropRule } from "./indexed.js"
import {
    compileNamedAndIndexedProps,
    extractArrayIndexRegex
} from "./indexed.js"
import type { NamedPropInput, NamedPropRule } from "./named.js"
import { compileNamedProps, intersectNamedProp } from "./named.js"

export type PropRule = NamedPropRule | IndexedPropRule

export type PropsNode = Node<{
    kind: "props"
    rule: PropRule[]
    named: NamedPropRule[]
    indexed: IndexedPropRule[]
    byName: Record<string, NamedPropRule>
}>

export const PropsNode = defineNodeKind<PropsNode>({
    kind: "props",
    compile: (rule: PropRule[]) => {
        rule.sort((l, r) => {
            // Sort keys first by precedence (prerequisite,required,optional,indexed),
            // then alphebetically by key
            const lPrecedence = kindPrecedence(l)
            const rPrecedence = kindPrecedence(r)
            return lPrecedence > rPrecedence
                ? 1
                : lPrecedence < rPrecedence
                ? -1
                : l.key.toString() > r.key.toString()
                ? 1
                : -1
        })
        const named = rule.filter(isNamed)
        if (named.length === rule.length) {
            return compileNamedProps(named)
        }
        const indexed = rule.filter(isIndexed)
        return compileNamedAndIndexedProps(named, indexed)
    },
    construct: (base) => {
        const named = base.rule.filter(isNamed)
        return Object.assign(base, {
            named,
            byName: Object.fromEntries(
                named.map((prop) => [prop.key, prop] as const)
            ),
            indexed: base.rule.filter(isIndexed)
        })
    },
    intersect: (l, r): PropsNode | Disjoint => {
        let indexed = [...l.indexed]
        for (const { key, value } of r.indexed) {
            const matchingIndex = indexed.findIndex(
                (entry) => entry.key === key
            )
            if (matchingIndex === -1) {
                indexed.push({ key, value })
            } else {
                const result = indexed[matchingIndex].value.intersect(value)
                indexed[matchingIndex].value =
                    result instanceof Disjoint ? neverTypeNode : result
            }
        }
        const byName = { ...l.byName, ...r.byName }
        const named: PropRule[] = []
        const disjointsByPath: DisjointsSources = {}
        for (const k in byName) {
            // TODO: not all discriminatable- if one optional and one required, even if disjoint
            let intersectedValue: NamedPropRule | Disjoint = byName[k]
            if (k in l.byName) {
                if (k in r.byName) {
                    // We assume l and r were properly created and the named
                    // props from each PropsNode have already been intersected
                    // with any matching index props. Therefore, the
                    // intersection result will already include index values
                    // from both sides whose key types allow k.
                    intersectedValue = intersectNamedProp(
                        l.byName[k],
                        r.byName[k]
                    )
                } else {
                    // If a named key from l matches any index keys of r, intersect
                    // the value associated with the name with the index value.
                    for (const { key, value } of r.indexed) {
                        if (key.allows(k)) {
                            intersectedValue = intersectNamedProp(l.byName[k], {
                                key: k,
                                prerequisite: false,
                                optional: true,
                                value
                            })
                        }
                    }
                }
            } else {
                // If a named key from r matches any index keys of l, intersect
                // the value associated with the name with the index value.
                for (const { key, value } of l.indexed) {
                    if (key.allows(k)) {
                        intersectedValue = intersectNamedProp(r.byName[k], {
                            key: k,
                            prerequisite: false,
                            optional: true,
                            value
                        })
                    }
                }
            }
            if (intersectedValue instanceof Disjoint) {
                Object.assign(
                    disjointsByPath,
                    intersectedValue.withPrefixKey(k).sources
                )
            } else {
                named.push(intersectedValue)
            }
        }
        if (hasKeys(disjointsByPath)) {
            return new Disjoint(disjointsByPath)
        }
        if (
            named.some(
                (prop) =>
                    isNamed(prop) && prop.key === "length" && prop.prerequisite
            )
        ) {
            // if the index key is from and unbounded array and we have a tuple length,
            // it has already been intersected and should be removed
            indexed = indexed.filter(
                (entry) => !extractArrayIndexRegex(entry.key)
            )
        }
        return PropsNode([...named, ...indexed])
    },
    describe: (node) => {
        const entries = node.named.map((prop): [string, string] => {
            return [
                `${prop.key}${prop.optional ? "?" : ""}`,
                prop.value.toString()
            ]
        })
        for (const entry of node.indexed) {
            entries.push([`[${entry.key}]`, entry.value.toString()])
        }
        return JSON.stringify(fromEntries(entries))
    }
})

// static from(
//     namedInput: NamedPropsInput,
//     ...indexedInput: IndexedPropInput[]
// ) {
//     const props: PropRule[] = []
//     for (const k in namedInput) {
//         props.push({
//             key: k,
//             prerequisite: namedInput[k].prerequisite ?? false,
//             optional: namedInput[k].optional ?? false,
//             value: typeNodeFromInput(namedInput[k].value)
//         })
//     }
//     for (const prop of indexedInput) {
//         props.push({
//             key: typeNodeFromInput(prop.key) as TypeNode<string>,
//             value: typeNodeFromInput(prop.value)
//         })
//     }
//     return new PropsNode(props)
// }

// compileTraverse(s: CompilationState) {
//     return this.named
//         .map((prop) =>
//             prop.value
//                 .compileTraverse(s)
//                 .replaceAll(In, `${In}${compilePropAccess(prop.key)}`)
//         )
//         .join("\n")
// }

// pruneDiscriminant(path: string[], kind: DiscriminantKind): PropsNode {
//     const [key, ...nextPath] = path
//     const indexToPrune = this.named.findIndex((prop) => prop.key === key)
//     if (indexToPrune === -1) {
//         return throwInternalError(`Unexpectedly failed to prune key ${key}`)
//     }
//     const prunedValue = this.named[indexToPrune].value.pruneDiscriminant(
//         nextPath,
//         kind
//     )
//     const prunedProps: PropRule[] = [...this.named]
//     if (prunedValue === unknownTypeNode) {
//         prunedProps.splice(indexToPrune, 1)
//     } else {
//         prunedProps[indexToPrune] = {
//             ...prunedProps[indexToPrune],
//             value: prunedValue
//         }
//     }
//     prunedProps.push(...this.indexed)
//     return new PropsNode(prunedProps)
// }

// keyof() {
//     return this.namedKeyOf().or(this.indexedKeyOf())
// }

// indexedKeyOf() {
//     return new TypeNode(
//         this.indexed.flatMap((entry) => entry.key.rule)
//     ) as TypeNode<PropertyKey>
// }

// namedKeyOf() {
//     return TypeNode.exactly(
//         ...this.namedKeyLiterals()
//     ) as TypeNode<PropertyKey>
// }

// namedKeyLiterals() {
//     return this.named.map((prop) => prop.key)
// }

const isIndexed = (rule: PropRule): rule is IndexedPropRule =>
    typeof rule.key === "object"

const isNamed = (rule: PropRule): rule is NamedPropRule =>
    typeof rule.key === "string"

const kindPrecedence = (rule: PropRule) =>
    isIndexed(rule) ? 2 : rule.prerequisite ? -1 : rule.optional ? 1 : 0

export const emptyPropsNode = PropsNode([])

export type PropsInput = NamedPropsInput | PropsInputTuple

export type PropsInputTuple<
    named extends NamedPropsInput = NamedPropsInput,
    indexed extends IndexedPropInput[] = IndexedPropInput[]
> = readonly [named: named, ...indexed: indexed]

export type NamedPropsInput = Record<string, NamedPropInput>
