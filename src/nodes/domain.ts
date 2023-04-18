import type { Domain } from "../utils/domains.js"
import type { ComparisonState, CompilationState } from "./node.js"
import { Node } from "./node.js"

export type NonEnumerableDomain = Exclude<
    Domain,
    "undefined" | "null" | "boolean"
>

export class DomainNode<
    domain extends NonEnumerableDomain = NonEnumerableDomain
> extends Node<typeof DomainNode> {
    constructor(domain: domain) {
        super(DomainNode, domain)
    }

    intersect(other: DomainNode, s: ComparisonState) {
        return this.child === other.child
            ? this
            : s.addDisjoint("domain", this, other)
    }

    static compileChildren(domain: NonEnumerableDomain, s: CompilationState) {
        return [
            {
                condition:
                    domain === "object"
                        ? `((typeof ${s.data} !== "object" || ${s.data} === null) && typeof ${s.data} !== "function")`
                        : `typeof ${s.data} !== "${domain}"`,
                problem: s.problem("domain", domain)
            }
        ]
    }
}
