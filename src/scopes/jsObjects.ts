import { node } from "../nodes/composite/type.js"
import { Scope } from "../scope.js"

export const jsObjects = Scope.root({
    Function: node({ basis: Function }),
    Date: node({ basis: Date }),
    Error: node({ basis: Error }),
    Map: node({ basis: Map }),
    RegExp: node({ basis: RegExp }),
    Set: node({ basis: Set }),
    WeakMap: node({ basis: WeakMap }),
    WeakSet: node({ basis: WeakSet }),
    Promise: node({ basis: Promise })
})

export const jsObjectTypes = jsObjects.export()
