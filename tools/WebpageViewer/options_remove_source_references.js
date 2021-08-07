{
    doNotShowExpectedContent: true,
    files: [
        {
            filename:        'index.html',
            language:        'html',
            initialContent:  '&lt;script src="app.js">&lt;/script>\n&lt;script src="app.js">&lt;/script>\n&lt;link href="style.css">&lt;/link>\n&lt;p>Test&lt;/p>'
        },
        {
            filename:        'style.css',
            language:        'css',
            initialContent:  'p {\n   background-color: blue;\n   color: white;\n}'
        },
        {
            filename:        'app.js',
            language:        'js',
            initialContent:  'const x = 5;'
        }
    ]
}