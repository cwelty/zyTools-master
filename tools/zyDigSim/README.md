zyDigSim Tool

A web based logic tool. Allows a user to build circuits from basic gates. Includes input/output elements that can be used to 
test the functionality of the circuit.

Options:
    * canEdit - boolean - Toggles the ability to modify the circuit.
    * canExport - boolean - Toggles the import/export functionality off and on.
    * toolBoxEnabled - boolean - Toggles the toolBox off and on.
    * basicOnly - boolean - Enabling this disables Xor Nor and Nand gates.
    * circuit - string - JSON string of a circuit that loads when started. JSONToLoad is the legacy option name.
    * progressive - boolean - Enables the progression tool version of zyDigSim.
    * useMultipleParts - Non-required boolean. Default is false. If set to true, then inform progression tool to use multiple part event submission.
    * useComponents - boolean - Enables the placing of components such as adders, comparators, muxs, and load registers.
    * useDiscreteMathNotation - boolean - optional - Displayed equations use discrete math notation. Default is false.