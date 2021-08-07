{
    levels: [
        {
            parameters: {
                style: [
                    {
                        name: 'text-decoration',
                        value: [ 'underline', 'overline', 'line-through' ],
                    },
                    {
                        name: 'color',
                        value: [ 'blue', 'red', 'yellow' ],
                    },
                ],
            },
            prompt: 'By tag name: Set {{style.name}} to {{style.value}} for the li elements.',
            files: [
                {
                    language: 'css',
                    filename: 'CSS',
                    code: {
                        placeholder: `&lt;STUDENT_CODE&gt;`,
                    },
                },
                {
                    language: 'html',
                    filename: 'HTML',
                    code: {
                        prefix: `&lt;section&gt;
    &lt;h2&gt;Solar system facts&lt;/h2&gt;
    &lt;p&gt;There are &lt;span&gt;8 planets&lt;span&gt; in our solar system.&lt;/p&gt;
    &lt;ul&gt;
        &lt;li&gt;The Sun contains 99.86% of the solar system's mass.&lt;/li&gt;
        &lt;li&gt;Mercury is closest to the Sun.&lt;/li&gt;
        &lt;li&gt;Venus is the hottest planet.&lt;/li&gt;
        &lt;li&gt;&lt;a href="https://en.wikipedia.org/wiki/Solar_System"&gt;Learn more&lt;/a&gt;&lt;/li&gt;
    &lt;/ul&gt;
&lt;/section&gt;`
                    },
                },
            ],
            solution: `li {
    {{style.name}}: {{style.value}};
}`,
            unitTests: `var mapIndexToEnumerationName = [ 'first', 'second', 'third', 'fourth' ];

$$$('li').each(function(index, listElement) {
    var styleValue = $$$(listElement).css('{{style.name}}');

    zyTest(
        styleValue,
        'Testing CSS {{style.name}} value of ' + mapIndexToEnumerationName[index] + ' li'
    );
});`,
        },
    ],
}