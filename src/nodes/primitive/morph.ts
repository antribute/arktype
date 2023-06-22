import type { listable } from "../../../dev/utils/src/lists.js"
import { intersectUniqueLists, listFrom } from "../../../dev/utils/src/lists.js"
import type { Morph } from "../../parse/tuple.js"
import type { BaseNode } from "../node.js"
import { defineNodeKind } from "../node.js"

export interface MorphNode extends BaseNode<readonly Morph[]> {}

export const morphNode = defineNodeKind<MorphNode, listable<Morph>>(
    {
        kind: "morph",
        // Avoid alphabetical sorting since morphs are non-commutative,
        // i.e. a=>b and b=>a are distinct and valid
        parse: listFrom,
        compile: () => "",
        // rule.map((morph) => registry().register(morph.name, morph)),
        intersect: (l, r): MorphNode =>
            morphNode(intersectUniqueLists(l.rule, r.rule))
    },
    (base) => ({
        description: `morphed by ${base.rule
            .map((morph) => morph.name)
            .join("=>")}`
    })
)
