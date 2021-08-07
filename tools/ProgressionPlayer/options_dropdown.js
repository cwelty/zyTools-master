{
    "progression": {
        "code": "incorrect_list = [ 'incorrect', 12, -32.51, pick_from_range(1, 10) ]",
        "explanation": null,
        "height": "350px",
        "width": "550px",
        "elements": [
            {
                "id": "0",
                "isInEditMode": false,
                "isSelected": true,
                "name": "Object 1: Dropdown",
                "type": "dropdown",
                "options": [
                    {
                        "isCorrectOption": false,
                        "isDefault": true,
                        "isInvalidOption": true,
                        "isSelected": true,
                        "isPythonList": false,
                        "text": "Default",
                    },
                    {
                        "isCorrectOption": true,
                        "isDefault": false,
                        "isInvalidOption": false,
                        "isSelected": false,
                        "isPythonList": false,
                        "text": "Correct",
                    },
                    {
                        "isCorrectOption": false,
                        "isDefault": false,
                        "isInvalidOption": false,
                        "isSelected": false,
                        "isPythonList": true,
                        "text": "incorrect_list",
                    },
                ],
                "optionOrderingMethod": "random",
                "style": {
                    "border-radius": 0.0,
                    "font-size": "16px",
                    "left": "23px",
                    "opacity": 1.0,
                    "top": "70px",
                    "transform": "rotate(0deg)",
                },
            },
            {
                "id": "1",
                "isInEditMode": false,
                "isSelected": false,
                "name": "Object 2: Text",
                "style": {
                    "border-radius": 0.0,
                    "font-size": "16px",
                    "left": "0px",
                    "opacity": 1.0,
                    "top": "0px",
                    "transform": "rotate(0deg)",
                },
                "type": "text",
                "text": "1 level with 2 questions. One with 1 fixed incorrect answer, another with the incorrect answer being a Python list with 4 elements (one of them randomly chosen)",
            }
        ],
        "levels": [
            {
                "elementVariants": [],
                "explanation": null,
                "height": null,
                "isCollapsed": false,
                "name": "Level 1",
                "questions": [
                    {
                        "code": "",
                        "elementVariants": [
                            {
                                "options": [
                                    {
                                        "isCorrectOption": false,
                                        "isDefault": true,
                                        "isInvalidOption": true,
                                        "isSelected": true,
                                        "isPythonList": false,
                                        "text": "Default",
                                    },
                                    {
                                        "isCorrectOption": true,
                                        "isDefault": false,
                                        "isInvalidOption": false,
                                        "isSelected": false,
                                        "isPythonList": false,
                                        "text": "Correct",
                                    },
                                    {
                                        "isCorrectOption": false,
                                        "isDefault": false,
                                        "isInvalidOption": false,
                                        "isSelected": false,
                                        "isPythonList": false,
                                        "text": "Incorrect option",
                                    },
                                ],
                                "id": "0",
                            },
                            {
                                "id": "0",
                                "text": ""
                            }
                        ],
                        "explanation": null,
                        "height": null,
                        "isSelected": true,
                        "name": "Question a",
                        "usedElements": [ "0" ],
                        "width": null
                    },
                    {
                        "code": "",
                        "explanation": null,
                        "height": null,
                        "isSelected": false,
                        "name": "Question b",
                        "usedElements": [ "0" ],
                        "width": null
                    }
                ],
                "usedElements": [ "0", "1" ],
                "width": null,
            }
        ],
    }
}
