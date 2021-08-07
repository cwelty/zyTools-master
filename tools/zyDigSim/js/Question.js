/*
    A Question includes:
    * |equation| is expected answer that is used internally. |equation| is required and a string.
    * |discreteMathEquation| is |equation| with Discrete Math notation.
    * |display| is what should be output as instructions. |display| is optional and a string. If |display| is not provided, then use |equation|.
*/
function Question(equation, discreteMathEquation, display) {
    equation = equation;
    this.equation = equation;
    this.discreteMathEquation = discreteMathEquation;
    this.display = 'z = ' + (display || equation);
}
