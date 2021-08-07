## zyde

This tool has 7 options: |input_enabled| (boolean), |stacked| (boolean), |language| (programming language being used), |multifiles| (programs and their filenames), |program| (what is printed for the program), |reset_enabled| (boolean), and |input| (string of test input).
The default options:

        var language = "java";
        var inputEnabled = true;
        var resetEnabled = true;
        var stacked = true;
        var input = "this is test input";
        var program = "\npublic class PrintTriangle {\n   public static void main (String [] args) {\n      System.out.println(\"  *  \");\n      System.out.println(\" *** \");\n      System.out.println(\"*****\");\n    \n      return;\n  }\n}\n";
        var multifiles = [
            {
                "program": "\npublic class PrintTriangle {\n   public static void main (String [] args) {\n      System.out.println(\"  *  \");\n      System.out.println(\" *** \");\n      System.out.println(\"*****\");\n    \n      return;\n  }\n}\n",
                "main": null,
                "filename": "PrintTriangle.java"
            },
            {
                "program": "",
                "main": null,
                "filename": "fileb.java"
            }
        ];

Options not needed.

Optionally:
* |zyde_host| is a string. Optionally override the default zyDE host URL
* |useHomePageStyling| is a boolean. Optionally use styling for the home page.