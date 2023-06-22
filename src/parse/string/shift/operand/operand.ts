import type { DynamicState } from "../../reduce/dynamic.js"
import type { state, StaticState } from "../../reduce/static.js"
import type { BaseCompletions } from "../../string.js"
import { Scanner } from "../scanner.js"
import type {
    EndEnclosingChar,
    QuoteEnclosingChar,
    StartEnclosingChar
} from "./enclosed.js"
import { enclosingChar, parseEnclosed } from "./enclosed.js"
import { parseUnenclosed, writeMissingOperandMessage } from "./unenclosed.js"

export const parseOperand = (s: DynamicState): void =>
    s.scanner.lookahead === ""
        ? s.error(writeMissingOperandMessage(s))
        : s.scanner.lookahead === "("
        ? s.shiftedByOne().reduceGroupOpen()
        : s.scanner.lookaheadIsIn(enclosingChar)
        ? parseEnclosed(s, s.scanner.shift())
        : s.scanner.lookaheadIsIn(Scanner.whiteSpaceTokens)
        ? parseOperand(s.shiftedByOne())
        : s.scanner.lookahead === "d"
        ? s.shiftedByOne().scanner.lookaheadIsIn(enclosingChar)
            ? parseEnclosed(s, `d${s.scanner.shift()}` as StartEnclosingChar)
            : parseUnenclosed(s)
        : parseUnenclosed(s)

export type parseOperand<
    s extends StaticState,
    $,
    args
> = s["unscanned"] extends Scanner.shift<infer lookahead, infer unscanned>
    ? lookahead extends "("
        ? state.reduceGroupOpen<s, unscanned>
        : lookahead extends EndEnclosingChar
        ? parseEnclosed<s, lookahead, unscanned>
        : lookahead extends Scanner.WhiteSpaceToken
        ? parseOperand<state.scanTo<s, unscanned>, $, args>
        : lookahead extends "d"
        ? unscanned extends Scanner.shift<
              infer enclosing extends QuoteEnclosingChar,
              infer nextUnscanned
          >
            ? parseEnclosed<s, `d${enclosing}`, nextUnscanned>
            : parseUnenclosed<s, $, args>
        : parseUnenclosed<s, $, args>
    : state.error<`${s["scanned"]}${BaseCompletions<$, args>}`>
