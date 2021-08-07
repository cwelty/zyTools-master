function IntegerProperties() {
    this.init = function(id, parentResource, options) {
        this.name = '<%= grunt.option("tool") %>';

        this.questionFactory = null;
        if (!!options && ('questionType' in options)) {
            var utilities = require('utilities');

            switch (options.questionType) {
                case 'quotientRemainder':
                    buildPrototypeForModularArithmeticAndQuotientRemainderQuestion();
                    buildPrototypeForQuotientRemainderFactory();
                    this.questionFactory = new QuotientRemainderFactory(utilities);
                    break;
                case 'modularArithmetic':
                    buildPrototypeForModularArithmeticAndQuotientRemainderQuestion();
                    buildPrototypeForModularArithmeticFactory();
                    this.questionFactory = new ModularArithmeticFactory(utilities);
                    break;
                case 'primeFactorization':
                    buildPrototypeForPrimeFactorizationQuestion();
                    buildPrototypeForPrimeFactorizationFactory();
                    this.questionFactory = new PrimeFactorizationFactory(
                        utilities,
                        this[this.name]['primeFactorizationExpression'],
                        this[this.name]['primeFactorizationExplanation']
                    );
                    break;
            }
        }

        require('singleInputQuestionProgressionTool').create().init(id, parentResource, {
            css:             '<style><%= grunt.file.read(css_filename) %></style>',
            displayTemplate: this[this.name]['integerProperties'],
            questionFactory: this.questionFactory
        });
    };

    <%= grunt.file.read(hbs_output) %>
}

var integerPropertiesExport = {
    create: function() {
        return new IntegerProperties();
    },
    dependencies: <%= grunt.file.read(dependencies) %>
};
module.exports = integerPropertiesExport;
