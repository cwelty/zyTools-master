## Progression tool template

The progression tool template contains defined behavior, including a Start/Reset/Next/Check buttons and progression status bar.

The progresion tool template is designed to be pulled into another tool.

The other tool must specify 7 options to the progression tool template:
* html - the other tool's specific HTML
* css - the other tool's specific CSS
* numToWin - the number of questions to win
* start - a function defining the other tool's behavior when the user presses the "Start" button
* reset - a function defining the other tool's behavior when the user presses the "Reset" button
* next - a function defining the other tool's behavior when the user presses the "Next" button. This function will automatically be passed the currentQuestion counter.
* isCorrect - a function defining the other tool's behavior when the user presses the "Check" button, returning a boolean. This function will automatically be passed the currentQuestion counter.
* useMultipleParts - Non-required boolean. Default is false. If set to true, then use multiple part submission.
* accessibleViewForLevel - Optional. Function that returns a {Promise} of an accessible view for a given level.

For example, from inside the other tool's init function:
```javascript
require('progressionTool').create().init(this.id, this.parentResource, () => {
    html: otherToolsHTML,
    css: otherToolsCSS,
    numToWin: otherToolsNumCorrectToWin,
    start: () => {
        // Other tool's start button behavior
    },
    reset: () => {
        // Other tool's reset button behavior
    },
    next: currentQuestion => {
        // Other tool's next button behavior
    },
    isCorrect: currentQuestion => {
        // Other tool's definition of whether the user's answer is correct. Return a boolean.
    },
    accessibleViewForLevel: currentQuestion => {
        // Other tool's accessible view for a given level
    }
});

// Other tool's initialization behavior
```