function ThreeSetOperations() {
    this.init = function(id, eventManager, options) {
        switch (options.type) {
            case 'unionIntersection':
                this.questionsByLevel = unionIntersectionsQuestions;
                break;
            case 'moreOperations':
                this.questionsByLevel = moreOperationsQuestions;
                break;
        }

        var utilities = require('utilities');
        this.questionsByLevel = this.questionsByLevel.map(function(questions) {
            return utilities.getCarousel(questions);
        });

        var html = this['<%= grunt.option('tool') %>']['threeSetOperations']({ id: id });
        var self = this;
        require('progressionTool').create().init(id, eventManager, {
            html:             html,
            css:              '<style><%= grunt.file.read(css_filename) %></style>',
            numToWin:         5,
            useMultipleParts: true,
            start: function() {
                self.$userInputVenn.addClass('enabled');
                self.displayQuestion(0);
            },
            reset: function() {
                self.$userInputVenn.removeClass('enabled');
                self.$solutionRegion.css('visibility', 'hidden');
                self.resetUserInputVenn();
            },
            next: function(currentQuestion) {
                self.$userInputVenn.addClass('enabled');
                self.$solutionRegion.css('visibility', 'hidden');
                self.displayQuestion(currentQuestion);
                self.resetUserInputVenn();
            },
            isCorrect: function(currentQuestion) {
                self.$userInputVenn.removeClass('enabled');

                var isAnswerCorrect = self.checkCorrectnessOfRegion(sectionState[0], currQuestionToDisplay.back)
                                   && self.checkCorrectnessOfRegion(sectionState[1], currQuestionToDisplay.A)
                                   && self.checkCorrectnessOfRegion(sectionState[2], currQuestionToDisplay.B)
                                   && self.checkCorrectnessOfRegion(sectionState[3], currQuestionToDisplay.C)
                                   && self.checkCorrectnessOfRegion(sectionState[4], currQuestionToDisplay.AuB)
                                   && self.checkCorrectnessOfRegion(sectionState[6], currQuestionToDisplay.AuC)
                                   && self.checkCorrectnessOfRegion(sectionState[8], currQuestionToDisplay.BuC)
                                   && self.checkCorrectnessOfRegion(sectionState[10], currQuestionToDisplay.AuBuC);

                /*
                    The diagram is drawn with 14 partial circles. The state of each partial is stored in |sectionState|.
                    Some partial circles are connected to represent a part of the diagram.
                    The following partial circles are connected:
                    * sectionState[4] and sectionState[5]
                    * sectionState[6] and sectionState[7]
                    * sectionState[8] and sectionState[9]
                    * sectionState[10] - sectionState[13]
                */
                var userAnswer = [ sectionState[0], sectionState[1], sectionState[2], sectionState[3],
                                  sectionState[4], sectionState[6], sectionState[8], sectionState[10] ].join(',');

                var expectedAnswer = [ currQuestionToDisplay.back, currQuestionToDisplay.A, currQuestionToDisplay.B, currQuestionToDisplay.C,
                                      currQuestionToDisplay.AuB, currQuestionToDisplay.AuC, currQuestionToDisplay.BuC, currQuestionToDisplay.AuBuC ].join(',');

                var explanationMessage = 'Correct.';
                if (!isAnswerCorrect) {
                    self.showCorrectAnswer(currQuestionToDisplay.back, currQuestionToDisplay.left, currQuestionToDisplay.right, currQuestionToDisplay.center);
                    self.$solutionRegion.css('visibility', 'visible');
                    explanationMessage = 'See solution.';
                }

                return {
                    explanationMessage: explanationMessage,
                    userAnswer:         userAnswer,
                    expectedAnswer:     expectedAnswer,
                    isCorrect:          isAnswerCorrect
                };
            }
        });

        this.$instructions = $('#instructions_' + id);
        this.$explanations = $('#explanations_' + id);
        this.$userInputVenn = $('#userInputVenn_' + id);
        this.$solutionRegion = $('#solutionRegion_' + id);
        this.$correctAnswerVenn = $('#correctAnswerVenn_' + id);

        this.$instructions.text('Select the regions corresponding to the set denoted by the given expression.');
        this.$explanations.text('Solution shaded below');
        this.$solutionRegion.css('visibility', 'hidden');

        this.initUserInputAndCorrectAnswerVenn();
    };

    var questionCntr = 0;
    var currQuestionToDisplay;
    this.displayQuestion = function(currentQuestion) {
        currQuestionToDisplay = this.questionsByLevel[currentQuestion].getValue();
        this.$instructions.html('Select the region(s) of:<br/>' + currQuestionToDisplay.op);
    };

    /// /////// Start Venn diagram helper functions ////////////////

    this.states = {
        initial: 0, // not clicked or hovered
        clicked: 1,
        hovered: 2
    };

    this.checkCorrectnessOfRegion = function(currentState, shouldBeClicked) {
        var isCorrect = true;

        if (shouldBeClicked) {
            if (currentState !== this.states.clicked) {
                isCorrect = false;
            }
        } else {
            if (currentState === this.states.clicked) {
                isCorrect = false;
            }
        }

        return isCorrect;
    };

    var defaultFillColor = 'white';
    var hoverFillColor = 'rgb(227, 227, 227)';
    var selectedFillColor = 'rgb(200, 200, 200)';
    var sectionState = [ this.states.initial, this.states.initial, this.states.initial,
                        this.states.initial, this.states.initial, this.states.initial,
                        this.states.initial, this.states.initial, this.states.initial,
                        this.states.initial, this.states.initial, this.states.initial,
                        this.states.initial, this.states.initial ];

    this.isTouchDevice = function() {
        return !!('ontouchstart' in window);
    };

    this.sectionSM = function(i, action) {
        var state = sectionState[i];
        var self = this;
        switch(state) { // transitions
            case this.states.initial:
                if (action === 'mouseover') {
                    if (!self.isTouchDevice()) {
                        state = this.states.hovered;
                    }
                } else if (action === 'click') {
                    state = this.states.clicked;
                }
                break;
            case this.states.clicked:
                if (action === 'click') {
                    if (self.isTouchDevice()) {
                        state = this.states.initial;
                    } else {
                        state = this.states.hovered;
                    }
                }
                break;
            case this.states.hovered:
                if (action === 'mouseout') {
                    if (!self.isTouchDevice()) {
                        state = this.states.initial;
                    }
                } else if (action === 'click') {
                    state = this.states.clicked;
                }
                break;
            default:
                state = this.states.initial;
        }

        switch(state) { // actions
            case this.states.initial:
                self.$userInputVenn.setLayer(self.$userInputVenn.data().jCanvas.layers[i], {
                    fillStyle: defaultFillColor
                });
                break;
            case this.states.clicked:
                self.$userInputVenn.setLayer(self.$userInputVenn.data().jCanvas.layers[i], {
                    fillStyle: selectedFillColor
                });
                break;
            case this.states.hovered:
                self.$userInputVenn.setLayer(self.$userInputVenn.data().jCanvas.layers[i], {
                    fillStyle: hoverFillColor
                });
                break;
        }

        sectionState[i] = state;
    };

    this.initUserInputAndCorrectAnswerVenn = function() {
        var topCircle_x = 150;
        var topCircle_y = 75;
        var lowerTwoCriclesDistFromTopC_y = 50;
        var lowerTwoCirclesDistFromTopC_x = 30;

        var self = this;
        this.$userInputVenn.drawRect({ // background
            layer: true,
            fillStyle: defaultFillColor,
            width: 300,
            height: 200,
            x: 150, y: 100,
            click: function() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(0, 'click');
                    self.$userInputVenn.drawLayers();
                }
            },
            touchstart: function() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(0, 'click');
                    self.$userInputVenn.drawLayers();
                }
            },
            mouseover: function() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(0, 'mouseover');
                    self.$userInputVenn.drawLayers();
                }
            },
            mouseout: function() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(0, 'mouseout');
                    self.$userInputVenn.drawLayers();
                }
            }
        }).drawArc({                // only A (top)
            layer: true,
            fillStyle: defaultFillColor,
            strokeStyle: 'rgb(0, 0, 255)',
            strokeWidth: 2,
            x: topCircle_x, y: topCircle_y,
            radius: 50,
            /* start: 265, end: 95,*/
            click: function() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(1, 'click');
                    self.$userInputVenn.drawLayers();
                }
            },
            touchstart: function() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(1, 'click');
                    self.$userInputVenn.drawLayers();
                }
            },
            mouseover: function() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(1, 'mouseover');
                    self.$userInputVenn.drawLayers();
                }
            },
            mouseout: function() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(1, 'mouseout');
                    self.$userInputVenn.drawLayers();
                }
            }
        }).drawArc({                // only B (bottom left)
            layer: true,
            fillStyle: defaultFillColor,
            strokeStyle: 'rgb(128, 0, 128)',
            strokeWidth: 2,
            x: topCircle_x - lowerTwoCirclesDistFromTopC_x, y: topCircle_y + lowerTwoCriclesDistFromTopC_y,
            radius: 50,
            /* start: 140, end: 335,*/
            click: function() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(2, 'click');
                    self.$userInputVenn.drawLayers();
                }
            },
            touchstart: function() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(2, 'click');
                    self.$userInputVenn.drawLayers();
                }
            },
            mouseover: function() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(2, 'mouseover');
                    self.$userInputVenn.drawLayers();
                }
            },
            mouseout: function() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(2, 'mouseout');
                    self.$userInputVenn.drawLayers();
                }
            }
        }).drawArc({                // only C (bottom right)
            layer: true,
            fillStyle: defaultFillColor,
            strokeStyle: 'rgb(225, 225, 0)',
            strokeWidth: 2,
            x: topCircle_x + lowerTwoCirclesDistFromTopC_x, y: topCircle_y + lowerTwoCriclesDistFromTopC_y,
            radius: 50,
            /* start: 25, end: 220,*/
            click: function() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(3, 'click');
                    self.$userInputVenn.drawLayers();
                }
            },
            touchstart: function() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(3, 'click');
                    self.$userInputVenn.drawLayers();
                }
            },
            mouseover: function() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(3, 'mouseover');
                    self.$userInputVenn.drawLayers();
                }
            },
            mouseout: function() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(3, 'mouseout');
                    self.$userInputVenn.drawLayers();
                }
            }
        }).drawArc({                // A union B
            layer: true,
            fillStyle: defaultFillColor,
            strokeStyle: 'rgb(0, 0, 255)',
            strokeWidth: 2,
            x: topCircle_x, y: topCircle_y,
            radius: 50,
            start: 155, end: 265,
            click: function() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(4, 'click');
                    self.sectionSM(5, 'click');
                    self.$userInputVenn.drawLayers();
                }
            },
            touchstart: function() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(4, 'click');
                    self.sectionSM(5, 'click');
                    self.$userInputVenn.drawLayers();
                }
            },
            mouseover: function() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(4, 'mouseover');
                    self.sectionSM(5, 'mouseover');
                    self.$userInputVenn.drawLayers();
                }
            },
            mouseout: function() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(4, 'mouseout');
                    self.sectionSM(5, 'mouseout');
                    self.$userInputVenn.drawLayers();
                }
            }
        }).drawArc({                // A union B
            layer: true,
            fillStyle: defaultFillColor,
            strokeStyle: 'rgb(128, 0, 128)',
            strokeWidth: 2,
            x: topCircle_x - lowerTwoCirclesDistFromTopC_x, y: topCircle_y + lowerTwoCriclesDistFromTopC_y,
            radius: 50,
            start: 335, end: 85,
            click: function() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(4, 'click');
                    self.sectionSM(5, 'click');
                    self.$userInputVenn.drawLayers();
                }
            },
            touchstart: function() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(4, 'click');
                    self.sectionSM(5, 'click');
                    self.$userInputVenn.drawLayers();
                }
            },
            mouseover: function() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(4, 'mouseover');
                    self.sectionSM(5, 'mouseover');
                    self.$userInputVenn.drawLayers();
                }
            },
            mouseout: function() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(4, 'mouseout');
                    self.sectionSM(5, 'mouseout');
                    self.$userInputVenn.drawLayers();
                }
            }
        }).drawArc({                // A union C
            layer: true,
            fillStyle: defaultFillColor,
            strokeStyle: 'rgb(0, 0, 255)',
            strokeWidth: 2,
            x: topCircle_x, y: topCircle_y,
            radius: 50,
            start: 95, end: 205,
            click: function() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(6, 'click');
                    self.sectionSM(7, 'click');
                    self.$userInputVenn.drawLayers();
                }
            },
            touchstart: function() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(6, 'click');
                    self.sectionSM(7, 'click');
                    self.$userInputVenn.drawLayers();
                }
            },
            mouseover: function() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(6, 'mouseover');
                    self.sectionSM(7, 'mouseover');
                    self.$userInputVenn.drawLayers();
                }
            },
            mouseout: function() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(6, 'mouseout');
                    self.sectionSM(7, 'mouseout');
                    self.$userInputVenn.drawLayers();
                }
            }
        }).drawArc({                // A union C
            layer: true,
            fillStyle: defaultFillColor,
            strokeStyle: 'rgb(225, 225, 0)',
            strokeWidth: 2,
            x: topCircle_x + lowerTwoCirclesDistFromTopC_x, y: topCircle_y + lowerTwoCriclesDistFromTopC_y,
            radius: 50,
            start: 275, end: 25,
            click: function() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(6, 'click');
                    self.sectionSM(7, 'click');
                    self.$userInputVenn.drawLayers();
                }
            },
            touchstart: function() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(6, 'click');
                    self.sectionSM(7, 'click');
                    self.$userInputVenn.drawLayers();
                }
            },
            mouseover: function() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(6, 'mouseover');
                    self.sectionSM(7, 'mouseover');
                    self.$userInputVenn.drawLayers();
                }
            },
            mouseout: function() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(6, 'mouseout');
                    self.sectionSM(7, 'mouseout');
                    self.$userInputVenn.drawLayers();
                }
            }
        }).drawArc({                // B union C
            layer: true,
            fillStyle: defaultFillColor,
            strokeStyle: 'rgb(128, 0, 128)',
            strokeWidth: 2,
            x: topCircle_x - lowerTwoCirclesDistFromTopC_x, y: topCircle_y + lowerTwoCriclesDistFromTopC_y,
            radius: 50,
            start: 35, end: 145,
            click: function() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(8, 'click');
                    self.sectionSM(9, 'click');
                    self.$userInputVenn.drawLayers();
                }
            },
            touchstart: function() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(8, 'click');
                    self.sectionSM(9, 'click');
                    self.$userInputVenn.drawLayers();
                }
            },
            mouseover: function() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(8, 'mouseover');
                    self.sectionSM(9, 'mouseover');
                    self.$userInputVenn.drawLayers();
                }
            },
            mouseout: function() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(8, 'mouseout');
                    self.sectionSM(9, 'mouseout');
                    self.$userInputVenn.drawLayers();
                }
            }
        }).drawArc({                // B union C
            layer: true,
            fillStyle: defaultFillColor,
            strokeStyle: 'rgb(225, 225, 0)',
            strokeWidth: 2,
            x: topCircle_x + lowerTwoCirclesDistFromTopC_x, y: topCircle_y + lowerTwoCriclesDistFromTopC_y,
            radius: 50,
            start: 215, end: 325,
            click: function() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(8, 'click');
                    self.sectionSM(9, 'click');
                    self.$userInputVenn.drawLayers();
                }
            },
            touchstart: function() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(8, 'click');
                    self.sectionSM(9, 'click');
                    self.$userInputVenn.drawLayers();
                }
            },
            mouseover: function() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(8, 'mouseover');
                    self.sectionSM(9, 'mouseover');
                    self.$userInputVenn.drawLayers();
                }
            },
            mouseout: function() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(8, 'mouseout');
                    self.sectionSM(9, 'mouseout');
                    self.$userInputVenn.drawLayers();
                }
            }
        }).drawArc({                // A union B union C - Bottom-side of A
            layer: true,
            fillStyle: defaultFillColor,
            strokeStyle: 'rgb(0, 0, 255)',
            strokeWidth: 2,
            x: topCircle_x, y: topCircle_y,
            radius: 50,
            start: 153, end: 207,
            click: function() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(10, 'click');
                    self.sectionSM(11, 'click');
                    self.sectionSM(12, 'click');
                    self.sectionSM(13, 'click');
                    self.$userInputVenn.drawLayers();
                }
            },
            touchstart: function() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(10, 'click');
                    self.sectionSM(11, 'click');
                    self.sectionSM(12, 'click');
                    self.sectionSM(13, 'click');
                    self.$userInputVenn.drawLayers();
                }
            },
            mouseover: function() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(10, 'mouseover');
                    self.sectionSM(11, 'mouseover');
                    self.sectionSM(12, 'mouseover');
                    self.sectionSM(13, 'mouseover');
                    self.$userInputVenn.drawLayers();
                }
            },
            mouseout: function() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(10, 'mouseout');
                    self.sectionSM(11, 'mouseout');
                    self.sectionSM(12, 'mouseout');
                    self.sectionSM(13, 'mouseout');
                    self.$userInputVenn.drawLayers();
                }
            }
        }).drawArc({                // A union B union C - Right-side of B
            layer: true,
            fillStyle: defaultFillColor,
            strokeStyle: 'rgb(128, 0, 128)',
            strokeWidth: 2,
            x: topCircle_x - lowerTwoCirclesDistFromTopC_x, y: topCircle_y + lowerTwoCriclesDistFromTopC_y,
            radius: 50,
            start: 33, end: 87,
            click: function() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(10, 'click');
                    self.sectionSM(11, 'click');
                    self.sectionSM(12, 'click');
                    self.sectionSM(13, 'click');
                    self.$userInputVenn.drawLayers();
                }
            },
            touchstart: function() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(10, 'click');
                    self.sectionSM(11, 'click');
                    self.sectionSM(12, 'click');
                    self.sectionSM(13, 'click');
                    self.$userInputVenn.drawLayers();
                }
            },
            mouseover: function() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(10, 'mouseover');
                    self.sectionSM(11, 'mouseover');
                    self.sectionSM(12, 'mouseover');
                    self.sectionSM(13, 'mouseover');
                    self.$userInputVenn.drawLayers();
                }
            },
            mouseout: function() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(10, 'mouseout');
                    self.sectionSM(11, 'mouseout');
                    self.sectionSM(12, 'mouseout');
                    self.sectionSM(13, 'mouseout');
                    self.$userInputVenn.drawLayers();
                }
            }
        }).drawArc({                // A union B union C - Left-side of C
            layer: true,
            fillStyle: defaultFillColor,
            strokeStyle: 'rgb(225, 225, 0)',
            strokeWidth: 2,
            x: topCircle_x + lowerTwoCirclesDistFromTopC_x, y: topCircle_y + lowerTwoCriclesDistFromTopC_y,
            radius: 50,
            start: 273, end: 327,
            click: function() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(10, 'click');
                    self.sectionSM(11, 'click');
                    self.sectionSM(12, 'click');
                    self.sectionSM(13, 'click');
                    self.$userInputVenn.drawLayers();
                }
            },
            touchstart: function() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(10, 'click');
                    self.sectionSM(11, 'click');
                    self.sectionSM(12, 'click');
                    self.sectionSM(13, 'click');
                    self.$userInputVenn.drawLayers();
                }
            },
            mouseover: function() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(10, 'mouseover');
                    self.sectionSM(11, 'mouseover');
                    self.sectionSM(12, 'mouseover');
                    self.sectionSM(13, 'mouseover');
                    self.$userInputVenn.drawLayers();
                }
            },
            mouseout: function() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(10, 'mouseout');
                    self.sectionSM(11, 'mouseout');
                    self.sectionSM(12, 'mouseout');
                    self.sectionSM(13, 'mouseout');
                    self.$userInputVenn.drawLayers();
                }
            }
        }).drawPolygon({
            layer: true,
            fillStyle: defaultFillColor,
            x: topCircle_x, y: 109,
            radius: 23,
            sides: 3,
            click: function() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(10, 'click');
                    self.sectionSM(11, 'click');
                    self.sectionSM(12, 'click');
                    self.sectionSM(13, 'click');
                    self.$userInputVenn.drawLayers();
                }
            },
            touchstart: function() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(10, 'click');
                    self.sectionSM(11, 'click');
                    self.sectionSM(12, 'click');
                    self.sectionSM(13, 'click');
                    self.$userInputVenn.drawLayers();
                }
            },
            mouseover: function() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(10, 'mouseover');
                    self.sectionSM(11, 'mouseover');
                    self.sectionSM(12, 'mouseover');
                    self.sectionSM(13, 'mouseover');
                    self.$userInputVenn.drawLayers();
                }
            },
            mouseout: function() {
                if (self.$userInputVenn.hasClass('enabled')) {
                    self.sectionSM(10, 'mouseout');
                    self.sectionSM(11, 'mouseout');
                    self.sectionSM(12, 'mouseout');
                    self.sectionSM(13, 'mouseout');
                    self.$userInputVenn.drawLayers();
                }
            }
        }).drawText({
            layer: true,
            strokeStyle: 'rgb(150, 150, 150)',
            strokeWidth: 1,
            x: 15, y: 15,
            fontSize: 14,
            fontFamily: 'Helvetica',
            text: 'U'
        }).drawText({
            layer: true,
            strokeStyle: 'rgb(0, 0, 255)',
            strokeWidth: 1,
            x: topCircle_x, y: 15,
            fontSize: 14,
            fontFamily: 'Helvetica',
            text: 'A'
        }).drawText({
            layer: true,
            strokeStyle: 'rgb(128, 0, 128)',
            strokeWidth: 1,
            x: topCircle_x - 85, y: 155,
            fontSize: 14,
            fontFamily: 'Helvetica',
            text: 'B'
        }).drawText({
            layer: true,
            strokeStyle: 'rgb(225, 225, 0)',
            strokeWidth: 1,
            x: topCircle_x + 85, y: 155,
            fontSize: 14,
            fontFamily: 'Helvetica',
            text: 'C'
        });

        self.$userInputVenn.mouseout(function() {
            if (self.$userInputVenn.hasClass('enabled')) {
                self.sectionSM(0, 'mouseout');
                self.$userInputVenn.drawLayers();
            }
        });

        self.$userInputVenn.mouseover(function() {
            if (self.$userInputVenn.hasClass('enabled')) {
                self.sectionSM(0, 'mouseover');
                self.$userInputVenn.drawLayers();
            }
        });

        self.$correctAnswerVenn.drawRect({ // background
            layer: true,
            fillStyle: defaultFillColor,
            width: 300,
            height: 200,
            x: 150, y: 100
        }).drawArc({                // only A (top)
            layer: true,
            fillStyle: defaultFillColor,
            strokeStyle: 'rgb(0, 0, 255)',
            strokeWidth: 2,
            x: topCircle_x, y: topCircle_y,
            radius: 50,
            /* start: 265, end: 95,*/
        }).drawArc({                // only B (bottom left)
            layer: true,
            fillStyle: defaultFillColor,
            strokeStyle: 'rgb(128, 0, 128)',
            strokeWidth: 2,
            x: topCircle_x - lowerTwoCirclesDistFromTopC_x, y: topCircle_y + lowerTwoCriclesDistFromTopC_y,
            radius: 50,
            /* start: 140, end: 335,*/
        }).drawArc({                // only C (bottom right)
            layer: true,
            fillStyle: defaultFillColor,
            strokeStyle: 'rgb(225, 225, 0)',
            strokeWidth: 2,
            x: topCircle_x + lowerTwoCirclesDistFromTopC_x, y: topCircle_y + lowerTwoCriclesDistFromTopC_y,
            radius: 50,
            /* start: 25, end: 220,*/
        }).drawArc({                // A union B
            layer: true,
            fillStyle: defaultFillColor,
            strokeStyle: 'rgb(0, 0, 255)',
            strokeWidth: 2,
            x: topCircle_x, y: topCircle_y,
            radius: 50,
            start: 155, end: 265
        }).drawArc({                // A union B
            layer: true,
            fillStyle: defaultFillColor,
            strokeStyle: 'rgb(128, 0, 128)',
            strokeWidth: 2,
            x: topCircle_x - lowerTwoCirclesDistFromTopC_x, y: topCircle_y + lowerTwoCriclesDistFromTopC_y,
            radius: 50,
            start: 335, end: 85
        }).drawArc({                // A union C
            layer: true,
            fillStyle: defaultFillColor,
            strokeStyle: 'rgb(0, 0, 255)',
            strokeWidth: 2,
            x: topCircle_x, y: topCircle_y,
            radius: 50,
            start: 95, end: 205
        }).drawArc({                // A union C
            layer: true,
            fillStyle: defaultFillColor,
            strokeStyle: 'rgb(225, 225, 0)',
            strokeWidth: 2,
            x: topCircle_x + lowerTwoCirclesDistFromTopC_x, y: topCircle_y + lowerTwoCriclesDistFromTopC_y,
            radius: 50,
            start: 275, end: 25
        }).drawArc({                // B union C
            layer: true,
            fillStyle: defaultFillColor,
            strokeStyle: 'rgb(128, 0, 128)',
            strokeWidth: 2,
            x: topCircle_x - lowerTwoCirclesDistFromTopC_x, y: topCircle_y + lowerTwoCriclesDistFromTopC_y,
            radius: 50,
            start: 35, end: 145
        }).drawArc({                // B union C
            layer: true,
            fillStyle: defaultFillColor,
            strokeStyle: 'rgb(225, 225, 0)',
            strokeWidth: 2,
            x: topCircle_x + lowerTwoCirclesDistFromTopC_x, y: topCircle_y + lowerTwoCriclesDistFromTopC_y,
            radius: 50,
            start: 215, end: 325
        }).drawArc({                // A union B union C - Bottom-side of A
            layer: true,
            fillStyle: defaultFillColor,
            strokeStyle: 'rgb(0, 0, 255)',
            strokeWidth: 2,
            x: topCircle_x, y: topCircle_y,
            radius: 50,
            start: 153, end: 207
        }).drawArc({                // A union B union C - Right-side of B
            layer: true,
            fillStyle: defaultFillColor,
            strokeStyle: 'rgb(128, 0, 128)',
            strokeWidth: 2,
            x: topCircle_x - lowerTwoCirclesDistFromTopC_x, y: topCircle_y + lowerTwoCriclesDistFromTopC_y,
            radius: 50,
            start: 33, end: 87
        }).drawArc({                // A union B union C - Left-side of C
            layer: true,
            fillStyle: defaultFillColor,
            strokeStyle: 'rgb(225, 225, 0)',
            strokeWidth: 2,
            x: topCircle_x + lowerTwoCirclesDistFromTopC_x, y: topCircle_y + lowerTwoCriclesDistFromTopC_y,
            radius: 50,
            start: 273, end: 327
        }).drawPolygon({
            layer: true,
            fillStyle: defaultFillColor,
            x: topCircle_x, y: 109,
            radius: 23,
            sides: 3
        }).drawText({
            layer: true,
            strokeStyle: 'rgb(150, 150, 150)',
            strokeWidth: 1,
            x: 15, y: 15,
            fontSize: 14,
            fontFamily: 'Helvetica',
            text: 'U'
        }).drawText({
            layer: true,
            strokeStyle: 'rgb(0, 0, 255)',
            strokeWidth: 1,
            x: topCircle_x, y: 15,
            fontSize: 14,
            fontFamily: 'Helvetica',
            text: 'A'
        }).drawText({
            layer: true,
            strokeStyle: 'rgb(128, 0, 128)',
            strokeWidth: 1,
            x: topCircle_x - 85, y: 155,
            fontSize: 14,
            fontFamily: 'Helvetica',
            text: 'B'
        }).drawText({
            layer: true,
            strokeStyle: 'rgb(225, 225, 0)',
            strokeWidth: 1,
            x: topCircle_x + 85, y: 155,
            fontSize: 14,
            fontFamily: 'Helvetica',
            text: 'C'
        });
    };

    this.resetUserInputVenn = function() {
        for (var i = 0; i < sectionState.length; i++) {
            sectionState[i] = 0;
            this.sectionSM(i, 'nothing');
        }
        this.$userInputVenn.drawLayers();
    };

    this.showCorrectAnswer = function() {
        var vennLayers = this.$correctAnswerVenn.data().jCanvas.layers;

        this.$correctAnswerVenn.setLayer(vennLayers[0], {
            fillStyle: currQuestionToDisplay.back ? selectedFillColor : 'white'
        });

        this.$correctAnswerVenn.setLayer(vennLayers[1], {
            fillStyle: currQuestionToDisplay.A ? selectedFillColor : 'white'
        });

        this.$correctAnswerVenn.setLayer(vennLayers[2], {
            fillStyle: currQuestionToDisplay.B ? selectedFillColor : 'white'
        });

        this.$correctAnswerVenn.setLayer(vennLayers[3], {
            fillStyle: currQuestionToDisplay.C ? selectedFillColor : 'white'
        });

        this.$correctAnswerVenn.setLayer(vennLayers[4], {
            fillStyle: currQuestionToDisplay.AuB ? selectedFillColor : 'white'
        });

        this.$correctAnswerVenn.setLayer(vennLayers[5], {
            fillStyle: currQuestionToDisplay.AuB ? selectedFillColor : 'white'
        });

        this.$correctAnswerVenn.setLayer(vennLayers[6], {
            fillStyle: currQuestionToDisplay.AuC ? selectedFillColor : 'white'
        });

        this.$correctAnswerVenn.setLayer(vennLayers[7], {
            fillStyle: currQuestionToDisplay.AuC ? selectedFillColor : 'white'
        });

        this.$correctAnswerVenn.setLayer(vennLayers[8], {
            fillStyle: currQuestionToDisplay.BuC ? selectedFillColor : 'white'
        });

        this.$correctAnswerVenn.setLayer(vennLayers[9], {
            fillStyle: currQuestionToDisplay.BuC ? selectedFillColor : 'white'
        });

        this.$correctAnswerVenn.setLayer(vennLayers[10], {
            fillStyle: currQuestionToDisplay.AuBuC ? selectedFillColor : 'white'
        });

        this.$correctAnswerVenn.setLayer(vennLayers[11], {
            fillStyle: currQuestionToDisplay.AuBuC ? selectedFillColor : 'white'
        });

        this.$correctAnswerVenn.setLayer(vennLayers[12], {
            fillStyle: currQuestionToDisplay.AuBuC ? selectedFillColor : 'white'
        });

        this.$correctAnswerVenn.setLayer(vennLayers[13], {
            fillStyle: currQuestionToDisplay.AuBuC ? selectedFillColor : 'white'
        });

        this.$correctAnswerVenn.drawLayers();
    };

    /// /////////// End Venn diagram helper functions ///////////

    <%= grunt.file.read(hbs_output) %>
}

var threeSetOperationsExport = {
    create: function() {
        return new ThreeSetOperations();
    },
    dependencies: <%= grunt.file.read(dependencies) %>
};
module.exports = threeSetOperationsExport;
