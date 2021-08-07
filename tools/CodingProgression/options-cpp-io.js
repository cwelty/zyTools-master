{
    language: 'cpp',
    levels: [
        {
            explanation: 'That was a quick input demo.',
            prompt: 'Complete the program to use the variable readData to read each line in ${infilename}.txt and output the contents to standard output.',
            solution: 'getline(inFS, readData);\n   cout << readData << endl;',
            program: [
                {
                    filename: 'main.cpp',
                    main: true,
                    code: {
                        prefix: `#include <iostream>
#include <fstream>
#include <string>
using namespace std;

int main() {
   ifstream inFS;
   string readData;

   inFS.open("\${infilename}.txt");

   if (!inFS.is_open()) {
      cout << "Could not open file '\${infilename}.txt'" << endl;
      return 0;
   }

   cout << "File contents:" << endl;
   while (!inFS.eof()) {
      `,
                        postfix: `
   }

   inFS.close();
   return 0;
}`,
                    }
                },
                {
                    filename: '${infilename}.txt',
                    inputFile: true,
                    code: 'These are the contents\n of ${infilename}.txt file.',
                }
            ],
            parameters: `infilename = pick_from([ 'input', 'infile', 'data' ])`,
        },

        {
            explanation: 'That was a quick output demo',
            prompt: 'Complete the program to write "${sentence}", then a newline, to the file ${outfilename}.txt.',
            outputFilenames: [ '${outfilename}.txt' ],
            solution: 'outFS << "${sentence}" << endl;',
            program: {
                prefix: `#include <iostream>
#include <fstream>
using namespace std;

int main() {
   ofstream outFS;

   outFS.open("\${outfilename}.txt");

   if (!outFS.is_open()) {
      cout << "Could not open file '\${outfilename}.txt'" << endl;
      return 0;
   }
   `,
                postfix: `
   outFS.close();
   return 0;
}`,
            },
            parameters: `outfilename = pick_from([ 'outfile', 'output', 'data' ])
sentence = pick_from([ 'Hello', 'Hey there', 'Howdy' ]) + ', ' + pick_from([ 'world', 'friend', 'brother' ]) + '!'`,
        },

        {
            explanation: 'That was a quick input-output demo with multiple inputs.',
            prompt: 'Complete the program output the contents of ${infilename}.txt to a file named ${outfilename}.txt.',
            outputFilenames: [ '${outfilename}.txt', 'test.txt' ],
            solution: `getline(inFS, readData);
outFS << readData << endl;`,
            program: [
                {
                    filename: 'main.cpp',
                    main: true,
                    code: {
                        prefix: `#include <iostream>
#include <fstream>
using namespace std;

int main() {
   ofstream outFS;
   ifstream inFS;
   string readData;
   string inputString;

   outFS.open("\${outfilename}.txt");
   if (!outFS.is_open()) {
      cout << "Could not open file '\${outfilename}.txt'" << endl;
      return 0;
   }

   inFS.open("\${infilename}.txt");
   if (!inFS.is_open()) {
      cout << "Could not open file '\${infilename}.txt'" << endl;
      return 0;
   }

   while (!inFS.eof()) {
      `,
                        postfix: `
   }

   inFS.close();
   outFS.close();

   cin >> inputString;

   outFS.open("test.txt");
   outFS << "Testing 2 output files: " << inputString << endl;

   return 0;
}`,
                    }
                },
                {
                    filename: '${infilename}.txt',
                    inputFile: true,
                    code: '${input_file1}\n\n${input_file2}',
                }
            ],
            parameters: `outfilename = pick_from(['outfile', 'output', 'data'])
infilename = pick_from(['input', 'infile', 'data'], [outfilename])
input_file1 = pick_from_range(1000,9999)
input_file2 = pick_from(['Hello', 'Hey there', 'Howdy']) + ', ' + pick_from(['world', 'friend', 'brother']) + '!'`,
            input: [ 'Input1', 'Input2' ],
        }
    ]
}
