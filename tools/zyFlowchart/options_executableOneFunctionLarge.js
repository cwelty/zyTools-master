{
    code: `
integer riderAge
integer riderHeight

riderAge = Get next input
riderHeight = Get next input

if riderAge &lt; 10
   Put "Can't ride: Too young" to output
else
   if riderAge &lt; 80
      if riderHeight &lt; 48
         Put "Can't ride: Too short" to output
      else
         Put "Can ride" to output
   else
      Put "Can ride, but sure?" to output
`,
    input: '25 47',
    isExecutable: true
}