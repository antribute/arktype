import type { ProblemCode } from "./compile/problems.js"
import type { TypeNode } from "./main.js"
import { builtins } from "./nodes/composite/type.js"
import type {
    CastTo,
    inferDefinition,
    validateDefinition
} from "./parse/definition.js"
import {
    parseObject,
    writeBadDefinitionTypeMessage
} from "./parse/definition.js"
import type {
    GenericDeclaration,
    GenericParamsParseError
} from "./parse/generic.js"
import { parseGenericParams } from "./parse/generic.js"
import { parseString } from "./parse/string/string.js"
import type {
    DeclarationParser,
    DefinitionParser,
    extractIn,
    extractOut,
    Generic,
    GenericProps,
    KeyCheckKind,
    TypeConfig,
    TypeParser
} from "./type.js"
import { createTypeParser, generic, Type } from "./type.js"
import { domainOf } from "./utils/domains.js"
import { throwParseError } from "./utils/errors.js"
import type { evaluate, isAny, nominal } from "./utils/generics.js"
import { Path } from "./utils/lists.js"
import type { Dict } from "./utils/records.js"

export type ScopeParser<parent, ambient> = {
    <aliases>(aliases: validateAliases<aliases, parent & ambient>): Scope<{
        exports: inferBootstrapped<{
            exports: bootstrapExports<aliases>
            locals: bootstrapLocals<aliases> & parent
            ambient: ambient
        }>
        locals: inferBootstrapped<{
            exports: bootstrapLocals<aliases>
            locals: bootstrapExports<aliases> & parent
            ambient: ambient
        }>
        ambient: ambient
    }>
}

type validateAliases<aliases, $> = {
    [k in keyof aliases]: parseScopeKey<k> extends infer result extends ParsedScopeKey
        ? result["params"] extends []
            ? aliases[k] extends Scope | Type | GenericProps
                ? aliases[k]
                : validateDefinition<aliases[k], $ & bootstrap<aliases>>
            : result["params"] extends GenericParamsParseError
            ? // use the full nominal type here to avoid an overlap between the
              // error message and a possible value for the property
              result["params"][0]
            : validateDefinition<
                  aliases[k],
                  $ &
                      bootstrap<aliases> & {
                          [param in result["params"][number]]: unknown
                      }
              >
        : never
}

export type bindThis<$, def> = $ & { this: Def<def> }

/** nominal type for an unparsed definition used during scope bootstrapping */
type Def<def = {}> = nominal<def, "unparsed">

/** sentinel indicating a scope that will be associated with a generic has not yet been parsed */
export type UnparsedScope = "$"

type bootstrap<aliases> = bootstrapLocals<aliases> & bootstrapExports<aliases>

type bootstrapLocals<aliases> = bootstrapAliases<{
    // intersection seems redundant but it is more efficient for TS to avoid
    // mapping all the keys
    [k in keyof aliases &
        PrivateDeclaration as extractPrivateKey<k>]: aliases[k]
}>

type bootstrapExports<aliases> = bootstrapAliases<{
    [k in Exclude<keyof aliases, PrivateDeclaration>]: aliases[k]
}>

type Preparsed = Scope | GenericProps

type bootstrapAliases<aliases> = {
    [k in Exclude<
        keyof aliases,
        GenericDeclaration
    >]: aliases[k] extends Preparsed
        ? aliases[k]
        : aliases[k] extends (() => infer thunkReturn extends Preparsed)
        ? thunkReturn
        : Def<aliases[k]>
} & {
    [k in keyof aliases & GenericDeclaration as extractGenericName<k>]: Generic<
        parseGenericParams<extractGenericParameters<k>>,
        aliases[k],
        UnparsedScope
    >
}

type inferBootstrapped<r extends Resolutions> = evaluate<{
    [k in keyof r["exports"]]: r["exports"][k] extends Def<infer def>
        ? inferDefinition<def, $<r>>
        : r["exports"][k] extends GenericProps<infer params, infer def>
        ? Generic<params, def, $<r>>
        : // otherwise should be a subscope
          r["exports"][k]
}>

type extractGenericName<k> = k extends GenericDeclaration<infer name>
    ? name
    : never

type extractGenericParameters<k> = k extends GenericDeclaration<
    string,
    infer params
