## Instruction Set Software Development Kit

The kit contains re-usable objects, controllers, templates, and CSS for instruction set software development, such as MIPS and ARM.

The kit exposes:
* A set of basic models:
    * Instruction
        * A generic instruction
    * Instructions
        * Array of Instruction
    * Registers
        * A generic array of Byte
    * Memory
        * A generic array of Byte
    * Simulator
        * Run Instructions with given Registers and Memory.
* A set of object controllers:
    * InstructionsController
        * Render and update an Instructions object based on user interaction
    * RegistersController
        * Render a Registers object
    * MemoryController
        * Render a Memory object
* Basic templates:
    * instructions
        * Print Instructions (array of Instruction)
    * select
        * A dropdown menu
    * memoryCells
        * Print a MemoryCells, such as Registers and Memory.
    * developmentEnvironment
        * Formatted placeholders for instructions, registers, and memory
    * instructionsAndComments
        * Print each instruction and associated comment
* CSS for styling templates