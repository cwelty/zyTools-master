{
    language:  'cpp',
    levels: [
        {
            explanation: 'That was a quick input demo.',
            template: [
                {
                    filename: 'inputFile.txt',
                    program: '${input_file1}\n\n${input_file2}',
                },
                {
                    filename: 'main.cpp',
                    main: true,
                    program: `#include <iostream>
#include <fstream>
#include <string>
using namespace std;

int main() {
    ifstream inFS;
    string readData;
    ofstream outFS;

    inFS.open("inputFile.txt");

    cout << "File contents:" << endl;
    while (!inFS.eof()) {
        getline(inFS, readData);
        cout << readData << endl;
    }

    inFS.close();

    return 0;
}`,
                },
            ],
            parameters: `input_file1 = pick_from_range(1000,9999)
input_file2 = pick_from([ 'Hello', 'Hey there', 'Howdy' ]) + ', ' + pick_from([ 'world', 'friend', 'brother' ]) + '!'`,
        },

        {
            explanation: 'That was a quick output demo.',
            outputFilename: 'outFile.txt',
            template: `#include <iostream>
#include <fstream>
using namespace std;

int main() {
   ofstream outFS;

   outFS.open("outFile.txt");

   if (!outFS.is_open()) {
      cout << "Could not open file 'outFile.txt'" << endl;
      return 0;
   }

   outFS << "\${outfile1}" << endl << endl << "\${outfile2}" << endl;
   outFS.close();
   return 0;
}`,
            parameters: `outfile1 = pick_from_range(1000,9999)
outfile2 = pick_from([ 'Hello', 'Hey there', 'Howdy' ]) + ', ' + pick_from([ 'world', 'friend', 'brother' ]) + '!'`
        },

        {
            explanation: 'That was a quick input-output demo.',
            outputFilename: '${outFilename}.txt',
            template: [
                {
                    filename: '${inFilename}.txt',
                    inputFile: true,
                    program: '${input_file1}\n\n${input_file2}',
                },
                {
                    filename: 'main.cpp',
                    main: true,
                    program: `#include <iostream>
#include <fstream>
using namespace std;

int main() {
   ofstream outFS;
   ifstream inFS;
   string readData;

   outFS.open("\${outFilename}.txt");
   if (!outFS.is_open()) {
      cout << "Could not open file 'outFile.txt'" << endl;
      return 0;
   }

   inFS.open("\${inFilename}.txt");
   if (!inFS.is_open()) {
      cout << "Could not open file 'inputFile.txt'" << endl;
      return 0;
   }

   outFS << "Input file had:" << endl;
   while (!inFS.eof()) {
      getline(inFS, readData);
      outFS << readData << endl;
   }

   inFS.close();
   outFS.close();
   return 0;
}`,
                }
            ],
            parameters: `inFilename = pick_from([ 'input', 'in', 'info' ])
outFilename = pick_from([ 'output', 'data', 'processed' ])
input_file1 = pick_from_range(1000,9999)
input_file2 = pick_from([ 'Hello', 'Hey there', 'Howdy' ]) + ', ' + pick_from([ 'world', 'friend', 'brother' ]) + '!'`
        },
    ]
}
