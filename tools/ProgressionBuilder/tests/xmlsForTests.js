/* eslint-disable max-len */
/* exported emptyProgressionXML, inspectorControllerTestXML, draggableXML, dropdownWithLatexXML, dropdownWithoutLatexXML, zyAltDescriptionXML */
'use strict';


// Just an empty progression XML
const emptyProgressionXML = `<zyTool name="ProgressionPlayer" caption="Empty progression" id="5c8417e8-c4fa-45e0-bfea-9eba1d0415c3" challenge="true" parts="1" edited-last="Mon Aug 31 2020 08:26:16 GMT+0200 (Central European Summer Time)" image-ids="">
<zyInstructions></zyInstructions><zyOptions><progression type="dict">
<code type="string"></code>
<elements type="list"></elements><levels type="list"><item type="dict">
<code type="string"></code>
<elementVariants type="list"></elementVariants><questions type="list"><item type="dict">
<code type="string"></code>
<elementVariants type="list"></elementVariants>
<explanation type="string"></explanation>
<height type="string"></height><isSelected type="boolean">true</isSelected><name type="string">Question a</name><usedElements type="list"></usedElements><width type="string"></width></item></questions>
<explanation type="string"></explanation>
<height type="string"></height><isCollapsed type="boolean">true</isCollapsed><isSelected type="boolean">true</isSelected><name type="string">Level 1</name><usedElements type="list"></usedElements><width type="string"></width></item></levels>
<explanation type="string"></explanation>
<height type="string">350px</height><width type="string">550px</width><isExam type="boolean">false</isExam></progression></zyOptions><zyAltDescription></zyAltDescription></zyTool>`;

// A progression with 2 objects, with level and question variants. All objects are selected.
const inspectorControllerTestXML = `<zyTool name="ProgressionPlayer" caption="test inspector controller" id="3961eb8a-57b0-4ee7-b3bc-12be76da1508" challenge="true" parts="3" edited-last="Mon Aug 31 2020 08:25:48 GMT+0200 (Central European Summer Time)" image-ids="">
<zyInstructions></zyInstructions><zyOptions><progression type="dict">
<code type="string"></code>
<elements type="list"><item type="dict"><id type="string">1</id><isInEditMode type="boolean">false</isInEditMode><isSelected type="boolean">true</isSelected><name type="string">Object 2: Text</name><style type="dict"><opacity type="number">1</opacity><border-radius type="number">0</border-radius><transform type="string">rotate(0deg)</transform><font-size type="string">16px</font-size><padding type="string">0px</padding><border type="string">2px solid rgba(0, 0, 0, 0)</border><color type="string">zyante-black</color><top type="string">0px</top><left type="string">0px</left></style><type type="string">text</type><text type="string">Text level 1</text></item><item type="dict"><id type="string">0</id><isInEditMode type="boolean">false</isInEditMode><isSelected type="boolean">true</isSelected><name type="string">Object 1: Text</name><style type="dict"><opacity type="number">1</opacity><border-radius type="number">0</border-radius><transform type="string">rotate(0deg)</transform><font-size type="string">16px</font-size><padding type="string">0px</padding><border type="string">2px solid rgba(0, 0, 0, 0)</border><color type="string">zyante-black</color><top type="string">36px</top><left type="string">0px</left></style><type type="string">text</type><text type="string">Text level 1, question a</text></item></elements><levels type="list"><item type="dict">
<code type="string"></code>
<elementVariants type="list"></elementVariants><questions type="list"><item type="dict">
<code type="string"></code>
<elementVariants type="list"></elementVariants>
<explanation type="string"></explanation>
<height type="string"></height><isSelected type="boolean">true</isSelected><name type="string">Question a</name><usedElements type="list"></usedElements><width type="string"></width></item><item type="dict">
<code type="string"></code>
<elementVariants type="list"><item type="dict"><id type="string">0</id><text type="string">Text level 1, question b</text></item></elementVariants>
<explanation type="string"></explanation>
<height type="string"></height><isSelected type="boolean">false</isSelected><name type="string">Question b</name><usedElements type="list"></usedElements><width type="string"></width></item></questions>
<explanation type="string"></explanation>
<height type="string"></height><isCollapsed type="boolean">false</isCollapsed><isSelected type="boolean">true</isSelected><name type="string">Level 1</name><usedElements type="list"><item type="string">0</item><item type="string">1</item></usedElements><width type="string"></width></item><item type="dict">
<code type="string"></code>
<elementVariants type="list"></elementVariants><questions type="list"><item type="dict">
<code type="string"></code>
<elementVariants type="list"><item type="dict"><id type="string">1</id><text type="string">Text level 2</text></item></elementVariants>
<explanation type="string"></explanation>
<height type="string"></height><isSelected type="boolean">false</isSelected><name type="string">Question a</name><usedElements type="list"></usedElements><width type="string"></width></item></questions>
<explanation type="string"></explanation>
<height type="string"></height><isCollapsed type="boolean">false</isCollapsed><isSelected type="boolean">false</isSelected><name type="string">Level 2</name><usedElements type="list"><item type="string">1</item></usedElements><width type="string"></width></item><item type="dict">
<code type="string"></code>
<elementVariants type="list"></elementVariants><questions type="list"><item type="dict">
<code type="string"></code>
<elementVariants type="list"></elementVariants>
<explanation type="string"></explanation>
<height type="string"></height><isSelected type="boolean">false</isSelected><name type="string">Question a</name><usedElements type="list"></usedElements><width type="string"></width></item></questions>
<explanation type="string"></explanation>
<height type="string"></height><isCollapsed type="boolean">false</isCollapsed><isSelected type="boolean">false</isSelected><name type="string">Level 3</name><usedElements type="list"></usedElements><width type="string"></width></item></levels>
<explanation type="string"></explanation>
<height type="string">350px</height><width type="string">550px</width><isExam type="boolean">false</isExam></progression></zyOptions><zyAltDescription></zyAltDescription></zyTool>`;

