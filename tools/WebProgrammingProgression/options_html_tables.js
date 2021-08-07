{
    levels: [
        {
            parameters: {
                row: [
                    {
                        header: 'Average&lt;htmlTest&gt;Temperature',
                        lowest: 'Alaska',
                        highest: 'Florida',
                    },
                    {
                        header: 'Average Tornadoes',
                        lowest: 'Alaska',
                        highest: 'Texas',
                    },
                ],
            },
            prompt: '&lt;htmlTest&gt;Create another row, {{{row.header}}}, at the bottom of the table that shows {{row.lowest}} as having the lowest average temperature and {{row.highest}} as having the highest average temperature.',
            files: [
                {
                    language: 'html',
                    filename: 'HTML',
                    code: {
                        prefix: `&lt;table&gt;
  &lt;caption&gt;State Weather Extremes&lt;/caption&gt;
   &lt;tr&gt;
      &lt;th&gt;&lt;/th&gt;
      &lt;th&gt;Lowest&lt;/th&gt;
      &lt;th&gt;Highest&lt;/th&gt;
   &lt;/tr&gt;
   &lt;tr&gt;
      &lt;th&gt;Average Rainfall&lt;/th&gt;
      &lt;td&gt;Nevada&lt;/td&gt;
      &lt;td&gt;Hawaii&lt;/td&gt;
   &lt;/tr&gt;
`,
                        placeholder: `
   &lt;STUDENT_CODE&gt;
   `,
                        postfix: `
&lt;/table&gt;`,
                    },
                },
                {
                    language: 'css',
                    filename: 'CSS',
                    isHidden: true,
                    code: {
                        prefix: `table, th, td {
   border: 2px solid gray;
}`,
                    },
                },
            ],
            solution: `   &lt;tr&gt;
               &lt;th&gt;{{row.header}}&lt;/th&gt;
               &lt;td&gt;{{row.lowest}}&lt;/td&gt;
               &lt;td&gt;{{row.highest}}&lt;/td&gt;
            &lt;/tr&gt;`,
            unitTests: `// Count number of rows. &lt;htmlTest&gt;
var rows = $$$('table tr');
zyTest(rows.length, 'Testing number of tr tag names in table', true);

var newRowFirstChild = $$$('table tr:nth-of-type(3)').children().first();
zyTest((newRowFirstChild.prop('tagName') || '').toLowerCase(), 'Testing if third row\\'s first child is a th tag', true);

// Check the th's value.
var newRowThs = $$$('table tr:nth-of-type(3) th');
zyTest(zyGetTextPostRendering(newRowThs.get(0)), 'Testing contents in the third row\\'s th tag');

// Check each td's value.
var newRowTds = $$$('table tr:nth-of-type(3) td');
zyTest(zyGetTextPostRendering(newRowTds.get(0)), 'Testing contents in the third row\\'s first td tag');
zyTest(zyGetTextPostRendering(newRowTds.get(1)), 'Testing contents in the third row\\'s second td tag');
zyTestConsoleLog('Testing console.log');`,
        },
        {
            parameters: {

            },
            prompt: 'Create another column on the right side of the table with a header of Heaviest, and that shows Ostrich as the heaviest bird and Blue Whale as the heaviest mammal.',
            files: [
                {
                    language: 'html',
                    filename: 'HTML',
                    code: {
                        prefix: `&lt;table&gt;
   &lt;caption&gt;Weight Extremes&lt;/caption&gt;
   &lt;tr&gt;
`,
                        placeholder: `
      &lt;th&gt;&lt;/th&gt;
      &lt;th&gt;Lightest&lt;/th&gt;
   &lt;/tr&gt;
   &lt;tr&gt;
      &lt;th&gt;Bird&lt;/th&gt;
      &lt;td&gt;Bee Hummingbird&lt;/td&gt;
   &lt;/tr&gt;
   &lt;tr&gt;
      &lt;th&gt;Mammal&lt;/th&gt;
      &lt;td&gt;Pygmy Shrew&lt;/td&gt;`,
                        postfix: `
   &lt;/tr&gt;
&lt;/table&gt;`,
                    },
                },
            ],
            solution: `      &lt;th&gt;&lt;/th&gt;
      &lt;th&gt;Lightest&lt;/th&gt;
      &lt;th&gt;Heaviest&lt;/th&gt;
   &lt;/tr&gt;
   &lt;tr&gt;
      &lt;th&gt;Bird&lt;/th&gt;
      &lt;td&gt;Bee Hummingbird&lt;/td&gt;
      &lt;td&gt;Ostrich&lt;/td&gt;
   &lt;/tr&gt;
   &lt;tr&gt;
      &lt;th&gt;Mammal&lt;/th&gt;
      &lt;td&gt;Pygmy Shrew&lt;/td&gt;
      &lt;td&gt;Blue Whale&lt;/td&gt;`,
            unitTests: `var $firstRowColumns = $$$('table tr:first th');
zyTest($firstRowColumns.length, 'Testing the number of th tags in the first row');

var $secondRowColumns = $$$('table tr:nth-child(2)').children();
zyTest($secondRowColumns.length, 'Testing the number of cells in the second row');

var $thirdRowColumns = $$$('table tr:nth-child(3)').children();
zyTest($thirdRowColumns.length, 'Test the number of cells in the third row');

var firstRowLastColumnText = zyGetTextPostRendering($$$('table tr:first th:last').get(0));
zyTest(firstRowLastColumnText, 'Testing the content of the last th tag in the first row');

var secondRowLastColumnText = zyGetTextPostRendering($$$('table tr:nth-of-type(2) td:last').get(0));
zyTest(secondRowLastColumnText, 'Testing the content of the last td tag in the second row');

var thirdRowLastColumnText = zyGetTextPostRendering($$$('table tr:last td:last').get(0));
zyTest(thirdRowLastColumnText, 'Testing the content of the last td in the third row');`,
        },
    ],
}