>
    ? params
    : never

type extractPrivateKey<k> = k extends PrivateDeclaration<infer key>
    ? key
    : never

type PrivateDeclaration<key extends string = string> = `#${key}`

export type ScopeOptions = {
    ambient?: TypeSet
    codes?: Record<ProblemCode, { mustBe?: string }>
    keys?: KeyCheckKind
}

export type resolve<reference extends keyof $, $> = [$[reference]] extends [
    never
]
    ? never
    : isAny<$[reference]> extends true
    ? any
    : $[reference] extends Def<infer def>
    ? inferDefinition<def, $>
    : $[reference]

type $<r extends Resolutions> = r["exports"] & r["locals"] & r["ambient"]

export type TypeSet<r extends Resolutions = any> = {
    [k in keyof r["exports"]]: [r["exports"][k]] extends [never]
        ? Type<never, $<r>>
        : isAny<r["exports"][k]> extends true
        ? Type<any, $<r>>
        : r["exports"][k] extends Scope<infer subresolutions>
        ? TypeSet<subresolutions>
        : r["exports"][k] extends GenericProps
        ? r["exports"][k]
        : Type<r["exports"][k], $<r>>
}

export type Resolutions = {
    exports: unknown
    locals: unknown
    ambient: unknown
}

export type ParseContext = {
    path: Path
    scope: Scope
}

export class Scope<r extends Resolutions = any> {
    declare infer: extractOut<r["exports"]>
    declare inferIn: extractIn<r["exports"]>

    config: TypeConfig

    private parseCache: Map<unknown, TypeNode> = new Map()
    private resolutions: Record<string, Type | TypeSet>
    private thisType: Type

    aliases: Record<string, unknown> = {}
    private exportedNames: (keyof r["exports"])[] = []
    private ambient: TypeSet

    constructor(input: Dict, opts: ScopeOptions) {
        for (const k in input) {
            const parsedKey = parseScopeKey(k)
            this.aliases[parsedKey.name] = parsedKey.params.length
                ? generic(parsedKey.params, input[k], this)
                : input[k]
            if (!parsedKey.isLocal) {
                this.exportedNames.push(parsedKey.name as never)
            }
        }
        this.ambient = opts.ambient ?? {}
        // TODO: fix, should work with subscope
        this.resolutions = { ...this.ambient } as never
        this.config = opts
        this.thisType = new Type(builtins.this(), this)
    }

    static root: ScopeParser<{}, {}> = (aliases) => {
        return new Scope(aliases, {}) as never
    }

    type: TypeParser<$<r>> = createTypeParser(this as never)

    declare: DeclarationParser<$<r>> = () => ({ type: this.type })

    scope: ScopeParser<r["exports"], r["ambient"]> = ((
        aliases: Dict,
        config: TypeConfig = {}
    ) => {
        return new Scope(aliases, {
            ...this.config,
            ...config,
            ambient: this.ambient
        })
    }) as never

    merge: ScopeParser<r["exports"], r["ambient"]> = ((
        aliases: Dict,
        config: TypeConfig = {}
    ) => {
        return new Scope(
            { ...this.aliases, ...aliases },
            {
                ...this.config,
                ...config,
                ambient: this.ambient
            }
        )
    }) as never

    define: DefinitionParser<$<r>> = (def) => def as never

    toAmbient(): Scope<{
        exports: r["exports"]
        locals: r["locals"]
        ambient: r["exports"]
    }> {
        return new Scope(this.aliases, {
            ...this.config,
            ambient: this.export()
        })
    }

    extract<name extends keyof r["exports"] & string>(
        name: name
    ): Type<r["exports"][name], $<r>> {
        return this.export()[name] as never
    }

    parse(def: unknown, ctx: ParseContext) {
        const cached = this.parseCache.get(def)
        if (cached) {
            // TODO: seems unsafe with `this`
            return cached
        }
        const result =
            typeof def === "string"
                ? parseString(def, ctx)
                : (typeof def === "object" && def !== null) ||
                  typeof def === "function"
                ? parseObject(def, ctx)
                : throwParseError(writeBadDefinitionTypeMessage(domainOf(def)))
        this.parseCache.set(def, result)
        return result
    }