const draggableXML = `<zyTool name="ProgressionPlayer" caption="test draggable area" id="3961eb8a-57b0-4ee7-b3bc-12be76da1508" challenge="true" parts="1" edited-last="Wed Sep 02 2020 13:30:23 GMT+0200 (Central European Summer Time)" image-ids="">
<zyInstructions></zyInstructions><zyOptions><progression type="dict">
<code type="string"></code>
<elements type="list"><item type="dict"><id type="string">3</id><isInEditMode type="boolean">false</isInEditMode><isSelected type="boolean">true</isSelected><name type="string">Object 4: Text</name><style type="dict"><opacity type="number">1</opacity><border-radius type="number">0</border-radius><transform type="string">rotate(0deg)</transform><font-size type="string">16px</font-size><padding type="string">0px</padding><border type="string">2px solid rgba(0, 0, 0, 0)</border><color type="string">zyante-black</color><top type="string">60px</top><left type="string">100px</left></style><type type="string">text</type><text type="string">4: Bottom (100, 60)</text></item><item type="dict"><id type="string">2</id><isInEditMode type="boolean">false</isInEditMode><isSelected type="boolean">true</isSelected><name type="string">Object 3: Text</name><style type="dict"><opacity type="number">1</opacity><border-radius type="number">0</border-radius><transform type="string">rotate(0deg)</transform><font-size type="string">16px</font-size><padding type="string">0px</padding><border type="string">2px solid rgba(0, 0, 0, 0)</border><color type="string">zyante-black</color><top type="string">40px</top><left type="string">150px</left></style><type type="string">text</type><text type="string">3: Right (150, 40)</text></item><item type="dict"><id type="string">1</id><isInEditMode type="boolean">false</isInEditMode><isSelected type="boolean">true</isSelected><name type="string">Object 2: Text</name><style type="dict"><opacity type="number">1</opacity><border-radius type="number">0</border-radius><transform type="string">rotate(0deg)</transform><font-size type="string">16px</font-size><padding type="string">0px</padding><border type="string">2px solid rgba(0, 0, 0, 0)</border><color type="string">zyante-black</color><top type="string">20px</top><left type="string">100px</left></style><type type="string">text</type><text type="string">2: Up (100, 20)</text></item><item type="dict"><id type="string">0</id><isInEditMode type="boolean">false</isInEditMode><isSelected type="boolean">true</isSelected><name type="string">Object 1: Text</name><style type="dict"><opacity type="number">1</opacity><border-radius type="number">0</border-radius><transform type="string">rotate(0deg)</transform><font-size type="string">16px</font-size><padding type="string">0px</padding><border type="string">2px solid rgba(0, 0, 0, 0)</border><color type="string">zyante-black</color><top type="string">40px</top><left type="string">50px</left></style><type type="string">text</type><text type="string">1: Left (50, 40)</text></item></elements><levels type="list"><item type="dict">
<code type="string"></code>
<elementVariants type="list"></elementVariants><questions type="list"><item type="dict">
<code type="string"></code>
<elementVariants type="list"></elementVariants>
<explanation type="string"></explanation>
<height type="string"></height><isSelected type="boolean">true</isSelected><name type="string">Question a</name><usedElements type="list"></usedElements><width type="string"></width></item></questions>
<explanation type="string"></explanation>
<height type="string"></height><isCollapsed type="boolean">false</isCollapsed><isSelected type="boolean">true</isSelected><name type="string">Level 1</name><usedElements type="list"><item type="string">0</item><item type="string">1</item><item type="string">2</item><item type="string">3</item></usedElements><width type="string"></width></item></levels>
<explanation type="string"></explanation>
<height type="string">100px</height><width type="string">450px</width><isExam type="boolean">false</isExam></progression></zyOptions><zyAltDescription></zyAltDescription></zyTool>`;

