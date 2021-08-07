function LoopSim() {
    this.init = function(id, eventManager, options) {
        this.name = '<%= grunt.option("tool") %>';
        this.id = id;

        this.lang = 'cpp';
        if (options && options['lang'] && [ 'c', 'cpp', 'java', 'python2', 'python3', 'matlab' ].indexOf(options['lang']) != -1) {
            this.lang = options['lang'];
        }

        var css = '<style><%= grunt.file.read(css_filename) %></style>';

        if (this.lang === 'python2' || this.lang === 'python3') {
            var html = this[this.name]['loopSimPython']({ id: this.id });
        } else {
            var html = this[this.name]['loopSim']({ id: this.id });
        }
        $('#' + this.id).html(css + html);

        this.setLangCode();

        var self = this;
        $('#loopSim_runCodeButton' + this.id).click(function() {
            self.runSim();
        });
        $('#loopSim' + this.id + ' input').keyup(function(e) {
            if (e.which === 13) {
                self.runSim();
            }
        });

        var self = this;
        $('#' + this.id).click(function() {
            if (!self.beenClicked) {
                var event = {
                    part: 0,
                    complete: true,
                    answer: 'char encode tool',
                    metadata: {
                        event: 'char encode tool clicked'
                    }
                };

                eventManager.postEvent(event);
            }

            self.beenClicked = true;

            return;
        });
    };

    this.setLangCode = function() {
        var langCode = '';

        if (this.lang === 'cpp') {
            langCode = '<span style="color: #603000;">cout</span> <span style="color: #808030;">&lt;</span><span style="color: #808030;">&lt;</span>  i  <span style="color: #808030;">&lt;</span><span style="color: #808030;">&lt;</span> <span style="color: #800000;">"</span> <span style="color: #800000;">"</span><span style="color: #800080;">;</span>';
        } else if (this.lang === 'c') {
            langCode = '<span style="color:#603000; ">printf</span><span style="color:#808030; ">(</span><span style="color:#800000; ">"</span><span style="color:#0f69ff; ">%d</span><span style="color:#0000e6; "> </span><span style="color:#800000; ">"</span><span style="color:#808030; ">,</span> i<span style="color:#808030; ">)</span><span style="color:#800080; ">;</span>';
        } else if (this.lang === 'java') {
            langCode = '<span style="color:#bb7977; font-weight:bold; ">System</span><span style="color:#808030; ">.</span>out<span style="color:#808030; ">.</span>print<span style="color:#808030; ">(</span>i <span style="color:#808030; ">+</span> <span style="color:#0000e6; ">" "</span><span style="color:#808030; ">)</span><span style="color:#800080; ">;</span>';
        } else if (this.lang === 'python2') {
            langCode = '<span style="color: #0000ff;">print</span>  i<span style="color: #b1b100;">,</span>';
        } else if (this.lang === 'python3') {
            langCode = '<span style="color: #0000ff;">print<span style="color: #b1b100;">(</span></span>i<span style="color: #66cc00;">,</span> end=\' \'<span style="color: #b1b100;">)</span>';
        } else if (this.lang === 'matlab') {
            langCode = '<span style="color:#603000; ">fprintf</span><span style="color:#808030; ">(</span><span style="color:#800000; ">"</span><span style="color:#0f69ff; ">%d</span><span style="color:#0000e6; "> </span><span style="color:#800000; ">"</span><span style="color:#808030; ">,</span> i<span style="color:#808030; ">)</span><span style="color:#800080; ">;</span>';
        }

        $('#loopSim_langCode' + this.id).html(langCode);
    };

    this.runSim = function() {
        var usertxt1 = document.getElementById('loopSim_init' + this.id);
        var usertxt2 = document.getElementById('loopSim_relOp' + this.id);
        var usertxt3 = document.getElementById('loopSim_compVal' + this.id);
        var usertxt4 = document.getElementById('loopSim_incOp' + this.id);
        var usertxt5 = document.getElementById('loopSim_incVal' + this.id);
        var result = document.getElementById('loopSim_output' + this.id);

        var loopresult = this.whileloopsimulator(usertxt1.value, usertxt2.value, usertxt3.value, usertxt4.value, usertxt5.value);

        if (loopresult === 'infinite') {
            result.innerHTML = '<i>An infinite loop was caused.</i>';
        } else if (loopresult.split(':')[0] === 'use a number') {
            result.innerHTML = '<i>Syntax error. Expecting a number, not "' + loopresult.split(':')[1] + '".</i>';
        } else if (loopresult.split(':')[0] === 'use a different comparison operator') {
            result.innerHTML = '<i>Syntax error. Expecting a comparator, not "' + loopresult.split(':')[1] + '".</i>';
        } else if (loopresult.split(':')[0] === 'use a different increment operator') {
            result.innerHTML = '<i>Syntax error. Expecting an operator, not "' + loopresult.split(':')[1] + '".</i>';
        } else {
            result.innerHTML = loopresult;
        }

        return;
    };

    this.whileloopsimulator = function(initialValue, comparison_operator, endValue, increment_operator, incremental) {
        var coutOutput = '';
        // AE 082512 I think the commented out code causes crashes in the function. Also, this code does not cover all possible infinite loops. However, we don't need to do so b/c we have a force kill after 1,000 iterations.
        if ((comparison_operator !== '>=')
         && (comparison_operator !== '<=')
         && (comparison_operator !== '<')
         && (comparison_operator !== '>')) {
            coutOutput = 'use a different comparison operator: ' + comparison_operator;
        } else if ((increment_operator.split(' ').join('') !== '+')
                 && (increment_operator.split(' ').join('') !== '-')
                 && (increment_operator.split(' ').join('') !== '*')
                 && (increment_operator.split(' ').join('') !== '/')) {
            coutOutput = 'use a different increment operator: ' + increment_operator.split(' ').join('');
        } else if (isNaN(Number(initialValue)) || initialValue.split(' ').join('') === '') {
            coutOutput = 'use a number: ' + initialValue;
        } else if (isNaN(Number(endValue)) || endValue.split(' ').join('') === '') {
            coutOutput = 'use a number: ' + endValue;
        } else if (isNaN(Number(incremental)) || incremental.split(' ').join('') === '') {
            coutOutput = 'use a number: ' + incremental;
        } else {
            // run simulation of users code
            var countLoops = 0;
            var maxLoops = 100;
            var store = '';
            var i = parseInt(initialValue);
            try {
                while (eval(i.toString() + ' ' + comparison_operator .toString() + ' parseInt(' + endValue.toString() + ')')) {
                    coutOutput = coutOutput.concat(i.toString() + ' ');
                    i = eval(i.toString() + ' ' + increment_operator + ' parseInt(' + incremental + ')');

                    countLoops = countLoops + 1;
                    if (countLoops >= maxLoops) {
                        coutOutput = coutOutput.concat('. Run forced to end after 100 iterations.');
                        break;
                    }
                }
            } catch(err) {
                coutOutput = '<i>Syntax error</i>';
            }
        }
        return coutOutput;
    };

    <%= grunt.file.read(hbs_output) %>
}

var loopSimExport = {
    create: function() {
        return new LoopSim();
    }
};
module.exports = loopSimExport;
