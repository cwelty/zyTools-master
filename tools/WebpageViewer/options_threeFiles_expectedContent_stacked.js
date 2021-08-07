{
    files: [
        {
            expectedContent: '&lt;button onclick="buttonClick();">Click me!&lt;/button>',
            filename:        'index.html',
            language:        'html',
            initialContent:  '&lt;button onclick="">Click me!&lt;/button>'
        },
        {
            expectedContent: 'button {\n   background-color: blue;\n   color: white;\n   padding: 5px;\n}',
            filename:        'style.css',
            language:        'css',
            initialContent:  'button {\n   background-color: blue;\n   color: white;\n}'
        },
        {
            expectedContent: 'function buttonClick() {\n   alert("Clicked!");\n}',
            filename:        'app.js',
            language:        'js',
            initialContent:  'function buttonClick() {\n   alert("???");\n}'
        }
    ],
    isStacked: true
}