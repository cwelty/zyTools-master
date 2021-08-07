class WhileLoopPrint
  constructor: () ->
    class Q
      constructor: (params) ->
        @initVal = params[0]
        @condOp = params[1]
        @condVal = params[2]
        @iterOp = params[3]
        @iterVal = params[4]
        @ans = params[5]

    class Questions
      constructor: (categories) ->
        @questions = {}
        @questions[c] = [] for c in categories

      addQuestion: (category, params) ->
        @questions[category].push(new Q(params))

      getRandomQuestion: (category, used) ->
        rand = Math.floor(Math.random() * @questions[category].length)
        q = @questions[category][rand]
        return if q not in used then q else @getRandomQuestion(category, used)

    @States = {
      init:       0
      playing:    1
      animating:  2
      won:        3
      lost:       4
      gameover:   5
    }

    # The "init" function is required, and accepts three parameters:
    #   id - The id of the div in which this tool should be rendered.
    #   eventManager - An object from which the tool can post events, e.g. eventManager.postEvent(event)
    #   options - an optional dictionary of options used to configure this tool.
    #             Use of the options dictionary can be tested by using the
    #             --options command line parameter with grunt, and specifying the
    #             path to a file containing options. For example:
    #             grunt --tool=whileLoopPrint --options=tools/whileLoopPrint/options.js
    @init = (id, eventManager, options) ->
      @name = '<%= grunt.option("tool") %>'
      @id = id
      @eventManager = eventManager
      @num_levels = 6
      @questions = null
      @used = []
      @current_question = null
      @current_level = @level(0)
      @current_iteration = @iteration(0)
      @current_state = @state(@States.init)

      @generateView().generateQuestions().generateLevel()
      
      self = this
      $('#' + self.id).click( () -> 
        if not self.beenClicked
          self.beenClicked = true
              
          event = {
              part: 0,
              complete: true,
              metadata: {
                  event: 'whileLoopPrint clicked'
              }
          }

          self.eventManager.postEvent(event)
      )

    @generateView = () ->
      css = '<style><%= grunt.file.read(css_filename) %></style>'
      html = this[@name]['whileLoopPrint']({ name: @name, id: @id })
      $('#' + @id).html(css + html)

      $(@jID('startButton')).on 'click', () =>
        @StartButtonClick()
      $(@jID('stopButton')).on 'click', () =>
        @StopButtonClick()
      $(@jID('nextButton')).on 'click', () =>
        @NextButtonClick()
      $(@jID('outputNum')).on 'click', () =>
        @NumClick()
      $(@jID('outputDone')).on 'click', () =>
        @DoneClick()
      this

    @generateQuestions = () ->
      @questions = new Questions(['simple', 'easy', 'hard'])
      @questions.addQuestion('simple', ['0', '<', '3', '+', '1', ['0', '1', '2']])
      @questions.addQuestion('simple', ['1', '<', '5', '+', '1', ['1', '2', '3', '4']])
      @questions.addQuestion('easy', ['3', '>=', '0', '-', '1', ['3', '2', '1', '0']])
      @questions.addQuestion('easy', ['0', '<=', '4', '+', '1', ['0', '1', '2', '3', '4']])
      @questions.addQuestion('easy', ['2', '<', '5', '+', '2', ['2', '4']])
      @questions.addQuestion('easy', ['5', '>', '5', '+', '1', []])
      @questions.addQuestion('easy', ['0', '<', '10', '+', '4', ['0', '4', '8']])
      @questions.addQuestion('easy', ['2', '>=', '-1', '-', '1', ['2', '1', '0', '-1']])
      @questions.addQuestion('easy', ['0', '>=', '-3', '-', '2', ['0', '-2']])
      @questions.addQuestion('easy', ['-2', '<=', '6', '+', '3', ['-2', '1', '4']])
      @questions.addQuestion('hard', ['100', '>=', '50', '/', '2', ['100', '50']])
      @questions.addQuestion('hard', ['10', '<=', '50', '*', '2', ['10', '20', '40']])
      @questions.addQuestion('hard', ['1', '<', '500', '*', '100', ['1', '100']])
      @questions.addQuestion('hard', ['128', '>', '16', '/', '2', ['128', '64', '32']])
      @questions.addQuestion('hard', ['3', '<', '27', '*', '3', ['3', '9']])
      this

    @generateLevel = () ->
      question_type = ''
      level = @level()
      if level == 0
        question_type = 'simple'
      else if level < @num_levels / 2
        question_type = 'easy'
      else
        question_type = 'hard'

      @current_question = @questions.getRandomQuestion(question_type, @used)
      @used.push(@current_question)

      $j(@jID('initVal')).text(@current_question.initVal)
      $j(@jID('condOp')).text(@current_question.condOp)
      $j(@jID('condVal')).text(@current_question.condVal)
      $j(@jID('iterOp')).text(@current_question.iterOp)
      $j(@jID('iterVal')).text(@current_question.iterVal)
      $j(@jID('num')).text(@current_question.initVal)
      this

    @level = (lvl...) ->
      if lvl.length > 0
        @current_level = lvl[0]
      else
        return @current_level

    @iteration = (iter...) ->
      if iter.length > 0
        @current_iteration = iter[0]
      else
        return @current_iteration

    @jID = (s) ->
      return '#' + @name + s + @id

    @show = (obj) ->
      obj.removeClass('hidden')
      obj.removeClass('faded')
      obj.addClass('shown')

    @hide = (obj) ->
      obj.removeClass('shown')
      obj.removeClass('faded')
      obj.addClass('hidden')

    @fade = (obj) ->
      obj.removeClass('shown')
      obj.removeClass('hidden')
      obj.addClass('faded')

    @state = (state...) ->
      if state.length == 0
        return @current_state

      $j(@jID("progressBar")).
          css("width", @level()*parseInt($j(@jID("statusBar")).css("width"))/ @num_levels);
      switch state[0]
        when @States.init
          $j(@jID("progressBar")).css("width", 0)
          $j(@jID('startButton')).show();
          $j(@jID('stopButton')).hide();
          @fade($j(@jID("nextButton")))
          @fade($j(@jID("outputNum")))
          @fade($j(@jID("outputDone")))
          $j(@jID("feedback")).text('')
        when @States.playing
          $j(@jID('startButton')).hide();
          $j(@jID('stopButton')).show();
          @fade($j(@jID("nextButton")))
          @show($j(@jID("outputNum")))
          @show($j(@jID("outputDone")))
          $j(@jID("feedback")).text('')
        when @States.animating
          @fade($j(@jID("nextButton")))
          @fade($j(@jID("outputNum")))
          @fade($j(@jID("outputDone")))
          $j(@jID("feedback")).text('')
        when @States.won
          @show($j(@jID("nextButton")))
          @fade($j(@jID("outputNum")))
          @fade($j(@jID("outputDone")))
          @setFeedback('Correct.', true)
        when @States.lost
          @show($j(@jID("nextButton")))
          @fade($j(@jID("outputNum")))
          @fade($j(@jID("outputDone")))
          @setFeedback('Oops.', false)
        when @States.gameover
          $j(@jID("startButton")).hide()
          $j(@jID("stopButton")).show()
          @fade($j(@jID("nextButton")))
          @fade($j(@jID("outputNum")))
          @fade($j(@jID("outputDone")))
          @setFeedback('Done.', true)
        else
          @state(@States.init)

      @current_state = state[0]

    @setFeedback = (str, correct) ->
      element = $j(@jID('feedback'))
      if correct
        element.removeClass('feedback-incorrect')
        element.addClass('feedback-correct')
      else
        element.removeClass('feedback-correct')
        element.addClass('feedback-incorrect')
      element.text(str)

    @nextLevel = () ->
      if @state() in [@States.init, @States.gameover, @States.playing, @States.animating]
        return
      @iteration(0)
      @clearOutput()
      @generateLevel()
      @state(@States.playing)

    @winLevel = () ->
      @level(@level() + 1)
      if @level() < @num_levels then @state(@States.won) else @state(@States.gameover)

    @loseLevel = () ->
      if @current_question.ans.length == 0
        id = @jID('wrong_out'+@current_question.ans.length).substr(1)
        $j(@jID('monitorScreen')).first().parent().
            append('<span id=\"'+id+'\" class=\"monitor-text-wrong\">Bye.</span>');
        $j('#'+id).first().css('left', '80px').css('top', '12px')
        return
      else
        for i, ind in @current_question.ans
          id = @jID('wrong_out'+ind).substr(1)
          $j(@jID('monitorScreen')).first().parent().
            append('<span id=\"'+id+'\" class=\"monitor-text-wrong\">'+i+'</span>');
          $j('#'+id).first().css('left', 120).css('top', 12+ind*16)

        id = @jID('wrong_outbye').substr(1)
        $j(@jID('monitorScreen')).first().parent().
        append('<span id=\"'+id+'\" class=\"monitor-text-wrong\">Bye.</span>');
        $j('#'+id).first().css('left', 120).css('top', 12+@current_question.ans.length*16)

      @used.splice(@used.indexOf(@current_question), 1)
      @state(@States.lost)

    @clearOutput = () ->
      $j(@jID('out'+i)).remove() for i in [0..@current_question.ans.length];
      $j(@jID('wrong_out'+i)).remove() for i in [0..@current_question.ans.length];
      $j(@jID('wrong_outbye')).remove()

    @nextIteration = () ->
      @iteration(@iteration() + 1)
      $j(@jID('num')).text(@executeIteration())
      @state(@States.playing)

    @executeIteration = () ->
      if @current_question.ans.length == 0
        return @current_question.initVal
      q = @current_question
      return eval q.ans[@iteration()-1] + q.iterOp + q.iterVal

    @check = () =>
      dom = $j(@jID('out'+@iteration()));
      if @iteration() < @current_question.ans.length and dom.text() != 'Bye.'
        @nextIteration();
      else if @iteration() == @current_question.ans.length and dom.text() == 'Bye.'
        @winLevel();
      else
        @loseLevel();


    ### User Interface ###
    ### Use the => (Fat Arrow) operator to allow public methods to utilize @ (this) automatically ###

    @StartButtonClick = () =>
      if @state() != @States.init
        return
      @state(@States.won)
      @used = []
      @nextLevel()

    @StopButtonClick = () =>
      if @state == @States.animating
        return
      @clearOutput()

      @used = []
      @current_question = null
      @current_level = @level(0)
      @current_iteration = @iteration(0)
      @current_state = @state(@States.init)
      @generateLevel()

    @NextButtonClick = () =>
      if @state() in [@States.init, @States.playing, @States.gameover, @States.animating]
        return
      @iteration(0);
      @clearOutput();
      @generateLevel()
      @state(@States.playing)

    @NumClick = () =>
      if @state() != @States.playing
        return
      @state(@States.animating)
      id = @jID('out'+@iteration()).substr(1)
      if @iteration() < @current_question.ans.length
        val = @current_question.ans[@iteration()]
      else
        val = @executeIteration()

      $j(@jID('outputNum')).first().parent().append(
          '<span id=\"'+id+'\" class=\"monitor-text\">'+val+'</span>').first()
      new_dom = $j('#'+id).first()
      new_dom.css('left', $(@jID('outputNum')).position().left + 115).
        css('top', $(@jID('outputNum')).position().top)
      delta_x = $j(@jID('monitorScreen')).first().offset().left - new_dom.offset().left + 10;
      delta_y = $j(@jID('monitorScreen')).first().offset().top - new_dom.offset().top + @iteration()*16;
      new_dom.animate({left: "+="+delta_x, top: "+="+delta_y}, 1000, @check);

    @DoneClick = () =>
      if @state() != @States.playing
        return
      @state(@States.animating)
      id = @jID('out'+@iteration()).substr(1)
      $j(@jID('outputDone')).first().parent().append(
          '<span id=\"'+id+'\" style="float: center;" class=\"monitor-text\">Bye.</span>').first();
      new_dom = $j('#'+id).first()
      new_dom.css('left', $(@jID('outputDone')).position().left + 115).
      css('top', $(@jID('outputDone')).position().top)
      delta_x = $j(@jID('monitorScreen')).first().offset().left - new_dom.offset().left + 10;
      delta_y = $j(@jID('monitorScreen')).first().offset().top - new_dom.offset().top + @iteration()*16;
      new_dom.animate({left: "+="+delta_x, top: "+="+delta_y}, 1000, @check);


    `<%= grunt.file.read(hbs_output) %>`

whileLoopPrintExport = {
  create: () ->
    return new WhileLoopPrint()
}
window.whileLoopPrintExport = whileLoopPrintExport

zip = () ->
  lengthArray = (arr.length for arr in arguments)
  length = Math.min(lengthArray...)
  for i in [0..length]
    arr[i] for arr in arguments

$j = jQuery
module.exports = whileLoopPrintExport
