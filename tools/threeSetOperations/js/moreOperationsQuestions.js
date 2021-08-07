var moreOperationsDifferences = [
    { op: '(A - B) - C', back: 0, A: 1, B: 0, C: 0, AuB: 0, AuC: 0, BuC: 0, AuBuC: 0 },
    { op: '(A - C) - B', back: 0, A: 1, B: 0, C: 0, AuB: 0, AuC: 0, BuC: 0, AuBuC: 0 },
    { op: '(B - A) - C', back: 0, A: 0, B: 1, C: 0, AuB: 0, AuC: 0, BuC: 0, AuBuC: 0 },
    { op: '(B - C) - A', back: 0, A: 0, B: 1, C: 0, AuB: 0, AuC: 0, BuC: 0, AuBuC: 0 },
    { op: '(C - B) - A', back: 0, A: 0, B: 0, C: 1, AuB: 0, AuC: 0, BuC: 0, AuBuC: 0 },
    { op: '(C - A) - B', back: 0, A: 0, B: 0, C: 1, AuB: 0, AuC: 0, BuC: 0, AuBuC: 0 }
];

var moreOperationsSymmetricDifferences = [
    { op: '(A &oplus; B) &oplus; C', back: 0, A: 1, B: 1, C: 1, AuB: 0, AuC: 0, BuC: 0, AuBuC: 1 },
    { op: '(B &oplus; A) &oplus; C', back: 0, A: 1, B: 1, C: 1, AuB: 0, AuC: 0, BuC: 0, AuBuC: 1 },
    { op: '(C &oplus; A) &oplus; B', back: 0, A: 1, B: 1, C: 1, AuB: 0, AuC: 0, BuC: 0, AuBuC: 1 }
];

var moreOperationsComplement = [
    { op: '<span style=\'text-decoration: overline\'>(A - B) - C</span>', back: 1, A: 0, B: 1, C: 1, AuB: 1, AuC: 1, BuC: 1, AuBuC: 1 },
    { op: '<span style=\'text-decoration: overline\'>(A &cup; B) &cup; C</span>', back: 1, A: 0, B: 0, C: 0, AuB: 0, AuC: 0, BuC: 0, AuBuC: 0 },
    { op: '<span style=\'text-decoration: overline\'>(A &cap; B) &cap; C</span>', back: 1, A: 1, B: 1, C: 1, AuB: 1, AuC: 1, BuC: 1, AuBuC: 0 },
    { op: '<span style=\'text-decoration: overline\'>(A &oplus; B) &oplus; C</span>', back: 1, A: 0, B: 0, C: 0, AuB: 1, AuC: 1, BuC: 1, AuBuC: 0 }
];

var moreOperationsTwoOperators = [
    { op: '(A &oplus; B) &cup; C', back: 0, A: 1, B: 1, C: 1, AuB: 0, AuC: 1, BuC: 1, AuBuC: 1 },
    { op: '(A - B) &cup; C', back: 0, A: 1, B: 0, C: 1, AuB: 0, AuC: 1, BuC: 1, AuBuC: 1 },
    { op: '(A &oplus; B) - C', back: 0, A: 1, B: 1, C: 0, AuB: 0, AuC: 0, BuC: 0, AuBuC: 0 },
    { op: '(A - B) &oplus; C', back: 0, A: 1, B: 0, C: 1, AuB: 0, AuC: 0, BuC: 1, AuBuC: 1 },
];

var moreOperationsThreeOperators = [
    { op: '(<span style=\'text-decoration: overline\'>A</span> - B) - C', back: 1, A: 0, B: 0, C: 0, AuB: 0, AuC: 0, BuC: 0, AuBuC: 0 },
    { op: '(<span style=\'text-decoration: overline\'>A</span> - B) &oplus; C', back: 1, A: 0, B: 0, C: 0, AuB: 0, AuC: 1, BuC: 1, AuBuC: 1 },
    { op: '(<span style=\'text-decoration: overline\'>A</span> &cup; B) - C', back: 1, A: 0, B: 1, C: 0, AuB: 1, AuC: 0, BuC: 0, AuBuC: 0 },
    { op: '(<span style=\'text-decoration: overline\'>A</span> &cap; B) - C', back: 0, A: 0, B: 1, C: 0, AuB: 0, AuC: 0, BuC: 0, AuBuC: 0 },
    { op: '(A - B) - <span style=\'text-decoration: overline\'>C</span>', back: 0, A: 0, B: 0, C: 0, AuB: 0, AuC: 1, BuC: 0, AuBuC: 0 },
    { op: '(A &cup; <span style=\'text-decoration: overline\'>B</span>) &oplus; C', back: 1, A: 1, B: 0, C: 0, AuB: 1, AuC: 0, BuC: 1, AuBuC: 0 },
];

var moreOperationsQuestions = [
    moreOperationsDifferences,
    moreOperationsSymmetricDifferences,
    moreOperationsComplement,
    moreOperationsTwoOperators,
    moreOperationsThreeOperators
];
