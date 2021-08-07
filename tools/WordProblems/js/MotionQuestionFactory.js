/**
    Factory that makes {Question}s.
    @class MotionQuestionFactory
    @extends QuestionFactory from singleInputQuestionProgressionTool
    @constructor
    @param {Function} getResourceURL Pass an image name to get that image's URL.
    @param {Function} imageTemplate Pass an image URL to get an image HTML.
*/
function MotionQuestionFactory(getResourceURL, imageTemplate) {
    this._getResourceURL = getResourceURL;
    this._imageTemplate = imageTemplate;
    this.numberOfQuestions = 4;
}

/**
    Build {MotionQuestionFactory}'s prototype after dependencies have loaded.
    @method buldMotionQuestionFactoryPrototype
    @return {void}
*/
function buildMotionQuestionFactoryPrototype() {
    MotionQuestionFactory.prototype = require('singleInputQuestionProgressionTool').getNewQuestionFactory();
    MotionQuestionFactory.prototype.constructor = MotionQuestionFactory;

    var utiliites = require('utilities');
    var pickNumberInRange = utiliites.pickNumberInRange;

    /**
        Make a new question for the given level.
        @method make
        @param {Number} currentLevelIndex The current level's index. Ranges from 0 .. |numberOfQuestions|-1.
        @return {Question} The new question.
    */
    MotionQuestionFactory.prototype.make = function(currentLevelIndex) {
        var prompt, inputPostfix, expectedAnswer, explanation;
        switch (currentLevelIndex) {
            // Solve for travel time given travel velocity and distance.
            case 0:
                var hoursToTravel = 10 * pickNumberInRange(1, 6);
                var milesPerHour = 10 * pickNumberInRange(2, 7, [ hoursToTravel ]);
                var milesToTravel = hoursToTravel * milesPerHour;

                expectedAnswer = hoursToTravel;

                prompt = 'Sue drives a car at a rate of ' + milesPerHour + ' miles/hour.' + utiliites.getNewline()
                       + 'Sue must travel a distance of ' + milesToTravel + ' miles.' + utiliites.getNewline()
                       + 'How much time (t) will Sue\'s travel require?';

                inputPostfix = 'hours';

                explanation = LaTeXPrefix
                            + makeLaTeXValueAndUnit('t', 'hours', false) + multiplicationSymbol + makeLaTeXFraction(milesPerHour, 'miles', false, 1, 'hour', false) + makeLaTeXResult(milesToTravel, 'miles')
                            + LaTeXPostfix + utiliites.getNewline()
                            + LaTeXPrefix
                            + 't' + makeLaTeXResult(hoursToTravel, 'hours')
                            + LaTeXPostfix;
                break;

            // Solve for half of total distance given total travel time and velocity.
            case 1:
                var hoursJog = pickNumberInRange(2, 5);
                var milesPerHour = 2 * pickNumberInRange(2, 6, [ hoursJog ]);
                var houseToStoreMiles = (hoursJog * milesPerHour) / 2;

                expectedAnswer = houseToStoreMiles;

                prompt = 'Jan jogged from her home to the store, then back home.' + utiliites.getNewline()
                       + 'She jogged for ' + hoursJog + ' hours at ' + milesPerHour + ' miles/hour.' + utiliites.getNewline()
                       + 'What is the distance (d) between Jan\'s home and the store?';

                inputPostfix = 'miles';

                explanation = utiliites.getNewline()
                            + this._imageTemplate({ imageURL: this._getResourceURL('level2.png') }) + utiliites.getNewline()
                            + LaTeXPrefix
                            + makeLaTeXValueAndUnit(hoursJog, 'hours', false) + multiplicationSymbol + makeLaTeXFraction(milesPerHour, 'miles', false, 1, 'hour', false) + makeLaTeXResult('(d + d)', 'miles')
                            + LaTeXPostfix + utiliites.getNewline()
                            + LaTeXPrefix
                            + 'd' + makeLaTeXResult(houseToStoreMiles, 'miles')
                            + LaTeXPostfix;

                break;

            // Solve for distance of one cycle given number of cycles, and travel time and velocity.
            case 2:
                var timesAroundNeighborhood = pickNumberInRange(3, 6);
                var milesPerHour = pickNumberInRange(2, 4, [ timesAroundNeighborhood ]);
                var walkHours = timesAroundNeighborhood * 2;
                var milesAroundNeighorhood = (walkHours * milesPerHour) / timesAroundNeighborhood;

                expectedAnswer = milesAroundNeighorhood;

                prompt = 'Joe walked around his neighborhood ' + timesAroundNeighborhood + ' times.' + utiliites.getNewline()
                       + 'He walked for ' + walkHours + ' hours at ' + milesPerHour + ' miles/hour.' + utiliites.getNewline()
                       + 'What is the distance (d) to walk once around his neighborhood?';

                inputPostfix = 'miles';

                explanation = utiliites.getNewline()
                            + this._imageTemplate({ imageURL: this._getResourceURL('level3.png') }) + utiliites.getNewline()
                            + LaTeXPrefix
                            + makeLaTeXValueAndUnit(walkHours, 'hours', false) + multiplicationSymbol + makeLaTeXFraction(milesPerHour, 'miles', false, 1, 'hour', false) + makeLaTeXResult(timesAroundNeighborhood + multiplicationSymbol + ' d', 'miles')
                            + LaTeXPostfix + utiliites.getNewline()
                            + LaTeXPrefix
                            + 'd' + makeLaTeXResult(milesAroundNeighorhood, 'miles')
                            + LaTeXPostfix;
                break;

            // Solve for travel time given multiple modes of transit at different velocities and distances.
            case 3:
                var walkHours = pickNumberInRange(2, 4);
                var walkMPH = pickNumberInRange(2, 5, [ walkHours ]);
                var bikeHours = pickNumberInRange(2, 4, [ walkHours, walkMPH ]);
                var bikeMPH = pickNumberInRange(6, 10);
                var milesFromPark = (walkHours * walkMPH) + (bikeHours * bikeMPH);

                expectedAnswer = walkHours;

                prompt = 'Bill lives ' + milesFromPark + ' miles from a park.' + utiliites.getNewline()
                       + 'He biked at ' + bikeMPH + ' miles per hour for ' + bikeHours + ' hours toward the park.' + utiliites.getNewline()
                       + 'Then, he walked the remaining distance to the park at ' + walkMPH + ' miles per hour.' + utiliites.getNewline()
                       + 'How much time (t) did Bill walk?';

                inputPostfix = 'hours';

                explanation = utiliites.getNewline()
                            + this._imageTemplate({ imageURL: this._getResourceURL('level4.png') }) + utiliites.getNewline()
                            + LaTeXPrefix
                            + '(' + makeLaTeXValueAndUnit(bikeHours, 'hours', false) + multiplicationSymbol + makeLaTeXFraction(bikeMPH, 'miles', false, 1, 'hour', false) + '\\small{) + (' + makeLaTeXValueAndUnit('t', 'hours', false) + '}' + multiplicationSymbol + makeLaTeXFraction(walkMPH, 'miles', false, 1, 'hour', false) + ')' + makeLaTeXResult(milesFromPark, 'miles')
                            + LaTeXPostfix + utiliites.getNewline()
                            + LaTeXPrefix
                            + 't' + makeLaTeXResult(walkHours, 'hours')
                            + LaTeXPostfix;
                break;
        }

        return new Question(
            prompt,
            expectedAnswer,
            explanation,
            'Ex: 8', // placeholder
            true,    // answerIsNumber
            '',      // prefix
            inputPostfix
        );
    };
}