const dropdownWithLatexXML = `<zyTool name="ProgressionPlayer" caption="Dropdown with latex" id="78de5e37-3177-4562-b917-58f55e4c054a" challenge="true" parts="1" edited-last="Tue Nov 10 2020 14:46:34 GMT+0100 (Central European Standard Time)" image-ids="">
<zyInstructions></zyInstructions><zyOptions><progression type="dict">
<code type="string"></code>
<elements type="list"><item type="dict"><id type="string">5</id><isInEditMode type="boolean">false</isInEditMode><isSelected type="boolean">true</isSelected><name type="string">Object 6: Dropdown</name><style type="dict"><opacity type="number">1</opacity><border-radius type="number">0</border-radius><transform type="string">rotate(0deg)</transform><font-size type="string">16px</font-size><top type="string">108px</top><left type="string">183px</left></style><type type="string">dropdown</type><options type="list"><item type="dict"><text type="string">\\(\\text{Pick}\\)</text><isCorrectOption type="boolean">false</isCorrectOption><isDefault type="boolean">true</isDefault><isInvalidOption type="boolean">true</isInvalidOption><isSelected type="boolean">true</isSelected><isPythonList type="boolean">false</isPythonList></item><item type="dict"><text type="string">5</text><isCorrectOption type="boolean">true</isCorrectOption><isDefault type="boolean">false</isDefault><isInvalidOption type="boolean">false</isInvalidOption><isSelected type="boolean">false</isSelected><isPythonList type="boolean">false</isPythonList></item><item type="dict"><text type="string">7</text><isCorrectOption type="boolean">false</isCorrectOption><isDefault type="boolean">false</isDefault><isInvalidOption type="boolean">false</isInvalidOption><isSelected type="boolean">false</isSelected><isPythonList type="boolean">false</isPythonList></item></options><optionOrderingMethod type="string">sort</optionOrderingMethod></item><item type="dict"><id type="string">4</id><isInEditMode type="boolean">false</isInEditMode><isSelected type="boolean">false</isSelected><name type="string">Object 5: Dropdown</name><style type="dict"><opacity type="number">1</opacity><border-radius type="number">0</border-radius><transform type="string">rotate(0deg)</transform><font-size type="string">16px</font-size><top type="string">88px</top><left type="string">110px</left></style><type type="string">dropdown</type><options type="list"><item type="dict"><text type="string">Pick</text><isCorrectOption type="boolean">false</isCorrectOption><isDefault type="boolean">true</isDefault><isInvalidOption type="boolean">true</isInvalidOption><isSelected type="boolean">true</isSelected><isPythonList type="boolean">false</isPythonList></item><item type="dict"><text type="string">5</text><isCorrectOption type="boolean">true</isCorrectOption><isDefault type="boolean">false</isDefault><isInvalidOption type="boolean">false</isInvalidOption><isSelected type="boolean">false</isSelected><isPythonList type="boolean">false</isPythonList></item><item type="dict"><text type="string">$$5$$</text><isCorrectOption type="boolean">false</isCorrectOption><isDefault type="boolean">false</isDefault><isInvalidOption type="boolean">false</isInvalidOption><isSelected type="boolean">false</isSelected><isPythonList type="boolean">false</isPythonList></item></options><optionOrderingMethod type="string">sort</optionOrderingMethod></item><item type="dict"><id type="string">3</id><isInEditMode type="boolean">false</isInEditMode><isSelected type="boolean">false</isSelected><name type="string">Object 4: Dropdown</name><style type="dict"><opacity type="number">1</opacity><border-radius type="number">0</border-radius><transform type="string">rotate(0deg)</transform><font-size type="string">16px</font-size><top type="string">47px</top><left type="string">211px</left></style><type type="string">dropdown</type><options type="list"><item type="dict"><text type="string">Pick</text><isCorrectOption type="boolean">false</isCorrectOption><isDefault type="boolean">true</isDefault><isInvalidOption type="boolean">true</isInvalidOption><isSelected type="boolean">true</isSelected><isPythonList type="boolean">false</isPythonList></item><item type="dict"><text type="string">5</text><isCorrectOption type="boolean">true</isCorrectOption><isDefault type="boolean">false</isDefault><isInvalidOption type="boolean">false</isInvalidOption><isSelected type="boolean">false</isSelected><isPythonList type="boolean">false</isPythonList></item><item type="dict"><text type="string">10</text><isCorrectOption type="boolean">false</isCorrectOption><isDefault type="boolean">false</isDefault><isInvalidOption type="boolean">false</isInvalidOption><isSelected type="boolean">false</isSelected><isPythonList type="boolean">false</isPythonList></item></options><optionOrderingMethod type="string">sort</optionOrderingMethod></item><item type="dict"><id type="string">2</id><isInEditMode type="boolean">false</isInEditMode><isSelected type="boolean">false</isSelected><name type="string">Object 3: Dropdown</name><style type="dict"><opacity type="number">1</opacity><border-radius type="number">0</border-radius><transform type="string">rotate(0deg)</transform><font-size type="string">16px</font-size><top type="string">29px</top><left type="string">47px</left></style><type type="string">dropdown</type><options type="list"><item type="dict"><text type="string">Pick</text><isCorrectOption type="boolean">false</isCorrectOption><isDefault type="boolean">true</isDefault><isInvalidOption type="boolean">true</isInvalidOption><isSelected type="boolean">true</isSelected><isPythonList type="boolean">false</isPythonList></item><item type="dict"><text type="string">\\(5\\)</text><isCorrectOption type="boolean">true</isCorrectOption><isDefault type="boolean">false</isDefault><isInvalidOption type="boolean">false</isInvalidOption><isSelected type="boolean">false</isSelected><isPythonList type="boolean">false</isPythonList></item><item type="dict"><text type="string">test</text><isCorrectOption type="boolean">false</isCorrectOption><isDefault type="boolean">false</isDefault><isInvalidOption type="boolean">false</isInvalidOption><isSelected type="boolean">false</isSelected><isPythonList type="boolean">false</isPythonList></item></options><optionOrderingMethod type="string">sort</optionOrderingMethod></item></elements><levels type="list"><item type="dict">
<code type="string"></code>
<elementVariants type="list"></elementVariants><questions type="list"><item type="dict">
<code type="string"></code>
<elementVariants type="list"></elementVariants>
<explanation type="string"></explanation>
<height type="string"></height><isSelected type="boolean">true</isSelected><name type="string">Question a</name><usedElements type="list"></usedElements><width type="string"></width></item></questions>
<explanation type="string">Explanation</explanation>
<height type="string"></height><isCollapsed type="boolean">true</isCollapsed><isSelected type="boolean">true</isSelected><name type="string">Level 1</name><usedElements type="list"><item type="string">2</item><item type="string">3</item><item type="string">4</item><item type="string">5</item></usedElements><width type="string"></width></item></levels>
<explanation type="string"></explanation>
<height type="string">201px</height><width type="string">450px</width><isExam type="boolean">false</isExam></progression></zyOptions><zyAltDescription></zyAltDescription></zyTool>`;

