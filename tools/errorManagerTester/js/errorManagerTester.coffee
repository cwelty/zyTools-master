class ErrorManagerTester
  constructor: ->
    @init = (id, eventManager, options) ->
      @errorManager = require 'zyWebErrorManager'
      @errorManager.postError 'errorManagerTester: I error\'d out on purpose!'

errorManagerTesterExport= {
  create: () ->
    return new ErrorManagerTester()
}
window.errorManagerTesterExport = errorManagerTesterExport

module.exports = errorManagerTesterExport
