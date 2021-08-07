/*
    |QuestionFactory| is an abstract Object that is not intended to be instantiated.
*/
function QuestionFactory() {
    this.numberOfQuestions = 1;
}

/*
    Make a Question based on the |currentQuestionNumber|.
    |currentQuestionNumber| is a required Number.
*/
QuestionFactory.prototype.make = function(currentQuestionNumber) {
    return new Question();
};