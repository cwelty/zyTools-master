/* exported emptyProgressionXML, basicCppProgression, exportedProgression, expectedLevelData */
'use strict';

const emptyProgressionXML = `<zyTool name='codeOutput' caption='Caption' id='GUID' parts='1' challenge='true'>
<zyOptions>
<language>cpp</language>
<levels type='list'>
<level type='dict'>

    <template></template>
    <parameters></parameters>
</level>
</levels>
</zyOptions>
</zyTool>`;

const basicCppProgression = `<zyTool name='codeOutput' caption='Input output' id='GUID' parts='2' challenge='true'>
<zyOptions>
<language>cpp</language>
<levels type='list'>
<level type='dict'>
    <explanation>Explain</explanation>
    <template unescape-html='true'>#include&lt;iostream&gt;
   using namespace std;

   int main() {
      cout &lt;&lt; "{{personName}} is {{adjective}}.";

      return 0;
   }</template>
    <parameters type='dict'>
        <personName type='list'>
            <li>Sam</li>
            <li>Ann</li>
        </personName>
        <adjective type='list'>
            <li>happy</li>
            <li>awesome</li>
        </adjective>
    </parameters>
</level>
<level type='dict'>
    <explanation>Explain</explanation>
    <template type='list'>
        <file type='dict'>
            <filename>main.cpp</filename>
            <main type='boolean'>true</main>
            <program unescape-html='true'>#include "imperial.h"
#include "metric.h"
#include &lt;iostream&gt;

int main() {
   imperial::SmallerUnit();

   metric::SmallerUnit();

   return 0;
}</program>
        </file>
        <file type='dict'>
            <filename>imperial.h</filename>
            <main type='boolean'>false</main>
            <program unescape-html='true'>#ifndef IMPERIAL_H
#define IMPERIAL_H
#include &lt;iostream&gt;

using namespace std;

namespace imperial {
   int foot = 1;
   int inch = 12;
   float yard = 0.333;

   void SmallerUnit() {
      cout &lt;&lt; "1ft = " &lt;&lt; inch &lt;&lt; "in" &lt;&lt; endl;
   }

   void BiggerUnit() {
      cout &lt;&lt; "1ft = " &lt;&lt; yard &lt;&lt; "yd" &lt;&lt; endl;
   }
}
#endif</program>
        </file>
        <file type='dict'>
            <filename>metric.h</filename>
            <main type='boolean'>false</main>
            <program unescape-html='true'>#ifndef METRIC_H
#define METRIC_H
#include &lt;iostream&gt;

using namespace std;

namespace metric {
   int meter = 1;
   int millimeter = 1000;
   float kilometer = 0.001;

   void SmallerUnit() {
      cout &lt;&lt; "1m = " &lt;&lt; millimeter &lt;&lt; "mm" &lt;&lt; endl;
   }

   void BiggerUnit() {
      cout &lt;&lt; "1m = " &lt;&lt; kilometer &lt;&lt; "km" &lt;&lt; endl;
   }
}
#endif</program>
        </file>
    </template>
    <parameters type='dict'>
    </parameters>
</level>
</levels>
</zyOptions>
</zyTool>`;

const expectedLevelData = {
    parameters: '',
    explanation: 'Explain',
    input: '',
    isPythonRandomization: true,
    filesData: [
        {
            isMain: true,
            program: `#include "imperial.h"
#include "metric.h"
#include <iostream>

int main() {
   imperial::SmallerUnit();

   metric::SmallerUnit();

   return 0;
}`,
        },
        {
            isMain: false,
            program: '',
        },
        {
            isMain: false,
            program: `#ifndef IMPERIAL_H
#define IMPERIAL_H
#include <iostream>

using namespace std;

namespace imperial {
   int foot = 1;
   int inch = 12;
   float yard = 0.333;

   void SmallerUnit() {
      cout << "1ft = " << inch << "in" << endl;
   }

   void BiggerUnit() {
      cout << "1ft = " << yard << "yd" << endl;
   }
}
#endif`,
        },
        {
            isMain: false,
            program: `#ifndef METRIC_H
#define METRIC_H
#include <iostream>

using namespace std;

namespace metric {
   int meter = 1;
   int millimeter = 1000;
   float kilometer = 0.001;

   void SmallerUnit() {
      cout << "1m = " << millimeter << "mm" << endl;
   }

   void BiggerUnit() {
      cout << "1m = " << kilometer << "km" << endl;
   }
}
#endif`,
        },
    ],
};


const exportedProgression = `<zyTool name='codeOutput' caption='Input output' id='GUID' parts='3' challenge='true'>
<zyOptions>
<language>cpp</language>
<levels type='list'>
<level type='dict'>

    <template></template>
    <parameters></parameters>
</level>
<level type='dict'>
    <explanation>Explain</explanation>
    <template unescape-html='true'>#include&lt;iostream&gt;
   using namespace std;

   int main() {
      cout &lt;&lt; "{{personName}} is {{adjective}}.";

      return 0;
   }</template>
    <parameters type='dict'>
        <personName type='list'>
            <li>Sam</li>
            <li>Ann</li>
        </personName>
        <adjective type='list'>
            <li>happy</li>
            <li>awesome</li>
        </adjective>
    </parameters>
</level>
<level type='dict'>
    <explanation>Explain</explanation>
    <template type='list'>
        <file type='dict'>
            <filename>main.cpp</filename>
            <main type='boolean'>true</main>
            <program unescape-html='true'>#include "imperial.h"
#include "metric.h"
#include &lt;iostream&gt;

int main() {
   imperial::SmallerUnit();

   metric::SmallerUnit();

   return 0;
}</program>
        </file>
        <file type='dict'>
            <filename>file-3.cpp</filename>
            <main type='boolean'>false</main>
            <program></program>
        </file>
        <file type='dict'>
            <filename>imperial.h</filename>
            <main type='boolean'>false</main>
            <program unescape-html='true'>#ifndef IMPERIAL_H
#define IMPERIAL_H
#include &lt;iostream&gt;

using namespace std;

namespace imperial {
   int foot = 1;
   int inch = 12;
   float yard = 0.333;

   void SmallerUnit() {
      cout &lt;&lt; "1ft = " &lt;&lt; inch &lt;&lt; "in" &lt;&lt; endl;
   }

   void BiggerUnit() {
      cout &lt;&lt; "1ft = " &lt;&lt; yard &lt;&lt; "yd" &lt;&lt; endl;
   }
}
#endif</program>
        </file>
        <file type='dict'>
            <filename>metric.h</filename>
            <main type='boolean'>false</main>
            <program unescape-html='true'>#ifndef METRIC_H
#define METRIC_H
#include &lt;iostream&gt;

using namespace std;

namespace metric {
   int meter = 1;
   int millimeter = 1000;
   float kilometer = 0.001;

   void SmallerUnit() {
      cout &lt;&lt; "1m = " &lt;&lt; millimeter &lt;&lt; "mm" &lt;&lt; endl;
   }

   void BiggerUnit() {
      cout &lt;&lt; "1m = " &lt;&lt; kilometer &lt;&lt; "km" &lt;&lt; endl;
   }
}
#endif</program>
        </file>
    </template>
    <parameters></parameters>
</level>
</levels>
</zyOptions>
</zyTool>`;
