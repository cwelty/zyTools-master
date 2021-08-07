/*
    Equation represents: n = divisor * m + modulus.
    Used for expressions, such as:
        * n div m, where divisor is the answer.
        * n mod m, where modulus is the answer.
    |m|, |divisor|, |modulus|, and |n| are Numbers.
*/
function Equation(m, divisor, modulus) {
    this.m = m;
    this.divisor = divisor;
    this.modulus = modulus;
    this.computeN();
}

// Compute the value of |n| using the values |divisor|, |m|, and |modulus|.
Equation.prototype.computeN = function() {
    this.n = (this.divisor * this.m + this.modulus);
};