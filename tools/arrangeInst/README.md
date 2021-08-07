## Instruction arrange tool

Instruction arrange tool has 2 options:

    * |vars| & |instrs| are deprecated options that exist for legacy support.

    * |variables|: This option is not required. This options is an array of strings. This options defines an array of variable names. The default values are defined below.

    * |instructions|: Not required. An array of objects. Each object has two properties:
        * |code| Required string. The instruction's code.
        * |sortable| Required boolean. Whether this instruction is sortable. Legacy: Required string with option of 'sortable' or 'unsortable'.

    * |newVersion|: Whether to use the new version styling. Optional boolean.

    * Default values:

        'variables': ['wage', 'hours', 'pay'],

        'instructions': [
            { code: 'wage = 10', sortable: false },
            { code: 'hours = 40', sortable: false },
            { code: 'pay = wage * hours', sortable: false },
            { code: 'print pay', sortable: true },
            { code: 'hours = 35', sortable: true },
            { code: 'pay = wage * hours', sortable: true }
        ]

        'newVersion': false