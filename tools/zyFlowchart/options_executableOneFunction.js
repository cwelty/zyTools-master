{
    code: `
integer litterSize
integer yearlyLitters
integer annualMice

// Initialize the variables
litterSize = 3
yearlyLitters = 5

// Print some stuff
Put "One female mouse may give birth to " to output
annualMice = litterSize * yearlyLitters
Put annualMice to output
Put " to " to output

// Print more stuff
litterSize = 14
yearlyLitters = 10
annualMice = litterSize * yearlyLitters
Put annualMice to output
Put " mice per year." to output
`,
    isExecutable: true
}