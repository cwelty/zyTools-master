## Progression Utilities

Utilities that contain re-usable objects, controllers, templates, CSS, and common behavior for ProgressionBuilder and ProgressionPlayer.

The utilities expose:
* A set of basic models:
    * Progression
        * Defines a progression of levels and questions
    * Level
        * A level in a progression
    * Question
        * A question in a level
    * ElementVariant
        * A variant of an element in a question or level
    * Element
        * An element in a progression
    * ElementDropdownOption
        * An option in a dropdown element
* An object controller:
    * ElementController
        * Render an element
* Basic templates:
    * ElementDropdown
        * Print a dropdown with options
    * ElementImage
        * Print an image
    * ElementStyle
        * Build inline CSS styles
    * ElementText
        * Print text
    * QuestionArea
        * A container for elements
* CSS for styling a question area
* Common behaviors:
    * Download and render an image, including error handling
    * Find most specific property value for a given question