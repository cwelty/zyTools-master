/* exported cppBoilerplate */
'use strict';

const cppBoilerplate = `#include <iostream>
#include <sstream>
#include <stdlib.h>
#include <math.h>
{{{headers}}}

using namespace std;

#define SYSTEM_MESSAGE_BEGIN "SYSTEM_MESSAGE_BEGIN"
#define SYSTEM_MESSAGE_END "SYSTEM_MESSAGE_END"

namespace std {
  stringstream output_override;
}

string all_output;

void print_output() {
  cout << output_override.str() << endl;
}

void flush_output() {
  cout << SYSTEM_MESSAGE_BEGIN << "OUTPUT" << output_override.str() << SYSTEM_MESSAGE_END << endl;
}

void trim(string & str) {
  if (str.size() == 0)
    return;

  unsigned num_before = 0;
  for (unsigned i = 0; i < str.size(); ++i) {
    if (str[i] == '\\n' || str[i] == ' ')
      num_before++;
    else
      break;
  }
  str = str.substr(num_before);

  unsigned num_after = 0;
  for (unsigned i = str.size() - 1; i >= 0; --i) {
    if (str[i] == '\\n' || str[i] == ' ')
      num_after++;
    else
      break;
  }
  str = str.substr(0, str.size() - num_after);
}

string strip_space(string str) {
  string s = "";
  for (unsigned i = 0; i < str.size(); ++i)
    if (str[i] != ' ' && str[i] != '\\n' && str[i] != '\\t')
      s += str[i];

  return s;
}

void lowercase(string & str) {
  for (unsigned i = 0; i < str.size(); ++i) {
    str[i] = tolower(str[i]);
  }
}

string zyGetOutput() {

  // retrieve the output from the stringstream object
  string output = output_override.str();

  // Append the latest output to the output string.
  all_output += output;

  // clear the stringstream buffer
  output_override.str("");

  return output;
}

void zyAssertOutput(string asserted_output, string hint, bool stripspace, bool case_insensitive, bool exit_on_fail, bool suppress) {
  string output = zyGetOutput();

  // strip spaces if necessary
  if (stripspace) {
    output = strip_space(output);
    asserted_output = strip_space(asserted_output);
  }

  // lowercase strings if necessary
  if (case_insensitive) {
    lowercase(asserted_output);
    lowercase(output);
  }

  // Swap out empty output for "(none)".
  string _asserted_output = asserted_output.compare("") == 0 ? "(none)" : asserted_output;

  // check the output for correctness
  if (output != asserted_output) {
    cout << SYSTEM_MESSAGE_BEGIN << "FAIL" << hint << "\\nExpected output:\\nSPANBEGIN" << _asserted_output
         << "SPANEND\\nYour output:\\nSPANBEGIN" << output << "SPANEND" << SYSTEM_MESSAGE_END << endl;

    if (exit_on_fail) {
      cout << SYSTEM_MESSAGE_BEGIN << "EXIT" << SYSTEM_MESSAGE_END;
      exit(1);
    }
  } else {
    cout << SYSTEM_MESSAGE_BEGIN << "PASS" << hint << "\\nExpected output:\\nSPANBEGIN" << _asserted_output << "SPANEND"
         << SYSTEM_MESSAGE_END << endl;
  }

  // clear the stringstream buffer
  output_override.str("");
}

void zyAssert(bool assertion, string hint, bool exit_on_fail = false) {
  if (!assertion) {
    cout << SYSTEM_MESSAGE_BEGIN << "FAIL" << hint << SYSTEM_MESSAGE_END << endl;

    if (exit_on_fail)
      exit(1);
  } else {
    cout << SYSTEM_MESSAGE_BEGIN << "PASS" << hint << SYSTEM_MESSAGE_END << endl;
  }
}

void zyAssertValue(double asserted_value, double actual_value, string hint, bool exit_on_fail) {
  if (!(asserted_value == actual_value)) {
    cout << SYSTEM_MESSAGE_BEGIN << "FAIL" << hint << "\\nExpected value:\\n" << asserted_value << "\\n\\nYour value:\\n" << actual_value
         << SYSTEM_MESSAGE_END << endl;

    if (exit_on_fail)
      exit(1);
  } else {
    cout << SYSTEM_MESSAGE_BEGIN << "PASS" << hint << "\\nExpected value:\\n" << asserted_value << SYSTEM_MESSAGE_END << endl;
  }
}

void zyAssertIntValue(int asserted_value, int actual_value, string hint, bool exit_on_fail, bool suppress) {
  if (!(asserted_value == actual_value)) {
    if (!suppress)
      cout << SYSTEM_MESSAGE_BEGIN << "FAIL" << hint << "\\nExpected value:\\nSPANBEGIN" << asserted_value
           << "SPANEND\\nYour value:\\nSPANBEGIN" << actual_value << "SPANEND" << SYSTEM_MESSAGE_END << endl;
    else
      cout << SYSTEM_MESSAGE_BEGIN << "FAIL" << hint << "\\nYour value:\\nSPANBEGIN" << actual_value << "SPANEND"
           << SYSTEM_MESSAGE_END << endl;

    if (exit_on_fail) {
      cout << SYSTEM_MESSAGE_BEGIN << "EXIT" << SYSTEM_MESSAGE_END;
      exit(1);
    }
  } else {
    cout << SYSTEM_MESSAGE_BEGIN << "PASS" << hint << "\\nExpected value:\\nSPANBEGIN" << asserted_value << "SPANEND"
         << SYSTEM_MESSAGE_END << endl;
  }
}

void zyAssertDoubleValue(double asserted_value, double actual_value, double epsilon, const char * hint, int exit_on_fail, int suppress) {
  if (fabs(asserted_value - actual_value) > epsilon) {
    if (!suppress) {
      cout << SYSTEM_MESSAGE_BEGIN
           << "FAIL"
           << hint
           << "\\nExpected value: SPANBEGIN"
           << asserted_value
           << "SPANEND\\nYour value:     SPANBEGIN"
           << actual_value
           << "SPANEND"
           << SYSTEM_MESSAGE_END;
    } else {
      cout << SYSTEM_MESSAGE_BEGIN
           << "FAIL"
           << hint
           << "\\nYour value: SPANBEGIN"
           << actual_value
           << "SPANEND"
           << SYSTEM_MESSAGE_END;
    }

    if (exit_on_fail) {
      cout << SYSTEM_MESSAGE_BEGIN
           << "EXIT"
           << SYSTEM_MESSAGE_END;
      exit(1);
    }
  } else {
    cout << SYSTEM_MESSAGE_BEGIN
         << "PASS"
         << hint
         << "\\nExpected value: SPANBEGIN"
         << asserted_value
         << "SPANEND"
         << SYSTEM_MESSAGE_END
         << "\\n";
  }
}

void zyAssertValue(string asserted_value, string actual_value, string hint, bool exit_on_fail) {
  if (asserted_value.compare(actual_value) != 0) {
    cout << SYSTEM_MESSAGE_BEGIN << "FAIL" << hint << "\\nExpected value:\\n" << asserted_value << "\\n\\nYour value:\\n" << actual_value
         << SYSTEM_MESSAGE_END << endl;

    if (exit_on_fail)
      exit(1);
  } else {
    cout << SYSTEM_MESSAGE_BEGIN << "PASS" << hint << "\\nExpected value:\\n" << asserted_value << SYSTEM_MESSAGE_END << endl;
  }
}

void zyTerminate() {
  cout << SYSTEM_MESSAGE_BEGIN << "END" << SYSTEM_MESSAGE_END << endl;
}

#define cout output_override

{{{preProgramDefinitions}}}

{{{testFunctionReturns}}} testStudentCode({{testFunctionParameters}}) {
{{{studentCode}}}{{{postfix}}}
}

{{{testFunctionReturns}}} testSolutionCode({{testFunctionParameters}}) {
{{{solutionCode}}}{{{postfix}}}
}

{{{main}}}
{{{tests}}}
{{{returnStatement}}}
`;
