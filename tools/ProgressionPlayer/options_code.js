{
    "progression": {
        "code": "def divideTwoValues(v1, v2):\n    return v1 / v2",
        "explanation": null,
        "height": "350px",
        "width": "550px",
        "elements": [
            {
                "type": "shortanswer",
                "correctAnswers": [],
                "id": "1",
                "isInEditMode": false,
                "isSelected": false,
                "name": "Object 2: Shortanswer",
                "placeholder": null,
                "style": {
                    "border-radius": 0.0,
                    "font-size": "20px",
                    "left": "23px",
                    "opacity": 1.0,
                    "top": "70px",
                    "transform": "rotate(0deg)",
                    "width": "80px"
                },
            },
            {
                "type": "text",
                "text": "Reduce: ${aNumerator} / ${aDenominator}",
                "id": "0",
                "isInEditMode": false,
                "isSelected": true,
                "name": "Object 1: Text",
                "style": {
                    "border": "2px solid rgba(0, 0, 0, 0)",
                    "border-radius": 0.0,
                    "color": "zyante-black",
                    "font-size": "20px",
                    "left": "20px",
                    "opacity": 1.0,
                    "padding": "0px",
                    "top": "26px",
                    "transform": "rotate(0deg)",
                },
            },
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
                        "code": "aNumerator = pickFrom([18, 12, 6])\naDenominator = pickFromRange(2, 3)\naValue = divideTwoValues(aNumerator, aDenominator) if (aNumerator &gt; 0) else 0",
                        "elementVariants": [
                            {
                                "correctAnswers": [
                                    "${aValue}"
                                ],
                                "id": "1",
                                "placeholder": "Ex: 8"
                            },
                            {
                                "id": "0",
                                "text": "Reduce: ${aNumerator} / ${aDenominator}"
                            }
                        ],
                        "explanation": "${aNumerator} / ${aDenominator} = ${aValue}",
                        "height": null,
                        "isSelected": true,
                        "name": "Question a",
                        "usedElements": [],
                        "width": null
                    }
                ],
                "usedElements": [
                    "0",
                    "1"
                ],
                "width": null,
            }
        ],
    }
}