## Instruction set simulator

The simulator includes options:
  * |instructionSet| is a required string. Valid value: 'MIPS' (this may be extended later)
  * |import| is a required string. The string stores a JSON structure including code, registers, and memory. The simulator's export produces this string.
  * |useBlackStorageBorder| is an optional boolean. If true, then registers and memory use a black border.
  * |showMachineInstructions| is an optional boolean. If true, then machine instructions are shown.
  * |showIntegerIO| is an optional boolean. If true, then the integer I/O are shown.