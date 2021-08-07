{
    "progression": {
        "explanation": "Progression explanation.",
        "height":      "300px",
        "width":       "560px",
        "elements": [
            {
                "type": "Text",
                "id":   "0",
                "name": "Object 1: Text",
                "style": {
                    "color":     "zyante-black",
                    "font-size": "14px",
                    "left":      "223px",
                    "top" :      "0",
                }
            },
            {
                "type": "ShortAnswer",
                "id":   "1",
                "name": "Object 2: Short answer",
                "style": {
                    "font-size": "14px",
                    "left":      "155px",
                    "top" :      "20px",
                    "width":     "80px"
                },
                "placeholder": "Ex: 5"
            }
        ],
        "levels": [
            {
                "explanation":     "Level 1 explanation.",
                "name":            "Level 1",
                "usedElements":    ["0", "1"],
                "elementVariants": [],
                "questions": [
                    {
                        "explanation":     "Question explanation.",
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
                "explanation":     "Level 2 explanation.",
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
                                "text": "Enter a value between 9.5 and 10.5"
                            },
                            {
                                "id":   "1",
                                "correctAnswers": [ "10" ],
                                "assessmentMethod": "numericalMatch",
                                "assessmentProperties": {
                                    tolerancePercentage: 5,
                                }
                            }
                        ]
                    }
                ]
            },
            {
                "explanation":     "Level 3 explanation.",
                "name":            "Level 3",
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