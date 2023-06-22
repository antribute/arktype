import { throwInternalError } from "../../../dev/utils/src/errors.js"
import { tryParseWellFormedInteger } from "../../../dev/utils/src/numericLiterals.js"
import type { CompilationState } from "../../compile/state.js"
import { InputParameterName } from "../../compile/state.js"
import type { NamedPropRule } from "./named.js"
import { compileNamedProp, compileNamedProps } from "./named.js"
import type { PredicateInput } from "./predicate.js"
import type { TypeInput, TypeNode } from "./type.js"
import { builtins, node } from "./type.js"

export type IndexedPropInput = {
    key: TypeInput
    value: TypeInput
}

export type IndexedPropRule = {
    key: TypeNode
    value: TypeNode
}

const arrayIndexMatcherSuffix = `(?:0|(?:[1-9]\\d*))$`

export type ArrayIndexMatcherSource =
    `${string}${typeof arrayIndexMatcherSuffix}`

const excludedIndexMatcherStart = "^(?!("
const excludedIndexMatcherEnd = ")$)"

// Build a pattern to exclude all indices from firstVariadic - 1 down to 0
const excludedIndicesSource = (firstVariadic: number) => {
    if (firstVariadic < 1) {
        return throwInternalError(
            `Unexpectedly tried to create a variadic index < 1 (was ${firstVariadic})`
        )
    }
    let excludedIndices = `${firstVariadic - 1}`
    for (let i = firstVariadic - 2; i >= 0; i--) {
        excludedIndices += `|${i}`
    }
    return `${excludedIndexMatcherStart}${excludedIndices}${excludedIndexMatcherEnd}${arrayIndexMatcherSuffix}` as const
}

export type VariadicIndexMatcherSource = ReturnType<
    typeof excludedIndicesSource
>

const nonVariadicIndexMatcherSource = `^${arrayIndexMatcherSuffix}` as const

export type NonVariadicIndexMatcherSource = typeof nonVariadicIndexMatcherSource

export const createArrayIndexMatcher = <index extends number>(
    firstVariadic: index
) =>
    (firstVariadic === 0
        ? // If the variadic pattern starts at index 0, return the base array index matcher
          nonVariadicIndexMatcherSource
        : excludedIndicesSource(firstVariadic)) as index extends 0
        ? NonVariadicIndexMatcherSource
        : VariadicIndexMatcherSource

export const extractArrayIndexRegex = (keyNode: TypeNode) => {
    if (keyNode.rule.length !== 1) {
        return
    }
    const regexNode = keyNode.rule[0].getConstraint("regex")
    if (!regexNode || regexNode.rule.length !== 1) {
        return
    }
    const source = regexNode.rule[0]
    if (!source.endsWith(arrayIndexMatcherSuffix)) {
        return
    }
    return source as ArrayIndexMatcherSource
}

export const extractFirstVariadicIndex = (source: ArrayIndexMatcherSource) => {
    if (!source.startsWith(excludedIndexMatcherStart)) {
        return 0
    }
    const excludedIndices = source.slice(
        excludedIndexMatcherStart.length,
        source.indexOf(excludedIndexMatcherEnd)
    )
    const firstExcludedIndex = excludedIndices.split("|")[0]
    return (
        tryParseWellFormedInteger(
            firstExcludedIndex,
            `Unexpectedly failed to parse a variadic index from ${source}`
        ) + 1
    )
}

export const arrayIndexInput = <index extends number = 0>(
    firstVariadicIndex: index = 0 as index
) =>
    ({
        basis: "string",
        regex: createArrayIndexMatcher(firstVariadicIndex)
    } as const satisfies PredicateInput<"string">)

export const arrayIndexTypeNode = (firstVariadicIndex = 0): TypeNode<string> =>
    firstVariadicIndex === 0
        ? builtins.nonVariadicArrayIndex()
        : node(arrayIndexInput(firstVariadicIndex))

export const compileArray = (
    indexMatcher: ArrayIndexMatcherSource,
    elementNode: TypeNode,
    namedProps: NamedPropRule[],
    s: CompilationState
) => {
    const firstVariadicIndex = extractFirstVariadicIndex(indexMatcher)
    const namedCheck = namedProps
        .map((named) => compileNamedProp(named, s))
        .join("\n")
    const i = s.getNextIndexKeyAndPush("i")
    const elementCondition = elementNode.compile(s)
    s.popKey()
    return `${namedCheck};
for(let ${i} = ${firstVariadicIndex}; ${i} < ${s.data}.length; ${i}++) {
    ${elementCondition}
}`
}

export const compileIndexed = (
    namedProps: NamedPropRule[],
    indexedProps: IndexedPropRule[],
    s: CompilationState
) => {
    const k = s.getNextIndexKeyAndPush("k")
    const indexedChecks = indexedProps
        .map((prop) =>
            prop.key === builtins.string()
                ? // if the index signature is just for "string", we don't need to check it explicitly
                  prop.value.compile(s)
                : // Ensure condition is checked on the key variable as opposed to the input
                  `if(${prop.key.condition.replaceAll(InputParameterName, k)}){
    ${prop.value.compile(s)}
}`
        )
        .join("\n")
    s.popKey()
    // TODO: don't recheck named
    return `${compileNamedProps(namedProps, s)}
    for(const ${k} in ${s.data}) {
        ${indexedChecks}
    }
`
}
