## zySpreadSheet Tool

This tool is to simulate basic functionality of a spreadsheet style GUI.

All 5 options for this tool are optional.

* useProgression: (boolean) Sets tool in progression mode.
* rows:           (Number) Sets the number of rows for the spreadsheet.
* columns:        (Number) Sets the number of columns for the spreadsheet.
* locked:         (Array of strings) Locks indicated cells from being modified.
* prefill:        (Keys & values) Sets default contents of a given cell.
    * |key|   contains the cell position in the grid.
    * |value| contains the prefill contents for the cell indicated in |key|
    * e.g.)   [key]: [value]

