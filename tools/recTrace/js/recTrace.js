function RecTrace() {
    this.init = function(id, eventManager, options) {
        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        var css = '<style><%= grunt.file.read(css_filename) %></style>';

        const isJava = options.lang === 'java';
        const html = this[this.name].recTrace({ id: this.id, isJava });

        $('#' + this.id).html(css + html);

        var self = this;
        $('#' + this.id).click(function() {
            if (!self.beenClicked) {
                var event = {
                    part: 0,
                    complete: true,
                    answer: 'recTrace tool',
                    metadata: {
                        event: 'recTrace clicked'
                    }
                };

                eventManager.postEvent(event);
            }

            self.beenClicked = true;

            return;
        });

        if (options && options['lang'] && (options['lang'] == 'cpp' || options['lang'] == 'c' || options['lang'] == 'java')) {
            this.lang = options['lang'];
        } else {
            this.lang = 'cpp'; // default
        }

        var progCode = '';
        var mainCode = '';
        if (this.lang === 'cpp') {
            progCode = $('#cpp_progCode_' + this.id).html();
            mainCode = $('#cpp_mainCode_' + this.id).html();
        } else if (this.lang === 'c') {
            progCode = $('#c_progCode_' + this.id).html();
            mainCode = $('#c_mainCode_' + this.id).html();
        } else if (this.lang === 'java') {
            progCode = $('#java_progCode_' + this.id).html();
            mainCode = $('#java_mainCode_' + this.id).html();
        }
        $('#recTrace_progCode_' + this.id).html(progCode);
        $('#recTrace_mainCode_' + this.id).find('.code').html(mainCode);

        $('#recTrace_mainCode_' + this.id + ' .recTrace_code1').click(function() {
            self.correctClick();
        });

        $('#recTrace_mainCode_' + this.id + ' .recTrace_code2').click(function(e) {
            self.wrongClick(e);
        });

        $('#recTrace_reset' + this.id).click(function() {
            self.reset();
        });
    };

    var level = 0;

    this.correctClick = function() {
        level++;

        var self = this;
        if (level === 1) {
            this.loadNextCode(true);
            $('#recTrace_mainCode_' + this.id).css('opacity', '0.5');
            $('#recTrace_mainCode_' + this.id + ' .recTrace_code1').off('click');
            $('#recTrace_mainCode_' + this.id + ' .recTrace_code2').off('click');
            $('#recTrace_recCode' + level + '_' + this.id + ' .midValue').text('50');
            this.setClickEventListeners(level, '2');
        } else if (level === 2) {
            this.loadNextCode();
            this.disablePreviousLevel();
            $('#recTrace_recCode' + level + '_' + this.id + ' .midValue').text('75');
            this.setClickEventListeners(level, '1');
        } else if (level === 3) {
            this.loadNextCode();
            this.disablePreviousLevel();
            $('#recTrace_recCode' + level + '_' + this.id + ' .midValue').text('63');
            this.setClickEventListeners(level, '3');
        } else if (level === 4) {
            var topToScrollTo = $('#' + this.id + ' .right-side').scrollTop() - $('#recTrace_recCode' + (level - 2) + '_' + this.id).height();
            var levelToHide = level - 1;
            this.scrollTop(topToScrollTo, levelToHide);
            $('#recTrace_recCode' + (level - 2) + '_' + this.id).css('opacity', '1');
            this.setClickEventListeners((level - 2), '3');

            $('#recTrace_recCode' + (level - 2) + '_' + this.id + ' .recTrace_code1').css('text-decoration', '');
            $('#recTrace_recCode' + (level - 2) + '_' + this.id + ' .recTrace_code2').css('text-decoration', '');
            $('#recTrace_recCode' + (level - 2) + '_' + this.id + ' .recTrace_code3').css('text-decoration', '');
        } else if (level === 5) {
            var topToScrollTo = $('#' + this.id + ' .right-side').scrollTop() - $('#recTrace_recCode' + (level - 4) + '_' + this.id).height();
            var levelToHide = level - 3;
            this.scrollTop(topToScrollTo, levelToHide);
            $('#recTrace_recCode' + (level - 4) + '_' + this.id).css('opacity', '1');
            this.setClickEventListeners((level - 4), '3');
            $('#recTrace_recCode' + (level - 4) + '_' + this.id + ' .recTrace_code1').css('text-decoration', '');
            $('#recTrace_recCode' + (level - 4) + '_' + this.id + ' .recTrace_code2').css('text-decoration', '');
            $('#recTrace_recCode' + (level - 4) + '_' + this.id + ' .recTrace_code3').css('text-decoration', '');
        } else if (level === 6) {
            var topToScrollTo = 0;
            var levelToHide = level - 5;
            this.scrollTop(topToScrollTo, levelToHide);
            $('#recTrace_mainCode_' + this.id).css('opacity', '1');

            $('#recTrace_mainCode_' + this.id + ' .recTrace_code1').css('text-decoration', '').click(function(e) {
                self.wrongClick(e);
            });

            $('#recTrace_mainCode_' + this.id + ' .recTrace_code2').css('text-decoration', '').click(function() {
                self.correctClick();
            });
        } else if (level === 7) {
            $('#recTrace_mainCode_' + this.id + ' .recTrace_code1').off('click');
            $('#recTrace_mainCode_' + this.id + ' .recTrace_code2').off('click');
            $('#recTrace_table' + this.id).css('visibility', 'hidden');
            $('#' + this.id + ' .recursion-completed').show();
        }
    };

    this.wrongClick = function(e) {
        $(e.currentTarget).css('text-decoration', 'line-through').off('click');
    };

    this.loadNextCode = function(isFirstStep) {
        isFirstStep = isFirstStep !== undefined ? isFirstStep : false;
        $('#recTrace_recCode' + level + '_' + this.id).show();

        var recCode = '';
        if (this.lang === 'cpp') {
            recCode = $('#cpp_recCode_' + this.id).html();
        } else if (this.lang === 'c') {
            recCode = $('#c_recCode_' + this.id).html();
        } else if (this.lang === 'java') {
            recCode = $('#java_recCode_' + this.id).html();
        }
        $('#recTrace_recCode' + level + '_' + this.id).find('.code').html(recCode);

        if (!isFirstStep) {
            this.scrollTop($('#' + this.id + ' .right-side').scrollTop() + $('#recTrace_recCode' + level + '_' + this.id).height());
        } else {
            this.scrollTop($('#' + this.id + ' .right-side').scrollTop() + $('#recTrace_mainCode_' + this.id).height());
        }
    };

    this.scrollTop = function(top, levelToHideAfterAnimationDone) {
        var self = this;
        $('#' + this.id + ' .right-side').animate({ scrollTop: top }, 1000, function() {
            if (levelToHideAfterAnimationDone !== undefined) {
                $('#recTrace_recCode' + levelToHideAfterAnimationDone + '_' + self.id).fadeOut();
            }
        });
    };

    this.disablePreviousLevel = function() {
        $('#recTrace_recCode' + (level - 1) + '_' + this.id).css('opacity', '0.5');
        $('#recTrace_recCode' + (level - 1) + '_' + this.id + ' .recTrace_code1').off('click');
        $('#recTrace_recCode' + (level - 1) + '_' + this.id + ' .recTrace_code2').off('click');
        $('#recTrace_recCode' + (level - 1) + '_' + this.id + ' .recTrace_code3').off('click');
    };

    this.setClickEventListeners = function(levelToAddListeners, whichCodeIsCorrect) {
        var self = this;
        $('#recTrace_recCode' + levelToAddListeners + '_' + this.id + ' .recTrace_code1').click(function(e) {
            if (whichCodeIsCorrect === '1') {
                self.correctClick();
            } else {
                self.wrongClick(e);
            }
        });
        $('#recTrace_recCode' + levelToAddListeners + '_' + this.id + ' .recTrace_code2').click(function(e) {
            if (whichCodeIsCorrect === '2') {
                self.correctClick();
            } else {
                self.wrongClick(e);
            }
        });
        $('#recTrace_recCode' + levelToAddListeners + '_' + this.id + ' .recTrace_code3').click(function(e) {
            if (whichCodeIsCorrect === '3') {
                self.correctClick();
            } else {
                self.wrongClick(e);
            }
        });
    };

    this.reset = function() {
        level = 0;
        $('#recTrace_table' + this.id).css('visibility', 'visible');
        $('#' + this.id + ' .recursion-completed').hide();

        var self = this;
        $('#recTrace_mainCode_' + this.id + ' .recTrace_code1').css('text-decoration', '').click(function() {
            self.correctClick();
        });
        $('#recTrace_mainCode_' + this.id + ' .recTrace_code2').css('text-decoration', '').click(function(e) {
            self.wrongClick(e);
        });
    };

    <%= grunt.file.read(hbs_output) %>
}

var recTraceExport = {
    create: function() {
        return new RecTrace();
    }
};
module.exports = recTraceExport;
