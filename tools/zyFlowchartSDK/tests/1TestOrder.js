'use strict';

/* global runTokenizerTests, runTextualCodeParserTests, runProgramFunctionTests, runExpressionParserTests, runExecutorTests,
          runCppPortTests */

$(document).ready(() => {
    runTokenizerTests();
    runTextualCodeParserTests();
    runProgramFunctionTests();
    runExpressionParserTests();
    runExecutorTests();
    runCppPortTests();
});
