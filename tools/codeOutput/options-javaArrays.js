{
    language: 'java',
    levels: [
        {
            parameters: {
                firstElement: [
                    '1',
                    '2',
                    '3'
                ],
                secondElement: [
                    '4',
                    '5',
                    '6'
                ],
                thirdElement: [
                    '7',
                    '8',
                    '9'
                ]
            },
            template: 'public class arrayOutput {\n   public static void main (String [] args) {\n      final int NUM_ELEMENTS = 3;\n      int [] userVals = new int[NUM_ELEMENTS];\n      int i = 0;\n   \n      userVals[0] = {{firstElement}};\n      userVals[1] = {{secondElement}};\n      userVals[2] = {{thirdElement}};\n   \n      for (i = 0; i < NUM_ELEMENTS; ++i) {\n         System.out.println(userVals[i]);\n      }\n   \n      return;\n   }\n}'
        },
        {
            parameters: {
                firstElement: [
                    '1',
                    '2',
                    '3'
                ],
                secondElement: [
                    '5',
                    '6'
                ],
                thirdElement: [
                    '7',
                    '8',
                    '9'
                ]
            },
            template: 'public class arrayOutput {\n   public static void main (String [] args) {\n      final int NUM_ELEMENTS = 3;\n      int [] userVals = new int[NUM_ELEMENTS];\n      int i = 0;\n   \n      userVals[0] = {{firstElement}};\n      userVals[1] = {{secondElement}};\n      userVals[2] = {{thirdElement}};\n\n      // Note: This line was added\n      userVals[0] = userVals[0] + 1;\n   \n      for (i = 0; i < NUM_ELEMENTS; ++i) {\n         System.out.println(userVals[i]);\n      }\n   \n      return;\n   }\n}'
        },
        {
            parameters: {
                firstElement: [
                    '1',
                    '2',
                    '3'
                ],
                secondElement: [
                    '5',
                    '6'
                ],
                thirdElement: [
                    '7',
                    '8',
                    '9'
                ]
            },
            template: 'public class arrayOutput {\n   public static void main (String [] args) {\n      final int NUM_ELEMENTS = 3;\n      int [] userVals = new int[NUM_ELEMENTS];\n      int i = 0;\n   \n      userVals[0] = {{firstElement}};\n      userVals[1] = {{secondElement}};\n      userVals[2] = {{thirdElement}};\n\n      userVals[0] = userVals[0] + 1;\n      userVals[2] = userVals[2] + 2;\n   \n      for (i = 0; i < NUM_ELEMENTS; ++i) {\n         System.out.println(userVals[i]);\n      }\n   \n      return;\n   }\n}'
        },
        {
            parameters: {
                firstElement: [
                    '1',
                    '2',
                    '3'
                ],
                secondElement: [
                    '4',
                    '5',
                    '6'
                ],
                thirdElement: [
                    '7',
                    '8',
                    '9'
                ]
            },
            template: 'public class arrayOutput {\n   public static void main (String [] args) {\n      final int NUM_ELEMENTS = 3;\n      int [] userVals = new int[NUM_ELEMENTS];\n      int i = 0;\n   \n      userVals[0] = {{firstElement}};\n      userVals[1] = {{secondElement}};\n      userVals[2] = {{thirdElement}};\n\n      userVals[0] = userVals[1];\n   \n      for (i = 0; i < NUM_ELEMENTS; ++i) {\n         System.out.println(userVals[i]);\n      }\n   \n      return;\n   }\n}'
        },
        {
            parameters: {
                firstElement: [
                    '1',
                    '2',
                    '3'
                ],
                secondElement: [
                    '4',
                    '5',
                    '6'
                ],
                thirdElement: [
                    '7',
                    '8',
                    '9'
                ]
            },
            template: 'public class arrayOutput {\n   public static void main (String [] args) {\n      final int NUM_ELEMENTS = 3;\n      int [] userVals = new int[NUM_ELEMENTS];\n      int i = 0;\n   \n      userVals[0] = {{firstElement}};\n      userVals[1] = {{secondElement}};\n      userVals[2] = {{thirdElement}};\n\n      userVals[0] = userVals[2];\n      userVals[2] = userVals[0];\n   \n      for (i = 0; i < NUM_ELEMENTS; ++i) {\n         System.out.println(userVals[i]);\n      }\n   \n      return;\n   }\n}'
        }
    ]
}