    /** @internal */
    maybeResolve(
        name: string,
        ctx: ParseContext
    ): TypeNode | Generic | Scope | undefined {
        const cached = this.resolutions[name]
        if (cached) {
            if (cached === this.thisType) {
                if (ctx.path.length === 0) {
                    // TODO: Seen?
                    return throwParseError(
                        writeShallowCycleErrorMessage(name, [])
                    )
                }
                // TODO: doesn't seem right for cyclic? only recursive?
                return cached.root
            }
            // TODO: when is this cache safe? could contain this reference?
            return cached.root as never
        }
        const aliasDef = this.aliases[name]
        if (!aliasDef) {
            return
        }
        this.resolutions[name] = this.thisType
        const resolution = this.parseRoot(aliasDef)
        this.resolutions[name] = new Type(resolution, this)
        return resolution
    }

    parseRoot(def: unknown) {
        return this.parse(def, {
            path: new Path(),
            scope: this
        })
    }

    /** @internal */
    parseTypeRoot(def: unknown) {
        this.resolutions["this"] = this.thisType
        const result = this.parseRoot(def)
        delete this.resolutions["this"]
        return result
    }

    import<names extends (keyof r["exports"])[]>(
        ...names: names
    ): destructuredImportContext<
        r,
        names extends [] ? keyof r["exports"] : names[number]
    > {
        return Object.fromEntries(
            Object.entries(this.export(...names)).map(([name, resolution]) => [
                `#${name}`,
                resolution
            ])
        ) as never
    }

    private exported = false
    export<names extends (keyof r["exports"])[]>(
        ...names: names
    ): TypeSet<
        names extends [] ? r : destructuredExportContext<r, names[number]>
    > {
        if (!this.exported) {
            const ctx: ParseContext = {
                path: new Path(),
                scope: this
            }
            for (const name of this.exportedNames) {
                this.maybeResolve(name as never, ctx)
            }
            this.exported = true
        }
        const namesToExport = names.length ? names : this.exportedNames
        return Object.fromEntries(
            namesToExport.map((name) => [
                name,
                this.resolutions[name as string]
            ])
        ) as never
    }
}

type destructuredExportContext<
    r extends Resolutions,
    name extends keyof r["exports"]
> = {
    exports: { [k in name]: r["exports"][k] }
    locals: r["locals"] & {
        [k in Exclude<keyof r["exports"], name>]: r["exports"][k]
    }
    ambient: r["ambient"]
}

type destructuredImportContext<
    r extends Resolutions,
    name extends keyof r["exports"]
> = {
    [k in name as `#${k & string}`]: CastTo<r["exports"][k]>
}

export const writeShallowCycleErrorMessage = (name: string, seen: string[]) =>
    `Alias '${name}' has a shallow resolution cycle: ${[...seen, name].join(
        ":"
    )}`

export const writeDuplicateAliasesMessage = <name extends string>(
    name: name
): writeDuplicateAliasesMessage<name> => `Alias '${name}' is already defined`

type writeDuplicateAliasesMessage<name extends string> =
    `Alias '${name}' is already defined`

export type ParsedScopeKey = {
    isLocal: boolean
    name: string
    params: string[]
}

export const parseScopeKey = (k: string): ParsedScopeKey => {
    const isLocal = k[0] === "#"
    const name = isLocal ? k.slice(1) : k
    const firstParamIndex = k.indexOf("<")
    if (firstParamIndex === -1) {
        return {
            isLocal,
            name,
            params: []
        }
    }
    if (k.at(-1) !== ">") {
        throwParseError(
            `'>' must be the last character of a generic declaration in a scope.`
        )
    }
    return {
        isLocal,
        name: name.slice(firstParamIndex),
        params: parseGenericParams(k.slice(firstParamIndex + 1, -1))
    }
}

type parseScopeKey<k> = k extends PrivateDeclaration<infer inner>
    ? parsePossibleGenericDeclaration<inner, true>
    : parsePossibleGenericDeclaration<k, false>

type parsePossibleGenericDeclaration<
    k,
    isLocal extends boolean
> = k extends GenericDeclaration<infer name, infer paramString>
    ? {
          isLocal: isLocal
          name: name
          params: parseGenericParams<paramString>
      }
    : {
          isLocal: isLocal
          name: k
          params: []
      }
