## zydeBase

This tool displays a zyDE editor and console, and is used by the `zyde` and `homeworkSystem` tools.

The tool is used by first requiring it, creating it, and then initializing it. The
init function has the following signature:

`function init(containerId, options, runPressedCallback)`

The parameters are as follows:

* `containerId` - The HTML id of the DOM element where the zyDE base should insert itself. The element must already be present in the DOM.
* `options` - A dictionary of options.
* `runPressedCallback` - A callback that is invoked when the user presses the run button. The callback has the following signature:

  `function runPressedCallback(fileContents, mainFilename, input, reenableCallback)`

  The parameters to the callback are as follows:

  * `fileContents` - A list of the latest content of all files.
  * `mainFilename` - The name of the main file.
  * `input` - The contents of the input textarea.
  * `reenableCallback` - A callback to be invoked when the run button on the zyDE should be re-enabled.


* |zyde_host| is a string. Optionally override the default zyDE host URL
* |useHomePageStyling| is a boolean. Optionally use styling for the home page.