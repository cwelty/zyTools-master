{
    language: 'cpp',
    levels: [
        {
            prompt: `Assign resultProduct with the product of {{objective.prompt}} price.`,
            explanation: 'First resultProduct is assigned with the first element in productList. Then a for loop is needed to iterate through the array and compare resultProduct with the element being iterated.',
            solution: `   resultProduct = productList.at(0);
   for (i = 0; i < productList.size(); ++i) {
      if (productList.at(i).GetPrice() {{{objective.sign}}} resultProduct.GetPrice()) {
         resultProduct = productList.at(i);
      }
   }`,
            parameters: {
                objective: [
                    {
                        prompt: 'highest',
                        sign: '>',
                    },
                    {
                        prompt: 'lowest',
                        sign: '<',
                    }
                ],
            },
            program: [
                {
                    filename: 'main.cpp',
                    main: true,
                    code: {
                        prefix: `#include <iostream>
#include <string>
#include <vector>
#include "Product.h"
using namespace std;

int main() {
   vector<Product> productList;
   Product currProduct;
   int currPrice;
   string currName;
   unsigned int i;
   Product resultProduct;

   cin >> currPrice;
   while (currPrice > 0) {
      cin >> currName;
      currProduct.SetPriceAndName(currPrice, currName);
      productList.push_back(currProduct);
      cin >> currPrice;
   }
   `,
                        postfix: `
   cout << "$" << resultProduct.GetPrice() << " " << resultProduct.GetName() << endl;

   return 0;
}`
                    }
                },
                {
                    filename: 'Product.h',
                    main: false,
                    code: `#ifndef PRODUCT_H
#define PRODUCT_H
#include <string>

class Product {
   public:
      void SetPriceAndName(int productPrice, std::string productName);
      int GetPrice() const { return price; };
      std::string GetName() const { return name; };
   private:
      int price;
      std::string name;
};
#endif`,
                },
                {
                    filename: 'Product.cpp',
                    main: false,
                    code: `#include "Product.h"
using namespace std;

void Product::SetPriceAndName(int productPrice, std::string productName) {
   price = productPrice;
   name = productName;
};`,
                }
            ],
            input: [ '10 Berries\n12 Flowers\n6 Shirt\n-1', '10 Berries\n11 Paper\n13 Belt\n-1', '5 Tuna\n8 Flowers\n12 Socks\n-1', '14 Cheese\n6 Foil\n7 Shirt\n4 Tuna\n8 Socks\n-1' ],
        },

        {
            prompt: `Fill the PrintAfterDiscount function in Products.cpp to assign currDiscountPrice with the subtraction of each products' price and discountPrice.`,
            explanation: 'Use .at() to get the product, then use GetPrice() to get the products\' price, and then subtract discountPrice to the products\' price.',
            solution: `currDiscountPrice = productList.at(i).GetPrice() - discountPrice;`,
            parameters: {
                discount: [ 1, 2, 3, 4, 5 ],
            },
            program: [
                {
                    filename: 'main.cpp',
                    main: true,
                    code: `#include "Products.h"
using namespace std;

int main() {
   Products allProducts;

   allProducts.InputProducts();
   allProducts.PrintAfterDiscount({{discount}});

   return 0;
}`
                },
                {
                    filename: 'Product.h',
                    main: false,
                    code: `#ifndef PRODUCT_H
#define PRODUCT_H
#include <string>

class Product {
   public:
      void SetPriceAndName(int productPrice, std::string productName);
      int GetPrice() const { return price; };
      std::string GetName() const { return name; };
   private:
      int price;
      std::string name;
};
#endif`,
                },
                {
                    filename: 'Product.cpp',
                    main: false,
                    code: `#include "Product.h"
using namespace std;

void Product::SetPriceAndName(int productPrice, std::string productName) {
   price = productPrice;
   name = productName;
};`,
                },
                {
                    filename: 'Products.h',
                    main: false,
                    code: `#ifndef PRODUCTS_H
#define PRODUCTS_H

#include <vector>
#include "Product.h"

class Products {
   public:
      void InputProducts();
      void PrintAfterDiscount(int discountPrice);
   private:
      std::vector<Product> productList;
};
#endif`,
                },
                {
                    filename: 'Products.cpp',
                    main: false,
                    code: {
                        prefix: `#include <iostream>
#include "Products.h"
using namespace std;

void Products::InputProducts() {
   Product currProduct;
   int currPrice;
   string currName;

   cin >> currPrice;
   while (currPrice > 0) {
      cin >> currName;
      currProduct.SetPriceAndName(currPrice, currName);
      productList.push_back(currProduct);
      cin >> currPrice;
   }
}

void Products::PrintAfterDiscount(int discountPrice) {
   unsigned int i;
   int currDiscountPrice;

   for (i = 0; i < productList.size(); ++i) {
      `,
                        postfix: `
      cout << productList.at(i).GetName() << ": " << currDiscountPrice << endl;
   }
}`,
                    },
                },
            ],
            input: [ '10 Berries\n12 Flowers\n6 Shirt\n-1', '10 Berries\n11 Paper\n13 Belt\n-1', '7 Tuna\n8 Flowers\n12 Socks\n-1', '14 Cheese\n6 Foil\n7 Shirt\n9 Tuna\n8 Socks\n-1' ],
        },

        {
            prompt: `Fill the PrintSale function in Store.cpp to output the store's name followed by "'s sale" and an endline, and the call products' PrintAfterDiscount with saleAmount.`,
            explanation: 'First output the store\'s name, then "\'s sale" and an endline. Then use products to call PrintAfterDiscount with parameter saleAmount.',
            solution: `cout << name << "'s sale:" << endl;
products.PrintAfterDiscount(saleAmount);`,
            parameters: {
                discount: [ 1, 2, 3 ]
            },
            program: [
                {
                    filename: 'main.cpp',
                    main: true,
                    code: `#include <string>
#include <iostream>
#include "Store.h"
using namespace std;

int main() {
   Store ourPlace;
   string currName;

   cin >> currName;
   ourPlace.SetName(currName);

   ourPlace.ReadAllProducts();
   ourPlace.PrintSale({{discount}});

   return 0;
}`
                },
                {
                    filename: 'Product.h',
                    main: false,
                    code: `#ifndef PRODUCT_H
#define PRODUCT_H
#include <string>

class Product {
   public:
      void SetPriceAndName(int productPrice, std::string productName);
      int GetPrice() const { return price; };
      std::string GetName() const { return name; };
   private:
      int price;
      std::string name;
};
#endif`
                },
                {
                    filename: 'Product.cpp',
                    main: false,
                    code: `#include "Product.h"
using namespace std;

void Product::SetPriceAndName(int productPrice, std::string productName) {
   price = productPrice;
   name = productName;
};`
                },
                {
                    filename: 'Products.h',
                    main: false,
                    code: `#ifndef PRODUCTS_H
#define PRODUCTS_H

#include <vector>
#include "Product.h"

class Products {
   public:
      void InputProducts();
      void PrintAfterDiscount(int discountPrice);
   private:
      std::vector<Product> productList;
};
#endif`
                },
                {
                    filename: 'Products.cpp',
                    main: false,
                    code: `#include <iostream>
#include "Products.h"
using namespace std;

void Products::InputProducts() {
   Product currProduct;
   int currPrice;
   string currName;

   cin >> currPrice;
   while (currPrice > 0) {
      cin >> currName;
      currProduct.SetPriceAndName(currPrice, currName);
      productList.push_back(currProduct);
      cin >> currPrice;
   }
}

void Products::PrintAfterDiscount(int discountPrice) {
   unsigned int i;
   int currDiscountPrice;

   for (i = 0; i < productList.size(); ++i) {
      currDiscountPrice = productList.at(i).GetPrice() - discountPrice;
      cout << productList.at(i).GetName() << ": " << currDiscountPrice << endl;
  }
}`
                },
                {
                    filename: 'Store.h',
                    main: false,
                    code: `#ifndef STORE_H
#define STORE_H

#include "Products.h"

class Store {
   public:
      void SetName(std::string storeName);
      void ReadAllProducts();
      void PrintSale(int saleAmount);
   private:
      std::string name;
      Products products;
};
#endif`
                },
                {
                    filename: 'Store.cpp',
                    main: false,
                    code: {
                        prefix: `#include <iostream>
#include "Store.h"
using namespace std;

void Store::SetName(string storeName) {
   name = storeName;
}

void Store::ReadAllProducts() {
   products.InputProducts();
}

void Store::PrintSale(int saleAmount) {
   `,
                        postfix: `
}`
                    }
                }
            ],
            input: [ 'Toogle\n10 Berries\n12 Flowers\n6 Shirt\n-1', 'QMart\n10 Berries\n11 Paper\n13 Belt\n-1', 'DealCity\n5 Tuna\n8 Flowers\n12 Socks\n-1', 'Toogle\n14 Cheese\n6 Foil\n7 Shirt\n4 Tuna\n8 Socks\n-1' ],
        }
    ]
}
