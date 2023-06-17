import { hasArkKind } from "../../../../compile/registry.js"
import type { TypeNode } from "../../../../nodes/composite/type.js"
import { typeNode } from "../../../../nodes/composite/type.js"
import type { Scope } from "../../../../scope.js"
import type { Generic, GenericProps } from "../../../../type.js"
import type { error } from "../../../../utils/errors.js"
import { throwParseError } from "../../../../utils/errors.js"
import type { join } from "../../../../utils/lists.js"
import type {
    BigintLiteral,
    NumberLiteral
} from "../../../../utils/numericLiterals.js"
import {
    tryParseWellFormedBigint,
    tryParseWellFormedNumber
} from "../../../../utils/numericLiterals.js"
import { stringify } from "../../../../utils/serialize.js"
import type { GenericInstantiationAst } from "../../../ast/ast.js"
import type { CastTo } from "../../../definition.js"
import type { ParsedArgs } from "../../../generic.js"
import {
    parseGenericArgs,
    writeInvalidGenericParametersMessage
} from "../../../generic.js"
import type { DynamicState } from "../../reduce/dynamic.js"
import type {
    AutocompletePrefix,
    state,
    StaticState
} from "../../reduce/static.js"
import type { Scanner } from "../scanner.js"

export const parseUnenclosed = (s: DynamicState) => {
    const token = s.scanner.shiftUntilNextTerminator()
    if (token === "keyof") {
        s.addPrefix("keyof")
    } else {
        s.root = unenclosedToNode(s, token)
    }
}

export type parseUnenclosed<
    s extends StaticState,
    $
> = Scanner.shiftUntilNextTerminator<
    s["unscanned"]
> extends Scanner.shiftResult<infer token, infer unscanned>
    ? token extends "keyof"
        ? state.addPrefix<s, "keyof", unscanned>
        : tryResolve<s, token, $> extends infer result
        ? result extends error<infer message>
            ? state.error<message>
            : result extends keyof $
            ? $[result] extends GenericProps
                ? parseGenericInstantiation<
                      token,
                      $[result],
                      state.scanTo<s, unscanned>,
                      $
                  >
                : state.setRoot<s, result, unscanned>
            : state.setRoot<s, result, unscanned>
        : never
    : never

export const parseGenericInstantiation = (
    name: string,
    g: Generic,
    s: DynamicState
) => {
    s.scanner.shiftUntilNonWhitespace()
    const lookahead = s.scanner.shift()
    if (lookahead !== "<") {
        return s.error(
            writeInvalidGenericParametersMessage(name, g.parameters, [])
        )
    }
    const parsedArgs = parseGenericArgs(
        name,
        g.parameters,
        s.scanner.unscanned,
        s.ctx
    )
    s.scanner.jumpToIndex(-parsedArgs.unscanned.length)
    return g(...parsedArgs.result).root
}

export type parseGenericInstantiation<
    name extends string,
    g extends GenericProps,
    s extends StaticState,
    $
    // have to skip whitespace here since TS allows instantiations like `Partial    <T>`
> = Scanner.skipWhitespace<s["unscanned"]> extends `<${infer unscanned}`
    ? parseGenericArgs<name, g["parameters"], unscanned, $> extends infer result
        ? result extends ParsedArgs<infer argAsts, infer nextUnscanned>
            ? state.setRoot<
                  s,
                  GenericInstantiationAst<g, argAsts>,
                  nextUnscanned
              >
            : // propagate error
              result
        : never
    : state.error<
          writeInvalidGenericParametersMessage<name, g["parameters"], []>
      >

const unenclosedToNode = (s: DynamicState, token: string): TypeNode =>
    maybeParseKeyword(s, token) ??
    maybeParseUnenclosedLiteral(token) ??
    s.error(
        token === ""
            ? writeMissingOperandMessage(s)
            : writeUnresolvableMessage(token)
    )

