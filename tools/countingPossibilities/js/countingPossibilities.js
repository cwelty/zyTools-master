function CountingPossibilities() {
    this.init = function(id, parentResource, options) {
        this.name = '<%= grunt.option("tool") %>';

        // Create math.js instance that uses BigNumbers.
        var bigNumberMath = math.create({
            number: 'bignumber'
        });

        /*
            Support user inputing permutations and combinations.
            Ex: P(4, 3) and C(36, 12)
        */
        bigNumberMath.import({
            p: bigNumberMath.permutations,
            P: bigNumberMath.permutations,
            c: bigNumberMath.combinations,
            C: bigNumberMath.combinations
        });

        this.questionFactory = null;
        if (!!options && ('questionType' in options)) {
            var utilities = require('utilities');

            buildPrototypeForCountingPossibilitiesQuestionFactory(this.printValue);
            buildPrototypeForCountingPossibilitiesQuestion(this.printValue);

            var userAndExpectedAnswerDiffTemplate = this[this.name].userAndExpectedAnswerDiff;

            switch (options.questionType) {
                case 'sumAndProduct':
                    buildPrototypeForSumAndProductQuestion();
                    buildPrototypeForSumAndProductQuestionFactory();
                    this.questionFactory = new SumAndProductQuestionFactory(utilities, userAndExpectedAnswerDiffTemplate, bigNumberMath);
                    break;
                case 'permutations':
                    buildPrototypeForPermutationsQuestion();
                    buildPrototypeForPermutationsQuestionFactory();
                    this.questionFactory = new PermutationsQuestionFactory(utilities, userAndExpectedAnswerDiffTemplate, bigNumberMath);
                    break;
                case 'subsets':
                    buildPrototypeForSubsetsQuestion();
                    buildPrototypeForSubsetsQuestionFactory();
                    this.questionFactory = new SubsetsQuestionFactory(utilities, userAndExpectedAnswerDiffTemplate, bigNumberMath);
                    break;
                case 'complements':
                    buildPrototypeForComplementsQuestion();
                    buildPrototypeForComplementsQuestionFactory();
                    this.questionFactory = new ComplementsQuestionFactory(utilities, userAndExpectedAnswerDiffTemplate, bigNumberMath);
                    break;
            }
        }

        require('singleInputQuestionProgressionTool').create().init(id, parentResource, {
            css:             '<style><%= grunt.file.read(css_filename) %></style>',
            displayTemplate: this[this.name].countingPossibilities,
            questionFactory: this.questionFactory
        });
    };

    /*
        Return |value| as an exact value.
        |value| is required and a Number.
    */
    this.printValue = function(value) {
        return this.bigNumberMath.format(value, { notation: 'fixed' });
    };

    <%= grunt.file.read(hbs_output) %>
}

var countingPossibilitiesExport = {
    create: function() {
        return new CountingPossibilities();
    },
    dependencies: <%= grunt.file.read(dependencies) %>,
    runTests:     function() {
        <%= grunt.file.read(tests) %>
    }
};
module.exports = countingPossibilitiesExport;
