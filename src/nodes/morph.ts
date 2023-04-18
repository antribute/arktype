import type { Morph } from "../parse/ast/morph.js"
import { intersectUniqueLists } from "../utils/generics.js"
import type { CompilationState } from "./node.js"
import { Node } from "./node.js"

export class MorphNode extends Node<typeof MorphNode> {
    constructor(transforms: Morph | Morph[]) {
        super(
            MorphNode,
            typeof transforms === "function" ? [transforms] : transforms
        )
    }

    static compileChildren(transforms: Morph[], s: CompilationState) {
        return [
            {
                condition: "true",
                problem: s.problem("custom", "valid")
            }
        ]
    }

    intersect(other: MorphNode) {
        return new MorphNode(intersectUniqueLists(this.child, other.child))
    }
}
