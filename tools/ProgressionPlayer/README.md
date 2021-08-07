## Progression player

Play a progression-style activity from a JSON-defined progression.

Includes two options:
* progression {Object} JSON structure that models the progression. See Progression.js in ProgressionUtilities zyTool for details. See COD_Datapath.js for an example.
* inBuilderMode {Boolean} Whether this ProgressionPlayer instance was loaded by the ProgressionBuilder. Default: false
* showExamResponse {Boolean} Whether to render the |question| and |response|. Default: false
* question {Object} A question to render. Only used when showExamResponse is true.
* response {Array} of {Object} Student's response to the question. Only used when showExamResponse is true.