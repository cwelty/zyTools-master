{
    instructionSet: 'MIPSzy',
    import:         '{"code":"bge $t1, $t2, beep\nj exit\n\nbeep:\naddi $t3, $t3, 1\n\nexit:","registers":"$t1 5000, $t2 0, $t3 0","memory":"5000 30"}',
    showMachineInstructions: true,
}