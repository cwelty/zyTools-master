# Flowchart rendering engine

The flowchart rendering engine produces a visual flowchart. The input is a flowchart data structure.

## Input to engine: Flowchart data structure

The data structure represents a flowchart via nodes, each of which stores 0, 1, or 2 children.

Example data structure 1:
* Start node
    * Children: Loop node
* Loop node
    * Children: Loop node (true branch), End node (false branch)
* End node
    * Children: (none)
Visually, this looks like:
![ex1](https://user-images.githubusercontent.com/3512898/28601189-8aa59448-716b-11e7-9658-a0fad0f0f91f.png)

Example data structure 2:
* Start node
    * Children: If node
* If node
    * Children: End node (true branch), Loop node (false branch)
* Loop node
    * Children: Loop node (true branch), End node (false branch)
* End node
    * Children: (none)
Although only 4 nodes, the flowchart has complicated edges, which makes rendering hard.
![ex2](https://user-images.githubusercontent.com/3512898/28601188-8a9369bc-716b-11e7-9ecd-0222c66f71ab.png)

## Rendering engine internal data structure

The internal data structure is a list, containing 4 indicators:

| Name | Indicates | Stores |
|------------------|-----------------------------------------------------|-----------------------------------------------------------------------|
| Node (N) | A node | The indicated node. Row and column of node for layout purposes. |
| BackToLoop (B) | An edge back to a loop | Loop node that edge goes back to |
| Merge true (MT) | Merge after a true branch (used for if nodes) | The associated if node. The merge point's head (row and column). |
| Merge false (MF) | Merge after a false branch (used for if nodes) | The associated if node. |

Example data structure 1 becomes:
1. N (Start, row 0, column 0)
2. N (Loop, row 1, column 0)
3. B (Loop)
4. N (End, row 2, column 0)

Example data structure 2 becomes:
1. N (Start, row 0, column 0)
2. N (If, row 1, column 0)
3. MT (If, row 1, column 2)
4. N (Loop, row 2, column 1)
5. B (Loop)
6. MF (If)
7. N (End, row 3, column 0)

An edge is created from between each item in the list. Data structure 1's list has 3 betweens (3 edges), and data structure 2's has 6 betweens (6 edges).

Note that different edges are used for different betweens. There is a pattern, though.

Below is the list of all between combinations and edge types.

| Between # | Previous | Current | Edge type (solid) |
|-----------|--------------------------|---------------|----------------------------------------------------------------------------------------------|
| 1 | N (if, elseif, or loop) | N | ![b1](https://user-images.githubusercontent.com/3512898/30228590-4b8dd892-9493-11e7-9fb6-b1eb624ec6f2.png) |
| 2 | N (not [if, elseif, or loop]) | N | ![b2](https://user-images.githubusercontent.com/3512898/28601186-8a90efc0-716b-11e7-9942-21ec693acd18.png) |
| 3 | N (loop) | B | ![b3](https://user-images.githubusercontent.com/3512898/28601185-8a8f3c02-716b-11e7-929e-4fda2916902e.png) |
| 4 | N (not loop) | B | ![b4](https://user-images.githubusercontent.com/3512898/28601184-8a8eff3a-716b-11e7-8e13-8b04f2d2fd61.png) |
| 5 | N (if or elseif) | MT | ![b5](https://user-images.githubusercontent.com/3512898/28601183-8a8e0094-716b-11e7-921a-81e1e61b1e2c.png) |
| 6 | N (not [if or elseif]) | MT | ![b6](https://user-images.githubusercontent.com/3512898/28601180-8a7ade2e-716b-11e7-9dc0-6693a8494d64.png) |
| 7 | N | MF | ![b7](https://user-images.githubusercontent.com/3512898/28601181-8a7afa08-716b-11e7-95b9-3fb3534f2735.png) |
| 8 | B | N | ![b8](https://user-images.githubusercontent.com/3512898/28601179-8a79ef6e-716b-11e7-8797-19879d05e5e7.png) |
| 9 | B (loop2) | B (loop1) | ![b9](https://user-images.githubusercontent.com/3512898/28601182-8a7c412e-716b-11e7-8634-8afd24511243.png) |
| 10 | B | MT | ![b10](https://user-images.githubusercontent.com/3512898/28601178-8a789bfa-716b-11e7-8719-383277fc47e2.png) |
| 11 | B | MF | ![b11](https://user-images.githubusercontent.com/3512898/28601177-8a779732-716b-11e7-9470-6f6440f2da91.png) |
| 12 | MT | N (elseif) | ![b13](https://user-images.githubusercontent.com/3512898/32076496-0257f6d4-ba55-11e7-827c-aa2d900c4ab8.png) |
| 13 | MT | N (not elseif) | ![b12](https://user-images.githubusercontent.com/3512898/28601175-8a619f5e-716b-11e7-88ca-a4b5b7b1f3cb.png) |
| 14 | MT | B | Not possible. B won't happen till after MF. MT always comes before MF. |
| 15 | MT (if1 or elseif1) | MT (if2 or elseif2) | Not possible. MT(if2 or elseif2) won't happen till after MF(if1 or elseif1). MT always comes before MF. |
| 16 | MT | MF | ![b15](https://user-images.githubusercontent.com/3512898/28601172-8a60c6a6-716b-11e7-9243-1b6f7a04b586.png) |
| 17 | MF (if) | Node | ![b16](https://user-images.githubusercontent.com/3512898/28601173-8a610436-716b-11e7-9b6d-468ea77b3e1e.png) |
| 18 | MF (elseif) | Node | Do nothing. Elseif nodes use the same merging edge as the parent if node |
| 19 | MF (if) | B | ![b17](https://user-images.githubusercontent.com/3512898/28601174-8a615b20-716b-11e7-90fb-29d6e7dec9f3.png) |
| 20 | MF (elseif) | B | Do nothing. Elseif nodes use the same merging edge as the parent if node |
| 21 | MF | MT | Not possible. MT always comes before MF. |
| 22 | MF (if2) | MT (if1) | ![b19](https://user-images.githubusercontent.com/3512898/28601171-8a5fcd5a-716b-11e7-9969-1bb80bdf706c.png) |
| 23 | MF (elseif2) | MT (if1 or elseif1) | Not possible b/c the parent if node will an MF before there can be a MT |
| 24 | MF (if2) | MF (if1 or elseif1) | ![b20](https://user-images.githubusercontent.com/3512898/28601176-8a61d01e-716b-11e7-9780-39d756728515.png) |
| 25 | MF (elseif2) | MF (if1 or elseif1) | Do nothing. Elseif nodes use the same merging edge as the parent if node |

---

Images in this README were created here:
https://docs.google.com/document/d/1AM5tY7YgYcmaq4zBHE0fFQphva3cWfKWsEj0UMnIwZw