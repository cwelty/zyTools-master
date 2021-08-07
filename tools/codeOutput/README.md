## Code output

This tool has 3 options:
    * |language| - required string that specifies the language used.
    * |levels| - required array of Objects.  For historic reasons, also supports |questions|. Each Object contains:
        * |template| - required string
        * |parameters| - required Object that contains arrays.
        * |explanation| - optional string.
        * |input| - optional string
        * |outputFilename| - Optional name of the output file that the tool will check against.
    * |highlightNew| - optional boolean Whether to highlight lines of code that contain "New".
