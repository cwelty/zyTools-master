{
    "progression": {
        "code": "",
        "explanation": null,
        "height": "155px",
        "width": "500px",
        "elements": [
            {
                "type": "checkbox",
                "label": '7C',
                "id": "2",
                "isInEditMode": false,
                "isSelected": false,
                "correctAnswerIsCheckedString": 'true',
                "name": "Object 3: Checkbox",
                "style": {
                    "font-size": "16px",
                    "left": "415px",
                    "top": "127px",
                },
            },
            {
                "type": "text",
                "text": "Is the minimum temperature in Madrid 7 degrees celsius?",
                "id": "1",
                "isInEditMode": false,
                "isSelected": false,
                "name": "Object 2: Text",
                "style": {
                    "border": "2px solid rgba(0, 0, 0, 0)",
                    "border-radius": 0.0,
                    "color": "zyante-black",
                    "font-size": "16px",
                    "left": "0px",
                    "opacity": 1.0,
                    "padding": "0px",
                    "top": "125px",
                    "transform": "rotate(0deg)",
                },
            },
            {
                "type": "table",
                "id": "0",
                "isInEditMode": false,
                "isSelected": true,
                "name": "Object 1: Table",
                "style": {
                    "border-radius": 0.0,
                    "font-size": "16px",
                    "height": "100px",
                    "left": "115px",
                    "opacity": 1.0,
                    "transform": "rotate(0deg)",
                    "top": "0px",
                    width: "200px",
                },
                "tableData": [
                    [
                        { "content": "${row1[0]}", "isHeader": true },
                        { "content": "${row1[1]}", "isHeader": true },
                        { "content": "${row1[2]}", "isHeader": true },
                    ],
                    [
                        { "content": "${city1}", "isHeader": true },
                        { "content": "7C", "isHeader": false },
                        { "content": "22C", "isHeader": false },
                    ],
                    [
                        { "content": "${city2}", "isHeader": true },
                        { "content": "12C", "isHeader": false },
                        { "content": "19C", "isHeader": false },
                    ],
                ],
            },
        ],
        "levels": [
            {
                "elementVariants": [],
                "explanation": "It is 7C",
                "height": null,
                "isCollapsed": false,
                "name": "Level 1",
                "questions": [
                    {
                        "code": "row1 = ['City', 'Min', 'Max']\ncity1 = 'Madrid'\ncity2 = 'Los gatos'\n",
                        "elementVariants": [],
                        "explanation": "",
                        "height": null,
                        "isSelected": true,
                        "name": "Question a",
                        "usedElements": [],
                        "width": null
                    }
                ],
                "usedElements": [ "0", "1", "2" ],
                "width": null,
            }
        ],
    }
}
