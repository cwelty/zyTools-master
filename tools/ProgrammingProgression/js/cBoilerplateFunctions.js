/* exported cBoilerplateFunctions */
'use strict';

const cBoilerplateFunctions = `#include <ctype.h>
#include <stdio.h>
#include <stdlib.h>
#include <stdarg.h>
#include <string.h>
#include <math.h>
{{{headers}}}

#define SYSTEM_MESSAGE_BEGIN "SYSTEM_MESSAGE_BEGIN"
#define SYSTEM_MESSAGE_END "SYSTEM_MESSAGE_END"
#define true 1
#define false 0

char * all_output = 0;
int output_capacity = 0;
const int STRING_BUFFER_SIZE = 2048;

void initialize_output_string() {
  // Check if the string has been initialized already.
  if (all_output != 0)
    return;

  // Initialize the string.
  all_output = (char *) malloc(STRING_BUFFER_SIZE * sizeof(char));
  output_capacity = STRING_BUFFER_SIZE;

  // Don't buffer output.
  setbuf(stdout, NULL);
}

char* trim(char * str) {
  char *end;

  // Trim leading space
  while(isspace(*str)) str++;

  if(*str == 0)  // All spaces?
    return str;

  // Trim trailing space
  end = str + strlen(str) - 1;
  while(end > str && isspace(*end)) end--;

  // Write new null terminator
  *(end+1) = 0;

  return str;
}

void delete_char_at_index(char * str, int index) {
  int length = strlen(str);
  int i = index;
  for (; i < length - 1; ++i)
    str[i] = str[i + 1];
  str[length - 1] = '\\0';
}

void strip_space(char * str) {
  int length = strlen(str);
  int i = 0;
  for (; i < length; ++i) {
    if (str[i] == ' ' || str[i] == '\\n' || str[i] == '\\t') {
      delete_char_at_index(str, i);
      length--;
      i--;
    }
  }
}

void lowercase(char * str) {
  char * temp = (char *) malloc(strlen(str) * sizeof(char));
  char * temp_start = temp;
  strcpy(temp, str);

  for ( ; *temp; ++temp)
    *temp = tolower(*temp);

  strcpy(str, temp_start);
}

void output_override(const char * format, ...) {
  // Initialize the string if necessary.
  initialize_output_string();

  // Create temporary string to hold this output.
  char * new_output = (char *) malloc(STRING_BUFFER_SIZE * sizeof(char));

  // Store generated string into temporary string.
  va_list args;
  va_start (args, format);
  vsnprintf(new_output, STRING_BUFFER_SIZE, format, args);
  va_end (args);

  // Append the new output to the current output.
  strncat(all_output, new_output, STRING_BUFFER_SIZE - strlen(all_output) - 1);
}

char* zyGetOutput() {
  // Initialize the string if necessary.
  initialize_output_string();

  char* tmp = (char *) malloc(STRING_BUFFER_SIZE * sizeof(char));
  strcpy(tmp, all_output);

  // Reset output string.
  // free(all_output);
  all_output = (char *) malloc(STRING_BUFFER_SIZE * sizeof(char));
  all_output[0] = '\\0';

  return tmp;
}

void zyAssertOutput(char * asserted_output, const char * hint, int stripspace, int case_insensitive, int exit_on_fail, int suppress) {
  char tmp[STRING_BUFFER_SIZE];
  strcpy(tmp, asserted_output);

  // Strip spaces if necessary.
  if (stripspace) {
    char * temp = all_output;
    // all_output = trim(all_output);
    strip_space(all_output);
    strip_space(tmp);
  }

  // Lowercase strings if necessary.
  if (case_insensitive) {
    lowercase(all_output);
    lowercase(tmp);
  }

  // Swap out empty output for "(none)".
  if (strcmp(tmp, "") == 0) {
    strcpy(tmp, "(none)");
  }
  if (strcmp(all_output, "") == 0) {
    all_output = "(none)";
  }

  // Check the output for correctness.
  if (strcmp(tmp, all_output) != 0) {
    if (!suppress)
      printf("%sFAIL%s\\nExpected output:\\nSPANBEGIN%sSPANEND\\nYour output:\\nSPANBEGIN%sSPANEND%s\\n", SYSTEM_MESSAGE_BEGIN, hint, tmp,
              all_output, SYSTEM_MESSAGE_END);
    else
      printf("%sFAIL%s\\nYour output:\\nSPANBEGIN%sSPANEND%s\\n", SYSTEM_MESSAGE_BEGIN, hint, all_output, SYSTEM_MESSAGE_END);

    if (exit_on_fail) {
      printf("%sEXIT%s", SYSTEM_MESSAGE_BEGIN, SYSTEM_MESSAGE_END);
      exit(1);
    }
  } else {
    printf("%sPASS%s\\nExpected output:\\nSPANBEGIN%sSPANEND%s\\n", SYSTEM_MESSAGE_BEGIN, hint, tmp, SYSTEM_MESSAGE_END);
  }

  // Reset output string.
  // free(all_output);
  all_output = (char *) malloc(STRING_BUFFER_SIZE * sizeof(char));
  all_output[0] = '\\0';
}

void zyAssert(int assertion, const char * hint, int exit_on_fail) {
  if (!assertion) {
    printf("%sFAIL%s%s\\n", SYSTEM_MESSAGE_BEGIN, hint, SYSTEM_MESSAGE_END);

    if (exit_on_fail)
      exit(1);
  } else {
    printf("%sPASS%s%s\\n", SYSTEM_MESSAGE_BEGIN, hint, SYSTEM_MESSAGE_END);
  }
}

void zyAssertValue(double asserted_value, double actual_value, const char * hint, int exit_on_fail) {
  if (!(asserted_value == actual_value)) {
    printf("%sFAIL%s\\nExpected value:\\n%f\\n\\nYour value:\\n%f%s", SYSTEM_MESSAGE_BEGIN, hint, asserted_value, actual_value,
            SYSTEM_MESSAGE_END);

    if (exit_on_fail)
      exit(1);
  } else {
    printf("%sPASS%s\\nExpected value:\\n%f%s\\n", SYSTEM_MESSAGE_BEGIN, hint, asserted_value, SYSTEM_MESSAGE_END);
  }
}

void zyAssertIntValue(int asserted_value, int actual_value, const char * hint, int exit_on_fail, int suppress) {
  if (!(asserted_value == actual_value)) {
    if (!suppress)
      printf("%sFAIL%s\\nExpected value: SPANBEGIN%dSPANEND\\nYour value:     SPANBEGIN%dSPANEND%s", SYSTEM_MESSAGE_BEGIN, hint,
              asserted_value, actual_value, SYSTEM_MESSAGE_END);
    else
      printf("%sFAIL%s\\nYour value: SPANBEGIN%dSPANEND%s", SYSTEM_MESSAGE_BEGIN, hint, actual_value, SYSTEM_MESSAGE_END);

    if (exit_on_fail) {
      printf("%sEXIT%s", SYSTEM_MESSAGE_BEGIN, SYSTEM_MESSAGE_END);
      exit(1);
    }
  } else {
    printf("%sPASS%s\\nExpected value: SPANBEGIN%dSPANEND%s\\n", SYSTEM_MESSAGE_BEGIN, hint, asserted_value, SYSTEM_MESSAGE_END);
  }
}

void zyAssertDoubleValue(double asserted_value, double actual_value, double epsilon, const char * hint, int exit_on_fail, int suppress) {
  if (fabs(asserted_value - actual_value) > epsilon) {
    if (!suppress)
      printf("%sFAIL%s\\nExpected value: SPANBEGIN%fSPANEND\\nYour value:     SPANBEGIN%fSPANEND%s", SYSTEM_MESSAGE_BEGIN, hint,
              asserted_value, actual_value, SYSTEM_MESSAGE_END);
    else
      printf("%sFAIL%s\\nYour value: SPANBEGIN%fSPANEND%s", SYSTEM_MESSAGE_BEGIN, hint, actual_value, SYSTEM_MESSAGE_END);

    if (exit_on_fail) {
      printf("%sEXIT%s", SYSTEM_MESSAGE_BEGIN, SYSTEM_MESSAGE_END);
      exit(1);
    }
  } else {
    printf("%sPASS%s\\nExpected value: SPANBEGIN%fSPANEND%s\\n", SYSTEM_MESSAGE_BEGIN, hint, asserted_value, SYSTEM_MESSAGE_END);
  }
}

void zyTerminate() {
  printf("%sEND%s", SYSTEM_MESSAGE_BEGIN, SYSTEM_MESSAGE_END);
}

void flush_output() {
  // Initialize the string if necessary.
  initialize_output_string();

  printf("%s", all_output);
}

#define printf output_override

{{{preProgramDefinitions}}}

{{{returnType}}} {{{functionName}}} {{{parameters}}} {{{functionPrefix}}} {{{studentCode}}} {{{functionPostfix}}}

{{{returnType}}} {{{solutionFunctionName}}} {{{parameters}}} {{{functionPrefix}}} {{{solutionCode}}} {{{functionPostfix}}}

{{{tests}}}
`;
