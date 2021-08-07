'use strict';

/* global MathSymbol */

/* exported buildOperatorPrototype */

/**
    Operator stores children MathSymbols.
    @class Operator
    @extends MathSymbol
    @constructor
    @param {String} name The name of the operator.
    @param {Array} children Array of {MathSymbol}. Children symbols to this operator.
*/
function Operator(name, children) {
    this.children = children;

    MathSymbol.prototype.constructor.call(this, name);
}

/**
    Build the prototype for Operator.
    @method buildOperatorPrototype
    @return {void}
*/
function buildOperatorPrototype() {
    Operator.prototype = new MathSymbol();
    Operator.prototype.constructor = Operator;

    /**
        Generate a children length error. Ex: NOT operator has 2 children. Expected: 1
        @method generateChildrenLengthError
        @param {Number} expectedLength The expected number of children for this operator.
        @return {void}
    */
    Operator.prototype.generateChildrenLengthError = function(expectedLength) {
        const pluralChildren = this.children.length === 1 ? '' : 'ren';

        throw new Error(`${this.name} operator has ${this.children.length} child${pluralChildren}. Expected: ${expectedLength}`);
    };

    /**
        Mark the operator and operator's children.
        @method addMarkRecursive
        @param {String} mark The id to mark the symbol with.
        @return {void}
    */
    Operator.prototype.addMarkRecursive = function(mark) {
        this.addMark(mark);
        this.children.forEach(child => child.addMarkRecursive(mark));
    };

    /**
        Remove the mark by setting markId to 0. Same for operator's children.
        @method removeMarkRecursive
        @param {String} mark The mark to remove.
        @return {void}
    */
    Operator.prototype.removeMarkRecursive = function(mark) {
        this.removeMark(mark);
        this.children.forEach(child => child.removeMarkRecursive(mark));
    };

    /**
        Remove all marks.
        @method removeAllMarks
        @return {void}
    */
    Operator.prototype.removeAllMarks = function() {
        MathSymbol.prototype.removeAllMarks.call(this);
        this.children.forEach(child => child.removeAllMarks());
    };

    /**
        Return whether the symbol has a specific mark or is unmarked.
        @method hasSpecificMarkOrIsUnmarked
        @param {String} mark The specific allowed mark.
        @return {Boolean} Whether the symbol is marked.
    */
    Operator.prototype.hasSpecificMarkOrIsUnmarked = function(mark) {
        return (MathSymbol.prototype.hasSpecificMarkOrIsUnmarked.call(this, mark) && this.descendantHasSpecificMarkOrIsUnmarked(mark));
    };

    /**
        Return whether the symbol's descendant has a specific mark or is unmarked.
        @method descendantHasSpecificMarkOrIsUnmarked
        @param {String} mark The specific allowed mark.
        @return {Boolean} Whether the symbol is marked.
    */
    Operator.prototype.descendantHasSpecificMarkOrIsUnmarked = function(mark) {
        return this.children.every(child => child.hasSpecificMarkOrIsUnmarked(mark));
    };

    /**
        Return the root of the already marked symbols.
        @method findRootOfMark
        @param {String} mark The mark to find.
        @return {MathSymbol} The root of the marked symbols.
    */
    Operator.prototype.findRootOfMark = function(mark) {
        let rootOfMark = MathSymbol.prototype.findRootOfMark.call(this, mark);
        const rootOfMarkExists = Boolean(rootOfMark);

        if (!rootOfMarkExists) {
            const markedDescendants = this.children.map(child => child.findRootOfMark(mark)).filter(child => child !== null);

            if (markedDescendants.length > 0) {
                rootOfMark = markedDescendants[0];
            }
        }
        return rootOfMark;
    };

    /**
        Return the common ancestor of s1 and s2.
        @method findCommonAncestor
        @param {MathSymbol} s1 One symbol to find.
        @param {MathSymbol} s2 Other symbol to find.
        @return {MathSymbol} The common ancestor of s1 and s2.
    */
    Operator.prototype.findCommonAncestor = function(s1, s2) {
        const s1Ancestors = this.findAncestors(s1);
        const s2Ancestors = this.findAncestors(s2);
        const minAncestorsLength = Math.min(s1Ancestors.length, s2Ancestors.length);
        let index = 0;

        // The common ancestor is just before the first different ancestor.
        while (index < minAncestorsLength) {
            if (!s1Ancestors[index].is(s2Ancestors[index])) {
                break;
            }
            ++index;
        }
        return s1Ancestors[index - 1];
    };

    /**
        Find the ancestors of the given symbol with root as index 0.
        @method findAncestors
        @param {MathSymbol} symbol The symbol's ancestors to find.
        @return {Array} Array of {MathSymbol}. List of ancestors of given symbol.
    */
    Operator.prototype.findAncestors = function(symbol) {
        let ancestors = MathSymbol.prototype.findAncestors.call(this, symbol);

        if (ancestors.length === 0) {
            const childrenAncestors = this.children.map(child => child.findAncestors(symbol)).filter(child => child.length > 0);

            if (childrenAncestors.length > 0) {
                ancestors.push(this);
                ancestors = ancestors.concat(childrenAncestors[0]);
            }
        }
        return ancestors;
    };

    /**
        Find all operator paths from root to leaves.
        @method findOperatorPaths
        @return {Array} Array of {Array} of {Operator}. List of each operator path through the tree.
    */
    Operator.prototype.findOperatorPaths = function() {
        const paths = [];

        this.children.forEach(child => {
            const childPaths = child.findOperatorPaths();
            const childPathsExist = Boolean(childPaths);

            // Add |this| to the front of each child path.
            if (childPathsExist) {
                childPaths.forEach(childPath => paths.push([ this ].concat(childPath)));
            }
        });

        // The children are all leaves, so this operator is the only in the path.
        if (paths.length === 0) {
            paths.push([ this ]);
        }

        return paths;
    };

    /**
        Clone this symbol.
        @method clone
        @return {Operator} A clone of this symbol.
    */
    Operator.prototype.clone = function() {
        const newChildren = this.children.map(child => child.clone());

        return MathSymbol.prototype.clone.call(this, new Operator(this.name, newChildren));
    };

    /**
        Return whether this symbol is an operator.
        @method isOperator
        @return {Boolean} Whether this symbol is an {Operator}.
    */
    Operator.prototype.isOperator = function() {
        return true;
    };
}
