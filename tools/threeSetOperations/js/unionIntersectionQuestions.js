var singleVariableQuestions = [
    { op: 'A', back: 0, A: 1, B: 0, C: 0, AuB: 1, AuC: 1, BuC: 0, AuBuC: 1 },
    { op: 'B', back: 0, A: 0, B: 1, C: 0, AuB: 1, AuC: 0, BuC: 1, AuBuC: 1 },
    { op: 'C', back: 0, A: 0, B: 0, C: 1, AuB: 0, AuC: 1, BuC: 1, AuBuC: 1 }
];

var twoVariableUnionQuestions = [
    { op: 'A &cup; B', back: 0, A: 1, B: 1, C: 0, AuB: 1, AuC: 1, BuC: 1, AuBuC: 1 },
    { op: 'A &cup; C', back: 0, A: 1, B: 0, C: 1, AuB: 1, AuC: 1, BuC: 1, AuBuC: 1 },
    { op: 'B &cup; A', back: 0, A: 1, B: 1, C: 0, AuB: 1, AuC: 1, BuC: 1, AuBuC: 1 },
    { op: 'B &cup; C', back: 0, A: 0, B: 1, C: 1, AuB: 1, AuC: 1, BuC: 1, AuBuC: 1 },
    { op: 'C &cup; A', back: 0, A: 1, B: 0, C: 1, AuB: 1, AuC: 1, BuC: 1, AuBuC: 1 },
    { op: 'C &cup; B', back: 0, A: 0, B: 1, C: 1, AuB: 1, AuC: 1, BuC: 1, AuBuC: 1 }
];

var twoVariableIntersectionQuestions = [
    { op: 'A &cap; B', back: 0, A: 0, B: 0, C: 0, AuB: 1, AuC: 0, BuC: 0, AuBuC: 1 },
    { op: 'A &cap; C', back: 0, A: 0, B: 0, C: 0, AuB: 0, AuC: 1, BuC: 0, AuBuC: 1 },
    { op: 'B &cap; A', back: 0, A: 0, B: 0, C: 0, AuB: 1, AuC: 0, BuC: 0, AuBuC: 1 },
    { op: 'B &cap; C', back: 0, A: 0, B: 0, C: 0, AuB: 0, AuC: 0, BuC: 1, AuBuC: 1 },
    { op: 'C &cap; A', back: 0, A: 0, B: 0, C: 0, AuB: 0, AuC: 1, BuC: 0, AuBuC: 1 },
    { op: 'C &cap; B', back: 0, A: 0, B: 0, C: 0, AuB: 0, AuC: 0, BuC: 1, AuBuC: 1 }
];

var threeVariableQuestionsOneOperator = [
    { op: '(A &cup; B) &cup; C', back: 0, A: 1, B: 1, C: 1, AuB: 1, AuC: 1, BuC: 1, AuBuC: 1 },
    { op: '(A &cup; C) &cup; B', back: 0, A: 1, B: 1, C: 1, AuB: 1, AuC: 1, BuC: 1, AuBuC: 1 },
    { op: '(B &cup; A) &cup; C', back: 0, A: 1, B: 1, C: 1, AuB: 1, AuC: 1, BuC: 1, AuBuC: 1 },
    { op: '(B &cup; C) &cup; A', back: 0, A: 1, B: 1, C: 1, AuB: 1, AuC: 1, BuC: 1, AuBuC: 1 },
    { op: '(C &cup; A) &cup; B', back: 0, A: 1, B: 1, C: 1, AuB: 1, AuC: 1, BuC: 1, AuBuC: 1 },
    { op: '(C &cup; B) &cup; A', back: 0, A: 1, B: 1, C: 1, AuB: 1, AuC: 1, BuC: 1, AuBuC: 1 },

    { op: '(A &cap; B) &cap; C', back: 0, A: 0, B: 0, C: 0, AuB: 0, AuC: 0, BuC: 0, AuBuC: 1 },
    { op: '(A &cap; C) &cap; B', back: 0, A: 0, B: 0, C: 0, AuB: 0, AuC: 0, BuC: 0, AuBuC: 1 },
    { op: '(B &cap; A) &cap; C', back: 0, A: 0, B: 0, C: 0, AuB: 0, AuC: 0, BuC: 0, AuBuC: 1 },
    { op: '(B &cap; C) &cap; A', back: 0, A: 0, B: 0, C: 0, AuB: 0, AuC: 0, BuC: 0, AuBuC: 1 },
    { op: '(C &cap; A) &cap; B', back: 0, A: 0, B: 0, C: 0, AuB: 0, AuC: 0, BuC: 0, AuBuC: 1 },
    { op: '(C &cap; B) &cap; A', back: 0, A: 0, B: 0, C: 0, AuB: 0, AuC: 0, BuC: 0, AuBuC: 1 }
];

var threeVariableQuestionsTwoOperators = [
    { op: '(A &cup; B) &cap; C', back: 0, A: 0, B: 0, C: 0, AuB: 0, AuC: 1, BuC: 1, AuBuC: 1 },
    { op: '(A &cup; C) &cap; B', back: 0, A: 0, B: 0, C: 0, AuB: 1, AuC: 0, BuC: 1, AuBuC: 1 },
    { op: '(B &cup; A) &cap; C', back: 0, A: 0, B: 0, C: 0, AuB: 0, AuC: 1, BuC: 1, AuBuC: 1 },
    { op: '(B &cup; C) &cap; A', back: 0, A: 0, B: 0, C: 0, AuB: 1, AuC: 1, BuC: 0, AuBuC: 1 },
    { op: '(C &cup; A) &cap; B', back: 0, A: 0, B: 0, C: 0, AuB: 1, AuC: 0, BuC: 1, AuBuC: 1 },
    { op: '(C &cup; B) &cap; A', back: 0, A: 0, B: 0, C: 0, AuB: 1, AuC: 1, BuC: 0, AuBuC: 1 },

    { op: '(A &cap; B) &cup; C', back: 0, A: 0, B: 0, C: 1, AuB: 1, AuC: 1, BuC: 1, AuBuC: 1 },
    { op: '(A &cap; C) &cup; B', back: 0, A: 0, B: 1, C: 0, AuB: 1, AuC: 1, BuC: 1, AuBuC: 1 },
    { op: '(B &cap; A) &cup; C', back: 0, A: 0, B: 0, C: 1, AuB: 1, AuC: 1, BuC: 1, AuBuC: 1 },
    { op: '(B &cap; C) &cup; A', back: 0, A: 1, B: 0, C: 0, AuB: 1, AuC: 1, BuC: 1, AuBuC: 1 },
    { op: '(C &cap; A) &cup; B', back: 0, A: 0, B: 1, C: 0, AuB: 1, AuC: 1, BuC: 1, AuBuC: 1 },
    { op: '(C &cap; B) &cup; A', back: 0, A: 1, B: 0, C: 0, AuB: 1, AuC: 1, BuC: 1, AuBuC: 1 }
];

var unionIntersectionsQuestions = [
    singleVariableQuestions,
    twoVariableUnionQuestions,
    twoVariableIntersectionQuestions,
    threeVariableQuestionsOneOperator,
    threeVariableQuestionsTwoOperators
];
