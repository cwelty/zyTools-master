{
    "progression": {
        "explanation": "Progression explanation.",
        "height":      "150px",
        "width":       "425px",
        "elements": [
            {
                "type": "Text",
                "id":   "0",
                "name": "Object 1: Text",
                "style": {
                    "color":     "zyante-black",
                    "font-size": "14px",
                    "left":      "0px",
                    "top" :      "0px",
                }
            },
            {
                "type": "ShortAnswer",
                "id":   "1",
                "name": "Object 2: Short answer",
                "style": {
                    "font-size": "14px",
                    "left":      "0px",
                    "top" :      "20px",
                    "width":     "80px"
                },
                "placeholder": "Ex: 5"
            }
        ],
        "levels": [
            {
                "explanation":     `Level 1 explanation.[image](0BzqFUYbxIdClOW8wY0prZFZfVEk).[table hrow 300 150 18][11&21
12&22]
[spreadsheet 300 150 18][a1&b1
12&b2][default&blue
orange&green]`,
                "name":            "Level 1",
                "usedElements":    ["0", "1"],
                "elementVariants": [],
                "questions": [
                    {
                        "explanation":     "[image 0 100](0BzqFUYbxIdClMEVPblI2OHBWblU)Question explanation.[image 200 200](0BzqFUYbxIdClR3U2ZlFGOENHVlE)[image 300](0BzqFUYbxIdClVHV1ekZhZnRNZW8)",
                        "usedElements":    [],
                        "name":            "Question a",
                        "elementVariants": [
                            {
                                "id":   "0",
                                "text": "Enter the result of 2 + 2"
                            },
                            {
                                "id":   "1",
                                "correctAnswers": [ "4" ]
                            }
                        ]
                    }
                ]
            },
            {
                "explanation":     "Level 2 explanation.[image](thisiddoesnotexistihope)",
                "name":            "Level 2",
                "usedElements":    ["0", "1"],
                "elementVariants": [],
                "questions": [
                    {
                        "explanation":     "",
                        "usedElements":    [],
                        "name":            "Question a",
                        "elementVariants": [
                            {
                                "id":   "0",
                                "text": "Enter a value between 7 and 13"
                            },
                            {
                                "id":   "1",
                                "correctAnswers": [ "10" ],
                                "assessmentMethod": "numericalMatch",
                                "assessmentProperties": {
                                    toleranceAbsoluteValue: 3,
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    }
}
