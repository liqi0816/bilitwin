/* 
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 * 
 * @author qli5 <goodlq11[at](163|gmail).com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*========== native function ==========*/

const tuple = <T extends any[]>(...values: T) => values;
const float = (value: any) => +value;
const int = (value: any) => value | 0;
const str = (value: any) => '' + value;
const bool = (value: any) => !!value;

export { tuple, float, int, str, bool }
export default { tuple, float, int, str, bool }

/*========== macro ==========*/

if (typeof module === 'object') {
    const { createMacro } = module.require('babel-plugin-macros');
    module.exports = createMacro(({ references: { tuple, float, int, str, bool }, babel: { types: t } }: any) => {
        if (tuple) {
            for (const { parentPath, parent } of tuple) {
                parentPath.replaceWith(t.inherits(
                    t.arrayExpression(parent.arguments),
                    parent
                ));
            }
        }
        if (float) {
            for (const { parentPath, parent } of float) {
                if (parent.arguments.length !== 1) {
                    throw new SyntaxError(`(macro)float: expecting exactly 1 parameter but received ${parent.arguments.length} (at ${parent.loc.start.line}:${parent.loc.start.column} - ${parent.loc.end.line}:${parent.loc.end.column})`)
                }
                parentPath.replaceWith(t.inherits(
                    t.unaryExpression('+', parent.arguments[0]),
                    parent
                ));
            }
        }
        if (int) {
            for (const { parentPath, parent } of int) {
                if (parent.arguments.length !== 1) {
                    throw new SyntaxError(`(macro)int: expecting exactly 1 parameter but received ${parent.arguments.length} (at ${parent.loc.start.line}:${parent.loc.start.column} - ${parent.loc.end.line}:${parent.loc.end.column})`)
                }
                parentPath.replaceWith(t.inherits(
                    t.binaryExpression('|', parent.arguments[0], t.numericLiteral(0)),
                    parent
                ));
            }
        }
        if (str) {
            for (const { parentPath, parent } of str) {
                if (parent.arguments.length !== 1) {
                    throw new SyntaxError(`(macro)str: expecting exactly 1 parameter but received ${parent.arguments.length} (at ${parent.loc.start.line}:${parent.loc.start.column} - ${parent.loc.end.line}:${parent.loc.end.column})`)
                }
                parentPath.replaceWith(t.inherits(
                    t.binaryExpression('+', t.stringLiteral(''), parent.arguments[0]),
                    parent
                ));
            }
        }
        if (bool) {
            for (const { parentPath, parent } of bool) {
                if (parent.arguments.length !== 1) {
                    throw new SyntaxError(`(macro)bool: expecting exactly 1 parameter but received ${parent.arguments.length} (at ${parent.loc.start.line}:${parent.loc.start.column} - ${parent.loc.end.line}:${parent.loc.end.column})`)
                }
                parentPath.replaceWith(t.inherits(
                    t.unaryExpression('!', t.unaryExpression('!', parent.arguments[0])),
                    parent
                ));
            }
        }
    });
}