const maybeParseKeyword = (
    s: DynamicState,
    token: string
): TypeNode | undefined => {
    const resolution = s.ctx.scope.maybeResolve(token, s.ctx)
    if (hasArkKind(resolution, "node")) {
        return resolution
    } else if (hasArkKind(resolution, "generic")) {
        return parseGenericInstantiation(token, resolution, s)
    }
    return throwParseError(`Unexpected resolution ${stringify(resolution)}`)
}

const maybeParseUnenclosedLiteral = (token: string): TypeNode | undefined => {
    const maybeNumber = tryParseWellFormedNumber(token)
    if (maybeNumber !== undefined) {
        return typeNode({ basis: ["===", maybeNumber] })
    }
    const maybeBigint = tryParseWellFormedBigint(token)
    if (maybeBigint !== undefined) {
        return typeNode({ basis: ["===", maybeBigint] })
    }
}

type tryResolve<
    s extends StaticState,
    token extends string,
    $
> = token extends keyof $
    ? token
    : token extends `${infer subscope extends keyof $ &
          string}.${infer reference}`
    ? $[subscope] extends Scope
        ? reference extends keyof $[subscope]["infer"]
            ? CastTo<$[subscope]["infer"][reference]>
            : unresolvableError<s, reference, $[subscope]["infer"], [subscope]>
        : error<writeInvalidSubscopeReferenceMessage<subscope>>
    : token extends NumberLiteral
    ? token
    : token extends BigintLiteral
    ? token
    : unresolvableError<s, token, $>

export type writeInvalidSubscopeReferenceMessage<name extends string> =
    `'${name}' must reference a scope to be accessed using dot syntax`

export type unresolvableError<
    s extends StaticState,
    token extends string,
    $,
    subscopePath extends string[] = []
> = Extract<validReference<$, subscopePath>, `${token}${string}`> extends never
    ? error<writeUnresolvableMessage<token>>
    : error<`${s["scanned"]}${join<
          [
              ...subscopePath,
              Extract<validReference<$, subscopePath>, `${token}${string}`>
          ],
          "."
      >}`>

// AutocompletePrefixes like "keyof" are not accessible from a subscope
type validReference<$, subscopePath extends string[]> = subscopePath extends []
    ? keyof $ | AutocompletePrefix
    : keyof $

export const writeUnresolvableMessage = <token extends string>(
    token: token
): writeUnresolvableMessage<token> => `'${token}' is unresolvable`

type writeUnresolvableMessage<token extends string> =
    `'${token}' is unresolvable`

export const writeMissingOperandMessage = <s extends DynamicState>(s: s) => {
    const operator = s.previousOperator()
    return operator
        ? writeMissingRightOperandMessage(operator, s.scanner.unscanned)
        : writeExpressionExpectedMessage(s.scanner.unscanned)
}

export type writeMissingOperandMessage<
    s extends StaticState,
    operator extends string | undefined = state.previousOperator<s>
> = operator extends string
    ? writeMissingRightOperandMessage<operator, s["unscanned"]>
    : writeExpressionExpectedMessage<s["unscanned"]>

export type writeMissingRightOperandMessage<
    token extends string,
    unscanned extends string = ""
> = `Token '${token}' requires a right operand${unscanned extends ""
    ? ""
    : ` before '${unscanned}'`}`

export const writeMissingRightOperandMessage = <
    token extends string,
    unscanned extends string
>(
    token: token,
    unscanned = "" as unscanned
): writeMissingRightOperandMessage<token, unscanned> =>
    `Token '${token}' requires a right operand${
        unscanned ? (` before '${unscanned}'` as any) : ""
    }`

export const writeExpressionExpectedMessage = <unscanned extends string>(
    unscanned: unscanned
) => `Expected an expression${unscanned ? ` before '${unscanned}'` : ""}`

export type writeExpressionExpectedMessage<unscanned extends string> =
    `Expected an expression${unscanned extends ""
        ? ""
        : ` before '${unscanned}'`}`
