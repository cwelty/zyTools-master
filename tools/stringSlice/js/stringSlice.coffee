Handlebars.registerHelper('range', (n, block) ->
  accum = ''
  accum += block.fn(i) for i in [0..n]
  return accum
)

class StringSlice
    constructor: () ->
        # The "init" function is required, and accepts three parameters:
        #   id - The id of the div in which this tool should be rendered.
        #   eventManager - An object from which the tool can post events, e.g. eventManager.postEvent(event)
        #   options - an optional dictionary of options used to configure this tool.
        #             Use of the options dictionary can be tested by using the 
        #             --options command line parameter with grunt, and specifying the 
        #             path to a file containing options. For example:
        #             grunt --tool=stringSlice --options=tools/stringSlice/options.js
        @init = (id, eventManager, options) ->
            @name = '<%= grunt.option("tool") %>'
            @id = id
            @eventManager = eventManager

            css = '<style><%= grunt.file.read(css_filename) %></style>'
            
            html = @[@name]['stringSlicePython2']({ id: @id, name: @name })
            
            if options and options['lang']
                if options['lang'] == 'python2'
                    html = @[@name]['stringSlicePython2']({ id: @id, name: @name })
                else
                    html = @[@name]['stringSlicePython3']({ id: @id, name: @name })
            
            $('#' + @id).html(css + html)

            @updateOutput()

            $(@jID('string')).on 'input', () =>
              @updateOutput()
              @activityCompleteRecording()

            $(@jID('slice1')).on 'input', () =>
              @updateOutput()
              @activityCompleteRecording()

            $(@jID('slice2')).on 'input', () =>
              @updateOutput()
              @activityCompleteRecording()
              
        @activityCompleteRecording = () ->
          if not @beenSubmitted
              event = {
                part: 0,
                complete: true,
                metadata: {
                  event: 'string slice tool used'
                }
              }

              @eventManager.postEvent(event)
        
          @beenSubmitted = true
            
        @jID = (s) ->
          return '#' + @name + s + @id

        @updateOutput = () =>
          parseIndex = (index) ->
            isInteger = (value) ->
              for i in [0..value.length-1]
                unless (!isNaN(parseInt(value[i],10)) && (parseFloat(value[i]) == parseInt(value[i],10))) ||
                       (value[i] == '-' && i == 0)
                  return false
              return true

            if index == ''
              return "None"
            else if isInteger index
              if index.split('.').length > 1
                return "Error"
              else
                return parseInt(index)
            else
              return "Error"

          str = $j(@jID('string')).val()
          for i in [0..10]
            $j(@jID('char'+i)).removeClass('shown-char').html((str.substr(i,1)))
            $j(@jID('arrow'+i)).html('')
            $j(@jID('arrowName'+i)).html('')
          $j(@jID('specialNotes')).html('')

          ind1 = parseIndex($j(@jID('slice1')).val())
          ind2 = parseIndex($j(@jID('slice2')).val())

          if "Error" in [ind1, ind2]
            $j(@jID('output')).html("<span style='color: red;'>TypeError: \
                                     slice indices must be integers or None.</span>")
            $j(@jID('specialNotes')).html('')
          else
            convertIndex = (i, len) ->
              i = if i > len then len else i
              if i < -len
                i = 0
              else
                i = if i < 0 then len+i else i
              return i

            if ind1 == "None"
              ind1 = 0
            else
              ind1 = convertIndex(ind1, str.length)
            if ind2 == "None"
              ind2 = str.length
            else
              ind2 = convertIndex(ind2, str.length)

            $(@jID('arrow'+(ind1))).html('&uarr;')
            $(@jID('arrow'+(ind2))).html('&uarr;')
            $(@jID('arrowName'+(ind1))).html('start')
            $(@jID('arrowName'+(ind2))).html('end')

            if ind1 >= ind2
              $j(@jID('output')).html("''")
              if $j(@jID('slice1')).val() > $j(@jID('slice2')).val()
                $j(@jID('specialNotes')).html('The start position is greater than or equal to the end position, \
                                               which will always return an empty string.')
              if ind1 == ind2
                $(@jID('arrowName'+ind1)).html('start<br />end')
            else
              $j(@jID('output')).html("'"+str.substr(ind1, ind2-ind1) + "'")
              $j(@jID('specialNotes')).html('')
              for i in [ind1..ind2-1]
                $j(@jID('char'+i)).addClass('shown-char')

      # This is more required boilerplate.
        `<%= grunt.file.read(hbs_output) %>`

# This object must contain one function, "create", that returns a new object
# representing this tool.
stringSliceExport = {
    create: () -> 
        return new StringSlice()
} 
window.stringSliceExport = stringSliceExport

$j = jQuery
module.exports = stringSliceExport
