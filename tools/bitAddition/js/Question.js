/*
    Question contains the following properties:
        * |prompt| is required and a string.
        * |carryPrefixBits|, |firstNumber|, |firstNumberPrefixBits|, |secondNumber|,
            |secondNumberPrefixBits|, and |resultPrefixBits| are required and a number.
        * |expectedCarrySuffixBits|, |firstNumberSuffixBits|, |secondNumberSuffixBits|, and
            |expectedResultSuffixBits| are required and an array of numbers.
*/
function Question(prompt, carryPrefixBits, expectedCarrySuffixBits, firstNumber,
    firstNumberPrefixBits, firstNumberSuffixBits, secondNumber, secondNumberPrefixBits,
    secondNumberSuffixBits, resultPrefixBits, expectedResultSuffixBits) {

    this.prompt = prompt;
    this.carryPrefixBits = carryPrefixBits;
    this.expectedCarrySuffixBits = expectedCarrySuffixBits;
    this.firstNumber = firstNumber;
    this.firstNumberPrefixBits = firstNumberPrefixBits;
    this.firstNumberSuffixBits = firstNumberSuffixBits;
    this.secondNumber = secondNumber;
    this.secondNumberPrefixBits = secondNumberPrefixBits;
    this.secondNumberSuffixBits = secondNumberSuffixBits;
    this.resultPrefixBits = resultPrefixBits;
    this.expectedResultSuffixBits = expectedResultSuffixBits;
}
