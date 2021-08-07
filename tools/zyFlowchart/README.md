## zyFlowchart

Accept text-based code, converted to a zyFlowchart program, and support interactive simulation and editing of the program.

Options:
- @param {String} code The code to convert to a zyFlowchart program.
- @param {String} [input=null] The input to the program.
- @param {Boolean} [isEditable=false] Whether the pseudocode is editable.
- @param {Boolean} [isExecutable=false] Whether the program should be executable. Set to true if an input is defined.
- @param {String} [languagesToShow='flowchart'] Which languages to show to the user. Valid options: 'flowchart', 'pseudocode', and 'both'.
- @param {String} [portLanguage=null] Which language to port Coral to. Valid option: 'C++'.