const dropdownWithoutLatexXML = `<zyTool name="ProgressionPlayer" caption="Dropdown without latex" id="0aa7a734-b803-48d1-b9a2-4f691bd90c96" challenge="true" parts="1" edited-last="Tue Nov 10 2020 15:23:22 GMT+0100 (Central European Standard Time)" image-ids="">
<zyInstructions></zyInstructions><zyOptions><progression type="dict">
<code type="string"></code>
<elements type="list"><item type="dict"><id type="string">0</id><isInEditMode type="boolean">false</isInEditMode><isSelected type="boolean">true</isSelected><name type="string">Object 1: Dropdown</name><style type="dict"><opacity type="number">1</opacity><border-radius type="number">0</border-radius><transform type="string">rotate(0deg)</transform><font-size type="string">16px</font-size><top type="string">23px</top><left type="string">69px</left></style><type type="string">dropdown</type><options type="list"><item type="dict"><text type="string">Pick</text><isCorrectOption type="boolean">false</isCorrectOption><isDefault type="boolean">true</isDefault><isInvalidOption type="boolean">true</isInvalidOption><isSelected type="boolean">true</isSelected><isPythonList type="boolean">false</isPythonList></item><item type="dict"><text type="string">Normal code</text><isCorrectOption type="boolean">true</isCorrectOption><isDefault type="boolean">false</isDefault><isInvalidOption type="boolean">false</isInvalidOption><isSelected type="boolean">false</isSelected><isPythonList type="boolean">false</isPythonList></item><item type="dict"><text type="string">No latex.</text><isCorrectOption type="boolean">false</isCorrectOption><isDefault type="boolean">false</isDefault><isInvalidOption type="boolean">false</isInvalidOption><isSelected type="boolean">false</isSelected><isPythonList type="boolean">false</isPythonList></item></options><optionOrderingMethod type="string">sort</optionOrderingMethod></item></elements><levels type="list"><item type="dict">
<code type="string"></code>
<elementVariants type="list"></elementVariants><questions type="list"><item type="dict">
<code type="string"></code>
<elementVariants type="list"></elementVariants>
<explanation type="string"></explanation>
<height type="string"></height><isSelected type="boolean">true</isSelected><name type="string">Question a</name><usedElements type="list"></usedElements><width type="string"></width></item></questions>
<explanation type="string"></explanation>
<height type="string"></height><isCollapsed type="boolean">true</isCollapsed><isSelected type="boolean">true</isSelected><name type="string">Level 1</name><usedElements type="list"><item type="string">0</item></usedElements><width type="string"></width></item></levels>
<explanation type="string"></explanation>
<height type="string">350px</height><width type="string">550px</width><isExam type="boolean">false</isExam></progression></zyOptions><zyAltDescription></zyAltDescription></zyTool>`;

