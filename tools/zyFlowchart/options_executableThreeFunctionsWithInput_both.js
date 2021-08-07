{
    code: `
Function Main() returns nothing
   integer numStars
   // Get the number of stars
   numStars = GetUserInput()
   PrintStars(numStars)

Function GetUserInput() returns integer numStars
   numStars = Get next input

Function PrintStars(integer numStars) returns nothing
   integer counter
   counter = 0

   // Just adding a bunch of lines of code.
   counter = 0
   counter = 0
   counter = 0
   counter = 0
   counter = 0
   counter = 0
   counter = 0
   counter = 0
   counter = 0
   counter = 0

   while counter &lt; numStars
      counter = counter + 1
      Put "*" to output
`,
    input: '5',
    isEditable: true,
    isExecutable: true,
    languagesToShow: 'both'
}