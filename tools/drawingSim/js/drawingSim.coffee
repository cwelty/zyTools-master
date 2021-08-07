class DrawingSim
  constructor: ->

    InstructionType =
      PenUp: 0
      PenDown: 1
      Forward: 2
      Left: 3

    @init = (id, parentResource, options) ->
      @name = '<%= grunt.option("tool") %>'
      @id = id
      @parentResource = parentResource

      css = '<style><%= grunt.file.read(css_filename) %></style>'
      html = this[@name]['drawingSim'] id: @id, name: @name
      $('#' + @id).html css + html

      @canvas = $(@jID 'drawCanvas')
      @ctx = @canvas[0].getContext '2d'
      @ctx.lineWidth = 3
      @ctx.strokeStyle = '#5780A6'
      @inputState = null
      @pen =
        pen: $(@jID 'pen')
        down: true
        angle: 0
        left: 0
        top: 0

      $('.sortable-list').sortable()

      @reset()

      # Bind press of enter key in the input field to clicking "Enter" button.
      $(@jID 'inputNum').on 'keydown', (key) =>
        if key.keyCode == 13
          $(@jID 'enterButton').click()

      # Bind initial instruction deletion spans
      $('#' + @id + ' .sortable-list span').on 'click', (e) =>
        $(e.target.parentElement).remove()

      # Bind button clicks
      $(@jID 'penUpButton').on 'click', =>
        @penUpClick()
      $(@jID 'penDownButton').on 'click', =>
        @penDownClick()
      $(@jID 'forwardButton').on 'click', =>
        @showInput 'forwardButton'
        @inputState = 'forward'
      $(@jID 'turnButton').on 'click', =>
        @showInput 'turnButton'
        @inputState = 'turn'
      $(@jID 'runButton').on 'click', =>
        @runClick()
      $(@jID 'enterButton').on 'click', =>
        @enterClick()
      $(@jID 'clearButton').on 'click', =>
        @clearClick()

      $('#' + this.id).on 'click', =>
        if not @beenClicked
          event =
            part: 0
            complete: true
            answer: 'drawing sim tool'
            metadata: {
                event: 'drawing sim tool clicked'
            }
          @parentResource.postEvent event
        @beenClicked = true

    @jID = (s) ->
      return "##{@name}#{s}#{@id}"

    @reset = ->
      ### Reset the drawing tool, moving pen back to middle, clearing the canvas, etc. ###
      @pen.down = false
      @pen.angle = 0

      @pen.pen.clearQueue()
      @pen.pen.stop()

      @ctx.clearRect 0, 0, @canvas.width(), @canvas.height()

      # Move pen to middle of canvas
      @pen.pen.css('left', @canvas.position().left + @canvas.width() / 2)
              .css('top', @canvas.position().top + @canvas.height() / 2)
      @pen.left = parseInt @pen.pen.css 'left'
      @pen.top = parseInt @pen.pen.css 'top'

    @showInput = (id) ->
      ### Show the input div and get a number from the user. ###
      getter = $(@jID 'inputGetter')
      destination = $(@jID id)
      if id == 'forwardButton'
        $(@jID 'inputNum' ).val '50'
        $("label[for='#{@name}inputNum#{@id}']").text 'Enter distance to move:'
      else
        $(@jID 'inputNum').val '90'
        $("label[for='#{@name}inputNum#{@id}']").text 'Enter degrees to turn left:'
      getter
        .css('left', destination.position().left+20)
        .css('top', destination.position().top+40)
        .removeClass('hidden')

      $(@jID 'inputNum').focus()

    @addInstruction = (inst, value='') ->
      # Adds an instruction to end of instruction list.
      text = ''
      switch inst
        when InstructionType.PenUp
          text = 'Pen up'
          break
        when InstructionType.PenDown
          text = 'Pen down'
          break
        when InstructionType.Forward
          if value == null
            alert 'Not a valid distance. Enter a number.'
            return
          else
            text = "Forward #{value}"
          break
        when InstructionType.Left
          if value == null
            alert 'Not a valid angle. Enter a number.'
            return
          else
            text = "Left #{value}"
          break
        else
          console.log "Drawing sim tool encountered unknown instruction type: #{inst}"
          @errorManager = require 'zyWebErrorManager'
          @errorManager.postError "Drawing sim tool encountered unknown instruction type: #{inst}"

      $(@jID 'instructionList').append "<li>#{text} <span class=\"delete-instr\">✖</span></li>"
      $(@jID 'instructionList').scrollTop 1e9
      $("##{@id} .sortable-list span").on 'click', (e) =>
        $(e.target.parentElement).remove()

    @moveForward = (distance, draw, angle) ->
      ### Animate drawing a line by drawing small line segments in order. ###
      dx = distance * Math.cos angle*Math.PI/180
      dy = distance * Math.sin angle*Math.PI/180

      # (num_segments = stroke_time / segment_length)
      num_segments = distance * 15                    # Number of small segments to draw, scaled by distance
      segment_length = 5                              # length of individual segments
      stroke_time = num_segments / segment_length     # Time to stroke a single segment

      x_step = dx / (stroke_time / segment_length)    # Change in x-axis of a single segment
      y_step = dy / (stroke_time / segment_length)    # Change in y-axis of a single segment

      draw_line = =>
        ### Callback function to draw each segment ###
        if not draw  # Check if pen is up or down
          return

        curr_left = @pen.pen.offset().left - @canvas.offset().left + @pen.pen.width()/2
        curr_top = @pen.pen.offset().top - @canvas.offset().top

        do @ctx.beginPath
        @ctx.moveTo curr_left, curr_top
        @ctx.lineTo curr_left + x_step, curr_top + y_step
        do @ctx.stroke

      # Draw each segment by first animating the movement of the pen, then executing a callback to
      # draw the segment once moved.
      for _ in [0...stroke_time] by segment_length
        curr_left = @pen.left - @canvas.position().left
        curr_top = @pen.top - @canvas.position().top
        if ((curr_left + x_step <= 0) or (curr_left + x_step >= @canvas.width())) or
           ((curr_top + y_step <= 0) or (curr_top + y_step >= @canvas.height()))
          break
        else
          @pen.pen.animate top: "+=#{y_step}", left: "+=#{x_step}", segment_length, draw_line
          @pen.left += parseFloat x_step
          @pen.top += parseFloat y_step
      return

    @turnLeft = (angle) =>
      return parseInt(@pen.angle) + parseInt(-angle)

    # exported function callbacks.

    @penUpClick = =>
      @addInstruction InstructionType.PenUp

    @penDownClick = =>
      @addInstruction InstructionType.PenDown

    @runClick = =>
      ### Iterate through the array of instructions and execute each one. ###
      @reset()
      insts = $("#{@jID('instructionList')} li").toArray()
      for inst in insts
        instType = inst.innerHTML.split(' ')[0]
        value = inst.innerHTML.split(' ')[1]

        if instType == 'Pen'
          @pen.down = value == 'down'
        else if InstructionType[instType] == InstructionType.Forward
          @moveForward value, @pen.down, @pen.angle
        else if InstructionType[instType] == InstructionType.Left
          @pen.angle = @turnLeft value
        else
          console.log "Drawing sim tool encountered unknown instruction type 2: #{instType}"
          @errorManager = require 'zyWebErrorManager'
          @errorManager.postError "Drawing sim tool encountered unknown instruction type 2: #{instType}"

    @enterClick = =>
      $(@jID 'inputGetter').addClass 'hidden'
      num = parseInt $(@jID 'inputNum').val()
      if not isFinite num
        return null

      if @inputState == 'forward'
        @addInstruction InstructionType.Forward, num
      else
        @addInstruction InstructionType.Left, num

    @clearClick = =>
      @reset()

      # This is more required boilerplate.
    `<%= grunt.file.read(hbs_output) %>`

# This object must contain one function, "create", that returns a new object
# representing this tool.
drawingSimExport = {
  create: () ->
    return new DrawingSim()
}
window.drawingSimExport = drawingSimExport

$j = jQuery
module.exports = drawingSimExport
