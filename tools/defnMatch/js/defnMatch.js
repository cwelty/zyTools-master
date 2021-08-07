function DefnMatch() {
    this.init = function(id, parentResource, options) {
        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        this.terms = [];
        this.definitions = [];
        this.parentResource = parentResource;

        this.terms = [
            {
                i: '0',
                term: 'Machine instruction'
            },
            {
                i: '1',
                term: 'Assembly language'
            },
            {
                i: '2',
                term: 'Compiler'
            },
            {
                i: '3',
                term: 'Application'
            },
        ];

        this.definitions = [
            {
                defn: 'A series of 0s and 1s, stored in memory, that tells a processor to carry out a particular operation line a multiplication.',
                explanation: 'undefined',
                hasExplanation: false,
                i: '0',
                isDummey: '0',
                showInstruction: true
            },
            {
                defn: 'Human-readable processor instructions; an assembler translates to machine instructions (0s and 1s).',
                explanation: 'undefined',
                hasExplanation: false,
                i: '1',
                isDummey: '0',
                showInstruction: false
            },
            {
                defn: 'Translates a high-level language program into low-level machine instructions.',
                explanation: 'undefined',
                hasExplanation: false,
                i: '2',
                isDummey: '0',
                showInstruction: false
            },
            {
                defn: 'Another word for a program.',
                explanation: 'undefined',
                hasExplanation: false,
                i: '3',
                isDummey: '0',
                showInstruction: false
            },
        ];

        if (options && options['terms']) {
            this.terms.length = 0;
            this.definitions.length = 0;
            for (var key = 0; key < options['terms'].length; key++) {
                var nTerm = {
                    term: options['terms'][key]['term'],
                    i: key,
                };

                var nDefn = {
                    defn: options['terms'][key]['definition'],
                    i: key,
                    isDummy: options['terms'][key]['term'] === undefined ? '1' : '0',
                    showInstruction: key === 0, // only true for first defn
                    hasExplanation: !options['terms'][key]['explanation'] ? false : true,
                    explanation: options['terms'][key]['explanation']
                };

                if (options['terms'][key]['term'] !== undefined) {
                    this.terms.push(nTerm);
                }
                if (options['terms'][key]['definition'] !== undefined) {
                    this.definitions.push(nDefn);
                }
            }
        }

        var hbs_context = { id: this.id, terms: this.terms, definitions: this.definitions };

        var css = '<style><%= grunt.file.read(css_filename) %></style>';
        var html = this[this.name]['defnMatch'](hbs_context);
        $('#' + this.id).html(css + html);

        this.checkmarkImageURL = this.parentResource.getResourceURL('checkmark.png', this.name);

        this.hideExplanations();
        this.randomizeTermsInTermBank();

        var senderSortable;
        var prevOver;
        var self = this;
        $('#' + this.id + ' .term-bank ul, #' + this.id + ' .term-bucket').sortable({
            connectWith: '#' + this.id + ' .term-bank ul, #' + this.id + ' .term-bucket',
            cancel: '.instruction',
            placeholder: 'empty-placeholder',
            start: function(event, ui) {
                senderSortable = ui.item.parent();
                ui.item.removeClass('term-correct').removeClass('definition-term-wrong').removeClass('term-out-of-bucket').addClass('unselected-term');
            },
            over: function(event, ui) {
                $('#' + self.id + ' .instruction').fadeOut('fast');

                if (prevOver) {
                    prevOver.removeClass('term-bucket-highlight');
                }

                if (ui.placeholder.parent().parent().hasClass('term-bank')) { // hovering over term-bank
                    ui.placeholder.parent().addClass('term-bucket-highlight');
                    prevOver = ui.placeholder.parent();
                } else {
                    ui.placeholder.parent().parent().addClass('term-bucket-highlight');
                    prevOver = ui.placeholder.parent().parent();
                }
            },
            stop: function(event, ui) {
                if (prevOver) {
                    prevOver.removeClass('term-bucket-highlight');
                }

                if(ui.item.parent().hasClass('term-bucket')) { // new location is term-bucket
                    var lis = ui.item.parent().find('li');
                    if(lis.length === 2) { // other term in new location
                        var otherTermIndex;
                        var newTermIndex;

                        if(lis[0].getAttribute('termNum') == ui.item.attr('termNum')) { // determine which is other item
                            otherTermIndex = 1;
                            newTermIndex = 0;
                        } else {
                            otherTermIndex = 0;
                            newTermIndex = 1;
                        }

                        if($(lis[otherTermIndex]).attr('termnum') !== $(ui.item.parent()).attr('defnnum')) { // if other term is wrong, then move other term to palette
                            $('#' + self.id + ' .term-bank ul').append(lis[otherTermIndex]);
                        } else { // else reject new term
                            $('#' + self.id + ' .term-bank ul').append(lis[newTermIndex]);
                        }
                    }
                }

                self.updateSortable(ui.item.parent());   // updateSortable(new location)
                self.updateSortable(senderSortable);     // updateSortable(prev location)
                self.updateSortable($('#' + self.id + ' .term-bank ul')); // updateSortable(term bucket)

                self.recordMatches();
            }
        });

        $('#reset_' + this.id).click(function() {
            self.reset();
        });
    };

    this.reset = function() {
        this.hideExplanations();
        this.moveTermsToTermBank();
        this.randomizeTermsInTermBank();
    };

    this.hideExplanations = function() {
        $('#' + this.id + ' .explanation').hide();
    };

    this.moveTermsToTermBank = function() {
        var $terms = $('#' + this.id + ' li');
        $terms.remove();
        $('#' + this.id + ' .term-bank ul').append($terms);
        $('#' + this.id + ' .instruction').fadeIn('slow');

        var self = this;
        $('#' + this.id + ' ul').each(function() {
            self.updateSortable($(this));
        });
    };

    /*
        Shuffle the elements in an |array|.
        |array| is required and an array.
    */
    this.shuffleArray = function(array) {
        var currentIndex = array.length;
        var temporaryValue;
        var randomIndex;

        // While there remain elements to shuffle
        while (currentIndex > 0) {
            // Randomly pick a remaining element
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // Swap the randomly selected element with the current index element
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
    };

    this.randomizeTermsInTermBank = function() {
        var $termBank = $('#' + this.id + ' .term-bank ul');
        var $terms = $termBank.find('li');
        $terms.remove();
        this.shuffleArray($terms);
        $termBank.append($terms);
    };

    this.updateSortable = function($ul) {
        if($ul.parent().hasClass('term-bank')) { // $ul is terms bank
            $ul.find('li').removeClass('term-correct').removeClass('definition-term-wrong').removeClass('term-out-of-bucket').addClass('unselected-term');
        } else { // $ul is term-bucket
            var $defn = $('#' + this.id + ' .defnCol').eq(parseInt($ul.attr('defnnum')));
            var $corr = $('#' + this.id + ' .defnColCorr').eq(parseInt($ul.attr('defnnum')));
            var lis = $ul.find('li');

            if(lis.length === 0) { // term-bucket has no terms
                $ul.find('span').css('display', 'block');
                $ul.parent().removeClass('term-correct').removeClass('definition-term-wrong').addClass('unselected-term');
                $defn.removeClass('term-correct').removeClass('definition-term-wrong').addClass('definition-column-unselected-term');
                $corr.html('');
                $('#explanation_' + $ul.attr('defnnum') + '_' + this.id).hide();
            } else if($(lis[0]).attr('termnum') === $ul.attr('defnnum')) { // correct term
                $ul.parent().removeClass('unselected-term').removeClass('definition-term-wrong').addClass('term-correct');
                lis.removeClass('unselected-term').removeClass('definition-term-wrong').addClass('term-correct').addClass('term-out-of-bucket');
                $defn.removeClass('definition-term-wrong').removeClass('definition-column-unselected-term').addClass('term-correct');
                $corr.html('<img src="' + this.checkmarkImageURL + '">');
                $('#explanation_' + $ul.attr('defnnum') + '_' + this.id).show('slow');
            } else { // wrong term
                $ul.parent().removeClass('term-correct').removeClass('definition-term-wrong').addClass('unselected-term');
                $defn.removeClass('definition-column-unselected-term').addClass('definition-term-wrong');
                lis.removeClass('unselected-term').removeClass('term-correct').addClass('term-out-of-bucket');
                $corr.html('<span class=\'red-x\'>&#x2716;</span>');
                $('#explanation_' + $ul.attr('defnnum') + '_' + this.id).hide();
            }
        }
    };

    /**
        Record the user's definition matches.
        @method recordMatches
        @private
        @return {void}
    */
    this.recordMatches = function() {
        const userAnswers = $(`#${this.id} .term-bucket`).toArray().map(bucket => {
            const $bucket = $(bucket);
            const bucketIsDummy = ($bucket.attr('dummy') === '1');
            const bucketIsCorrect = $bucket.children('li').eq(0).hasClass('term-correct');
            const bucketIsComplete = bucketIsDummy || bucketIsCorrect;

            return {
                userAnswer: $bucket.children('li').text(),
                isComplete: bucketIsComplete,
            };
        });

        this.parentResource.postEvent({
            part: 0,
            complete: userAnswers.every(answer => answer.isComplete),
            answer: JSON.stringify(userAnswers),
            metadata: {},
        });
    };

    <%= grunt.file.read(hbs_output) %>
}

var defnMatchExport = {
    create: function() {
        return new DefnMatch();
    },
    dependencies: <%= grunt.file.read(dependencies) %>
};
module.exports = defnMatchExport;
