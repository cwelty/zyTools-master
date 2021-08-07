{
    language:  'java',
    levels: [
        {
            template: [
                {
                    filename: 'Person.java',
                    main: null,
                    program: 'public class Person {\n   private String firstName;\n\n   public void setFirstName(String firstNameToSet) {\n      firstName = firstNameToSet;\n      return;\n   }\n   public String getFirstName() {\n      return firstName;\n   }\n}',
                },
                {
                    filename: '{{className}}.java',
                    main: true,
                    program: 'public class {{className}} {\n   public static void main(String [] args) {\n      String userName = "{{userName}}";\n      Person person1 = new Person();\n\n      person1.setFirstName(userName);\n      System.out.print("{{subject}} " + person1.getFirstName());\n\n      return;\n   }\n}',
                },
            ],
            parameters: {
                userName: ['Max', 'Sam', 'Bob', 'Joe', 'Ron'],
                subject: ['I am', 'You are', 'He is'],
                className: ['CallPerson', 'PersonName']
            },
            explanation: 'SetFirstName assigns the value in userName to person1\'s firstName member variable. GetFirstName returns the value of person1\'s firstName.'
        },
        {
            template: [
                {
                    filename: 'Person.java',
                    main: false,
                    program: 'public class Person {\n   private String firstName;\n   private String lastName;\n   \n   public void setFirstName(String firstNameToSet) {\n      firstName = firstNameToSet;\n   }\n   \n   public void setLastName(String lastNameToSet) {\n      lastName = lastNameToSet;\n   }\n   \n   public String getFullName() {\n      return {{{getFullName}}};\n   }\n}',
                },
                {
                    filename: 'CallPerson.java',
                    main: true,
                    program: 'public class CallPerson {\n   public static void main(String [] args) {\n      String userFirstName = "{{firstName}}";\n      String userLastName = "{{lastName}}";\n      Person person1 = new Person();\n   \n      person1.setFirstName(userFirstName);\n      person1.setLastName(userLastName);\n      System.out.print("{{subject}} " + person1.getFullName());\n   \n      return;\n   }\n}',
                },
            ],
            parameters: {
                firstName: ['Max', 'Sam', 'Bob', 'Joe', 'Ron'],
                lastName: ['Kent', 'Wayne', 'Stark', 'Parker', 'Rogers', 'Banner'],
                subject: ['I am', 'You are', 'He is'],
                getFullName: ['firstName + " " + lastName',
                              'firstName + "_" + lastName',
                              'firstName + "-" + lastName',
                              'lastName + " " + firstName',
                              'lastName + ", " + firstName',
                              '"(" + lastName + ", " + firstName + ")"']
            },
            explanation: 'GetFullName returns a combination of person1\'s firstName and lastName.'
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
            template: [
                {
                    filename: 'main.java',
                    main: false,
                    program: 'public class arrayOutput {\n   public static void main (String [] args) {\n      final int NUM_ELEMENTS = 3;\n      int [] userVals = new int[NUM_ELEMENTS];\n      int i = 0;\n   \n      userVals[0] = {{firstElement}};\n      userVals[1] = {{secondElement}};\n      userVals[2] = {{thirdElement}};\n   \n      for (i = 0; i < NUM_ELEMENTS; ++i) {\n         System.out.println(userVals[i]);\n      }\n   \n      return;\n   }\n}'
                },
            ],
        },
        {
            template: [
                {
                    filename: 'Dog.java',
                    main: false,
                    program: 'public class Dog {\n   private int years;\n   private int weight;\n   private String size;\n   private int humanYears;\n\n   private void setHumanYears() {\n      int factor = 0;\n\n      if (size == "small") {\n         factor = 6;\n      }\n      else if (size == "medium") {\n         factor = 7;\n      }\n      else {\n         factor = 8;\n      }\n\n      humanYears = years * factor;\n   }\n   public int getHumanYears() {\n      return humanYears;\n   }\n\n   public void SetWeightAndAge(int weightToSet, int yearsToSet) {\n      weight = weightToSet;\n\n      if (weight <= {{small}}) {\n         size = "small";\n      }\n      else if (weight <= {{medium}}) {\n         size = "medium";\n     }\n      else {\n         size = "large";\n     }\n\n      years = yearsToSet;\n      setHumanYears();\n   }\n}',
                },
                {
                    filename: 'CallDog.java',
                    main: true,
                    program: 'public class CallDog {\n   public static void main(String [] args) {\n      Dog buddy = new Dog();\n\n      buddy.SetWeightAndAge({{weight}}, {{years}});\n      System.out.print("Human years: " + buddy.getHumanYears());\n\n      return;\n  }\n}',
                },
            ],
            parameters: {
                small: [ 15, 20, 25 ],
                medium: [ 45, 50, 55 ],
                weight: [ 14, 18, 23, 30, 40, 49, 52, 57, 65, 78, 82 ],
                years: [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ],
            },
            explanation: 'The SetWeightAndAge mutator calls the SetHumanYears private helper. The human years equivalent to the dog\'s age depends on the dog\'s size.'
        }
    ]
}
