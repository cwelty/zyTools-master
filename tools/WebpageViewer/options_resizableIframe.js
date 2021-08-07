{
    files: [
        {
            filename:       'html',
            language:       'html',
            initialContent: '&lt;div class="container">\n   &lt;div class="one">1&lt;/div>\n   &lt;div class="two">2&lt;/div>\n   &lt;div class="three">3&lt;/div>\n&lt;/div>'
        },
        {
            filename:       'css',
            language:       'css',
            initialContent: 'div.container { display: flex; }\ndiv.one { background-color: red; flex-grow: 1; }\ndiv.two { background-color: blue;  flex-grow: 2; }\ndiv.three { background-color: green;  flex-grow: 1; }'
        }
    ],
    makeIFramesResizable: true
}