## MIPS Software Development Kit

The kit inherits InstructionSetSDK. See InstructionSetSDK's README for more details.

* A set of models:
    * Instruction of various types
        * Ex: Create add instruction with createAddInstruction
    * Registers
        * Array of Byte. Uses MIPS' register names
    * Memory
        * Array of Byte
* A set of object controllers:
    * InstructionsController
        * Render and update an Instructions object based on user interaction
* Basic templates:
    * instruction
        * Print an Instruction using dropdowns