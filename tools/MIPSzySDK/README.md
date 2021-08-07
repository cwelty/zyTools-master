## MIPSzy Software Development Kit

The kit inherits MIPSSDK. See MIPSSDK's README for more details.

MIPSzy is an assembly language used in zyBook's Computer Organization Essentials.

MIPSzy is a subset of MIPS. Differences are:
* Registers supported: $zero, $t0-$t6, $ra, and $sp
* Memory allocations:
    * Instruction memory starts at 0 and goes up
    * Data memory starts at 5000 and goes up
    * Stack starts at address 9000 and goes down
* Some instructions adjusted:
    * blt, ble, bgt, and bge use $t6 as a temporary register