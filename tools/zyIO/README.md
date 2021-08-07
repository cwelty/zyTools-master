## zyIO template

The zyIO template is designed to be pulled into another tool.

In addition to the containerID, other tool must specify options to the zyIO template:

* isInput - boolean - true will instantiate an input element, false will instantiate an output element.

* inputs - list of IO objects with the following properties:
  * type - zyIO.type.BIT or zyIO.type.VALUE
  * name - string - label that will appear for this element
  * syncUserVariable - function - The value coming from the ui element is passed in and the user can use this to keep their variables in sync.
  * outsideUpdate - function - The value that is returned will be sent to the ui element. Used when the outside variable has been changed in code.

* input - string - name of the decimal input value.

If isInput is false you can specify the output options

* outputs - list of IO objects with the following properties:
  * type - zyIO.type.BIT or zyIO.type.VALUE
  * name - string - label that will appear for this element
  * syncUserVariable - function - The value coming from the ui element is passed in and the user can use this to keep their variables in sync.
  * outsideUpdate - function - The value that is returned will be sent to the ui element. Used when the outside variable has been changed in code.
  
* output - string - name of the decimal output value.
And finally, finishedCallback - optional, a function to be called when tool init has completed.