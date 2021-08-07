{
    "input": null, 
    "input_enabled": false, 
    "language": "java", 
    "multifiles": [
        {
            "filename": "RightTriangle.java", 
            "main": null, 
            "program": "\nimport java.lang.Math;\n\npublic class RightTriangle {\n   private double side1;\n   // FIXME: Define side2\n\n   public void setSide1(double side1Val) {\n      side1 = side1Val;\n\n      return;\n   }\n\n   // FIXME: Define setSide2()\n\n   public double getHypotenuse() {\n      return -1.0; // FIXME: temporary until side2 defined\n      // return Math.sqrt((side1 * side1) + (side2 * side2));\n   }\n}\n"
        }, 
        {
            "filename": "HypotenuseCalc.java", 
            "main": "true", 
            "program": "\nimport java.util.Scanner;\n\npublic class HypotenuseCalc {\n   public static void main(String[] args) {\n      Scanner scnr = new Scanner(System.in);\n      RightTriangle triangleA = new RightTriangle();\n\n      triangleA.setSide1(3.0);\n      // FIXME: Set side2 to 4.0\n\n      System.out.println(\"Hypotenuse: \" + triangleA.getHypotenuse());\n      // Should output 5 for the above side values\n\n      return;\n   }\n}\n"
        }
    ], 
    "program": "\nimport java.util.Scanner;\n\npublic class HypotenuseCalc {\n   public static void main(String[] args) {\n      Scanner scnr = new Scanner(System.in);\n      RightTriangle triangleA = new RightTriangle();\n\n      triangleA.setSide1(3.0);\n      // FIXME: Set side2 to 4.0\n\n      System.out.println(\"Hypotenuse: \" + triangleA.getHypotenuse());\n      // Should output 5 for the above side values\n\n      return;\n   }\n}\n", 
    "reset_enabled": true, 
    "stacked": false
}
