{
    "progression": {
        "code": "",
        "elements": [
            {
                "id": "0",
                "isInEditMode": false,
                "isSelected": true,
                "name": "Object 1: Table",
                "style":  {
                    "opacity": 1,
                    "border-radius":0,
                    "transform": "rotate(0deg)",
                    "font-size":"16px",
                    "width": "100px",
                    "top": "0px",
                    "left": "0px",
                    "height": "69px"
                },
                "type": "table",
                "tableData": [
                    [
                        {
                            "content": "a",
                            "isHeader": false
                        },
                        {
                            "content": "b",
                            "isHeader": false,
                            "style": {
                                "background-color": "${cell_color}"
                            }
                        }
                    ],
                    [
                        {
                            "content": "c",
                            "isHeader": false,
                            "style": {
                                "background-color": "zyAnimatorBlue"
                            }
                        },
                        {
                            "content": "d",
                            "isHeader": false,
                            "style": {
                                "background-color": "zyAnimatorOrange"
                            }
                        }
                    ]
                ],
                "listName": "",
                "isFirstRowHeader": false,
                "isFirstColumnHeader": false,
                "isSpreadsheet": true
            }
        ],
        "levels": [
            {
                "elementVariants": [],
                "questions": [
                    {
                        "code": "cell_color = 'green'\nexplanation = '''Expected: Right answer\n[spreadsheet 300 150 18][a1&b1&c1\na2&b2&c2\na3&b3&c3]\n[default&green&blue\ndefault&orange&blue\ndefault&orange&blue]'''",
                        "elementVariants": [],
                        "explanation": "${explanation}",
                        "height": "",
                        "isSelected": true,
                        "name": "Question a",
                        "usedElements": [],
                        "width": ""
                    }
                ],
                "explanation": "",
                "height": "",
                "isCollapsed": false,
                "name": "Level 1",
                "usedElements": ["0"],
                "width": ""
            }
        ],
        "explanation": "",
        "height": "350px",
        "width": "550px",
        "isExam": false
    }
}