const zyAltDescriptionXML = `<zyTool name="ProgressionPlayer" caption="zyaltdescription test" id="21a02464-0ea5-4217-924e-3c336078debe" challenge="true" parts="1" edited-last="Tue Nov 24 2020 19:05:30 GMT+0100 (Central European Standard Time)" image-ids="">
<zyInstructions></zyInstructions><zyOptions><progression type="dict">
<code type="string"></code>
<elements type="list"></elements><levels type="list"><item type="dict">
<code type="string"></code>
<elementVariants type="list"></elementVariants><questions type="list"><item type="dict">
<code type="string"></code>
<elementVariants type="list"></elementVariants>
<explanation type="string"></explanation>
<height type="string"></height><isSelected type="boolean">true</isSelected><name type="string">Question a</name><usedElements type="list"></usedElements><width type="string"></width></item></questions>
<explanation type="string"></explanation>
<height type="string"></height><isCollapsed type="boolean">true</isCollapsed><isSelected type="boolean">true</isSelected><name type="string">Level 1</name><usedElements type="list"></usedElements><width type="string"></width></item></levels>
<explanation type="string"></explanation>
<height type="string">350px</height><width type="string">550px</width><isExam type="boolean">false</isExam></progression></zyOptions><zyAltDescription>Unescaped: & < " ' >
<ul><li>Test</li><li>Test2</li></ul>
<table>
<tr><th>Header</th><th>Header2</th></tr>
<tr><td>Row1</td><td>Still row 1</td></tr>
</table>
Escaped: &amp; &lt; &quot; &apos; &gt;</zyAltDescription></zyTool>`;
