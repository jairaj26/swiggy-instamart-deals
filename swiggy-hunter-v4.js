javascript:(async () => {
  'use strict';

  /* ==========================================================================
     INSTAMART HUNTER v4 — Category & Subcategory Scout
     
     Features:
     1. Complete 36 Instamart Categories with 110+ subcategories pre-mapped.
     2. Collapsed Subcategories by Default:
        - Categories can be expanded/collapsed with a smooth chevron toggle.
        - Auto-expands on search or when picking subcategories.
     3. Granular Selection:
        - Cherry-pick specific aisles (e.g. Atta, Ghee) or select all aisles.
     4. Zepto-Style 5-Column Product Grid in Results:
        - Green discount badge in top-left corner.
        - Centered product image.
        - Brand, product title, pack description, selling price, and MRP.
        - Direct search links to Swiggy Instamart on click.
     5. Multi-Filter Controls:
        - Subcategory filter, Brand filter, and instant live search.
        - Sorting options (Discount %, Savings ₹, Price Low/High, Name).
     ========================================================================== */

  const CFG = {
    itemsPerPage: 26,
    buildVersion: '2.363.0',
    pacing: { subMin: 1800, subMax: 2800 },
    sections: ['All', 'Featured', 'Fresh', 'Grocery', 'Snacks', 'Beauty', 'Household'],
    cats: {
    "The NOICE Store": {
        "cName": "The NOICE Store",
        "section": "Featured",
        "campaignType": "collection",
        "subs": [
            { "name": "Top Deals", "id": "408822", "isCollection": true },
            { "name": "Dairy, Bread Eggs & More", "id": "377503", "isCollection": true },
            { "name": "Chocolates & Ice Creams", "id": "377513", "isCollection": true },
            { "name": "Munchies", "id": "377515", "isCollection": true },
            { "name": "Atta & Ghee", "id": "395522", "isCollection": true },
            { "name": "Beverages", "id": "377517", "isCollection": true },
            { "name": "Spreads & Dips", "id": "377520", "isCollection": true },
            { "name": "Cakes & Cookies", "id": "377510", "isCollection": true },
            { "name": "Indian Sweets", "id": "377514", "isCollection": true },
            { "name": "Chocolates", "id": "377516", "isCollection": true },
            { "name": "Dry Fruits", "id": "365176", "isCollection": true },
            { "name": "Veg Frozen Food", "id": "377519", "isCollection": true },
            { "name": "Non Veg Frozen Food", "id": "285297", "isCollection": true },
            { "name": "Chutneys & Pickles", "id": "377521", "isCollection": true },
            { "name": "Coffee", "id": "359943", "isCollection": true },
            { "name": "Protein Bars", "id": "290645", "isCollection": true }
        ]
    },
    "Wednesday Bazaar": {
        "cName": "Wednesday Bazaar",
        "section": "Featured",
        "isCampaign": true,
        "campaignType": "collection",
        "collectionId": "397320",
        "layoutId": "32944",
        "subs": [
            {
                "name": "Milk, Butter & Curd",
                "id": "dairy"
            },
            {
                "name": "Paneer & Tofu",
                "id": "paneer"
            },
            {
                "name": "Fresh Eggs",
                "id": "eggs"
            },
            {
                "name": "Fresh Chutneys & Dips",
                "id": "chutney"
            },
            {
                "name": "Chapatis & Parotas",
                "id": "breads"
            },
            {
                "name": "Atta & Pink Salt",
                "id": "staples"
            }
        ]
    },
    "Fresh Vegetables": {
        "cName": "Fresh Vegetables",
        "tType": "Speciality taxonomy 1",
        "section": "Fresh",
        "subs": [
            {
                "name": "Fresh Vegetables",
                "id": "6822eeeded32000001e25aa2"
            },
            {
                "name": "Leafy and Seasonings",
                "id": "6822eeeded32000001e25aa3"
            },
            {
                "name": "Exotic Vegetables",
                "id": "6822eeeded32000001e25aa4"
            },
            {
                "name": "nectr",
                "id": "69380ea9945fd90001ca9e57"
            },
            {
                "name": "Premium Produce",
                "id": "6a950ffd114a1800015f6042"
            },
            {
                "name": "Pooja & Festive",
                "id": "6822eeeded32000001e25aa7"
            },
            {
                "name": "Certified Organics",
                "id": "6822eeeded32000001e25aa8"
            },
            {
                "name": "Frozen Vegetables",
                "id": "68243edc0c0f930001b2188d"
            },
            {
                "name": "Bouquet & Plants",
                "id": "6822eeeded32000001e25aaa"
            },
            {
                "name": "Cuts and sprouts",
                "id": "6822eeeded32000001e25aa6"
            },
            {
                "name": "Fresh Fruits",
                "id": "6822eeeded32000001e25aad"
            }
        ]
    },
    "Fresh Fruits": {
        "cName": "Fresh Fruits",
        "tType": "Speciality taxonomy 1",
        "section": "Fresh",
        "subs": [
            {
                "name": "Fresh Fruits",
                "id": "6822eeeded32000001e25aaf"
            },
            {
                "name": "Seasonal Fruits",
                "id": "6822eeeded32000001e25ab0"
            },
            {
                "name": "nectr",
                "id": "69380ea9945fd90001ca9e58"
            },
            {
                "name": "Premium Produce",
                "id": "6a950ffd114a1800015f6043"
            },
            {
                "name": "Exotic Fruits",
                "id": "6822eeeded32000001e25ab1"
            },
            {
                "name": "Cut Fruits and Juices",
                "id": "6822eeeded32000001e25ab2"
            },
            {
                "name": "Pooja & Festive",
                "id": "6822eeeded32000001e25ab3"
            },
            {
                "name": "Certified Organics",
                "id": "6822eeeded32000001e25ab6"
            },
            {
                "name": "Frozen Fruits",
                "id": "68b689ee4dd82b0001d869d1"
            },
            {
                "name": "Fresh Vegetables",
                "id": "6822eeeded32000001e25ab8"
            },
            {
                "name": "Bouquet & Plants",
                "id": "6822eeeded32000001e25ab4"
            },
            {
                "name": "Cuts and sprouts",
                "id": "6822eeeded32000001e25aba"
            }
        ]
    },
    "Dairy, Bread & Eggs": {
        "cName": "Dairy, Bread and Eggs",
        "tType": "Speciality taxonomy 1",
        "section": "Fresh",
        "subs": [
            {
                "name": "Milk",
                "id": "6822eeeded32000001e25abe"
            },
            {
                "name": "Bread and Buns",
                "id": "6822eeeded32000001e25abd"
            },
            {
                "name": "Paneer and Tofu",
                "id": "6822eeeded32000001e25ac2"
            },
            {
                "name": "Fresh Bakery",
                "id": "69e23025ed442900016e5d6f"
            },
            {
                "name": "Cheese",
                "id": "6822eeeded32000001e25ac3"
            },
            {
                "name": "Eggs",
                "id": "6822eeeded32000001e25abf"
            },
            {
                "name": "Top Deals",
                "id": "6966028b4f11730001f480a2"
            },
            {
                "name": "Curd and Yogurts",
                "id": "6822eeeded32000001e25ac0"
            },
            {
                "name": "Butter",
                "id": "6822eeeded32000001e25ac4"
            },
            {
                "name": "Batters and Chutneys",
                "id": "6822eeeded32000001e25ac5"
            },
            {
                "name": "Lassi and Buttermilk",
                "id": "6822eeeded32000001e25ac8"
            },
            {
                "name": "Indian Breads",
                "id": "6822eeeded32000001e25ac6"
            },
            {
                "name": "Cream and Condensed Milk",
                "id": "6970b6e9b6373a00010b3a9e"
            },
            {
                "name": "Dairy Alternatives",
                "id": "6822eeeded32000001e25ac7"
            },
            {
                "name": "Milkshakes and More",
                "id": "6822eeeded32000001e25ac9"
            }
        ]
    },
    "Meat & Seafood": {
        "cName": "Meat and Seafood",
        "tType": "Speciality taxonomy 1",
        "section": "Fresh",
        "subs": [
            {
                "name": "Fresh Chicken",
                "id": "6822eeeded32000001e25b3d"
            },
            {
                "name": "Fresh Seafood",
                "id": "6822eeeded32000001e25b3e"
            },
            {
                "name": "Fresh Mutton",
                "id": "6822eeeded32000001e25b3f"
            },
            {
                "name": "Top Deals",
                "id": "6a269334ff93a60001c16c42"
            },
            {
                "name": "Ready to Cook",
                "id": "692951068ff2590001fe7c7a"
            },
            {
                "name": "Meat Combos",
                "id": "6948edde195bc000019a3b03"
            },
            {
                "name": "Dry Fish",
                "id": "692951068ff2590001fe7c7b"
            },
            {
                "name": "Eggs",
                "id": "6822eeeded32000001e25b44"
            },
            {
                "name": "Frozen Food",
                "id": "6822eeeded32000001e25b42"
            },
            {
                "name": "Plant Based Meat",
                "id": "6822eeeded32000001e25b49"
            }
        ]
    },
    "Atta, Rice & Dal": {
        "cName": "Atta, Rice and Dal",
        "tType": "taxonomy 5",
        "section": "Grocery",
        "subs": [
            {
                "name": "Atta",
                "id": "6903b01ed2c61b000112ba2c"
            },
            {
                "name": "Rice",
                "id": "6903b01ed2c61b000112ba2d"
            },
            {
                "name": "Toor, Moong and Urad",
                "id": "6903b01ed2c61b000112ba31"
            },
            {
                "name": "High Protein Atta",
                "id": "6a105aa35f9ab700014de9e2"
            },
            {
                "name": "Top Deals",
                "id": "6a225b6a3c3eb20001d0f54f"
            },
            {
                "name": "Basmati Rice",
                "id": "6903b01ed2c61b000112ba2b"
            },
            {
                "name": "Besan, Sooji and Maida",
                "id": "6903b01ed2c61b000112ba2e"
            },
            {
                "name": "Rajma, Chola and Others",
                "id": "6903b01ed2c61b000112ba32"
            },
            {
                "name": "Poha & Puffed Rice",
                "id": "6903b01ed2c61b000112ba33"
            },
            {
                "name": "Premium Brands",
                "id": "6903b01ed2c61b000112ba2f"
            },
            {
                "name": "Soya Chunk & Badi",
                "id": "6903b01ed2c61b000112ba37"
            },
            {
                "name": "Other Flours",
                "id": "6903b01ed2c61b000112ba36"
            },
            {
                "name": "Millets & Daliya",
                "id": "6903b01ed2c61b000112ba35"
            },
            {
                "name": "Ready to Cook Flour Mix",
                "id": "6903b01ed2c61b000112ba34"
            }
        ]
    },
    "Masalas": {
        "cName": "Masalas",
        "tType": "taxonomy 5",
        "section": "Grocery",
        "subs": [
            {
                "name": "Powdered Spices",
                "id": "693ad23e53de7a00011ff894"
            },
            {
                "name": "Whole Spices",
                "id": "693ad23e53de7a00011ff898"
            },
            {
                "name": "Cold Grind",
                "id": "6a105aa35f9ab700014de9e3"
            },
            {
                "name": "Sugar and Jaggery",
                "id": "693ad23e53de7a00011ff897"
            },
            {
                "name": "Papad & Fryums",
                "id": "693a7ac953de7a00011ff892"
            },
            {
                "name": "Ready Masala",
                "id": "693ad23e53de7a00011ff895"
            },
            {
                "name": "Salt",
                "id": "693ad23e53de7a00011ff896"
            },
            {
                "name": "Paste and Puree",
                "id": "693a9dc1eb607300012621a5"
            },
            {
                "name": "Pickles & Chutney",
                "id": "693ad23e53de7a00011ff893"
            },
            {
                "name": "Herbs & Seasoning",
                "id": "693a7ac953de7a00011ff890"
            },
            {
                "name": "Coconut Milk & Powder",
                "id": "693981bf64f19a0001f8a5b3"
            },
            {
                "name": "Top Deals",
                "id": "6a225b6a3c3eb20001d0f550"
            }
        ]
    },
    "Oils & Ghee": {
        "cName": "Oils and Ghee",
        "tType": "taxonomy 5",
        "section": "Grocery",
        "subs": [
            {
                "name": "Sunflower & Other Oils",
                "id": "69394956ed899c0001b1aed8"
            },
            {
                "name": "Mustard Oils",
                "id": "69392fc99bd17b000135e3bd"
            },
            {
                "name": "Cold Pressed",
                "id": "6a105aa35f9ab700014de9e4"
            },
            {
                "name": "Ghee",
                "id": "69392fc99bd17b000135e3bb"
            },
            {
                "name": "Top Deals",
                "id": "6a225b6a3c3eb20001d0f551"
            },
            {
                "name": "Soyabean Oils",
                "id": "69394956ed899c0001b1aed7"
            },
            {
                "name": "Rice Bran Oils",
                "id": "69394956ed899c0001b1aed6"
            },
            {
                "name": "Sunflower Oils",
                "id": "69394956ed899c0001b1aed9"
            },
            {
                "name": "Blended Oils",
                "id": "69392fc99bd17b000135e3b9"
            },
            {
                "name": "Cold-pressed Oils",
                "id": "69392fc99bd17b000135e3ba"
            },
            {
                "name": "Olive Oils",
                "id": "69394956ed899c0001b1aed4"
            },
            {
                "name": "Premium Brands",
                "id": "69394956ed899c0001b1aed5"
            }
        ]
    },
    "Cereals & Breakfast": {
        "cName": "Cereals and Breakfast",
        "tType": "taxonomy 5",
        "section": "Grocery",
        "subs": [
            {
                "name": "Oats",
                "id": "69492faa195bc000019a3b0b"
            },
            {
                "name": "Energy Bars",
                "id": "69492faa195bc000019a3b10"
            },
            {
                "name": "Muesli & Granola",
                "id": "69492faa195bc000019a3b0a"
            },
            {
                "name": "High protein oats & museli",
                "id": "698d7038c63f8300011b530c"
            },
            {
                "name": "Regional Favourites",
                "id": "69492faa195bc000019a3b0e"
            },
            {
                "name": "Ready Mixes",
                "id": "69492faa195bc000019a3b11"
            },
            {
                "name": "Kids Cereals",
                "id": "69492faa195bc000019a3b0c"
            },
            {
                "name": "Flakes",
                "id": "69492faa195bc000019a3b0d"
            },
            {
                "name": "Batters",
                "id": "69492faa195bc000019a3b1c"
            },
            {
                "name": "Pancake Mixes",
                "id": "69492faa195bc000019a3b13"
            },
            {
                "name": "Peanut Butters",
                "id": "69492faa195bc000019a3b14"
            },
            {
                "name": "Chocolate Spreads",
                "id": "69492faa195bc000019a3b15"
            },
            {
                "name": "Masala Oats",
                "id": "698499a8e171b800015b5d68"
            },
            {
                "name": "Jams",
                "id": "69492faa195bc000019a3b1b"
            },
            {
                "name": "Juices & Fruit Drinks",
                "id": "69492faa195bc000019a3b1a"
            },
            {
                "name": "Mayo & Spreads",
                "id": "69492faa195bc000019a3b16"
            },
            {
                "name": "Hot Beverages",
                "id": "69492faa195bc000019a3b19"
            },
            {
                "name": "Seeds and trail Mixes",
                "id": "69492faa195bc000019a3b18"
            },
            {
                "name": "Crazy Deals",
                "id": "69492faa195bc000019a3b09"
            }
        ]
    },
    "Cold Drinks & Juices": {
        "cName": "Cold Drinks and Juices",
        "tType": "taxonomy 10",
        "section": "Snacks",
        "subs": [
            {
                "name": "Soft Drinks",
                "id": "6903b0c295d8230001064c75"
            },
            {
                "name": "Juices and Fruit Drinks",
                "id": "6903b0c295d8230001064c76"
            },
            {
                "name": "Caffeinated Beverages",
                "id": "6903b0c295d8230001064c77"
            },
            {
                "name": "Hydration Drinks",
                "id": "6a6b063ad570db00013754da"
            },
            {
                "name": "Mango Drinks",
                "id": "6903b0c295d8230001064c7f"
            },
            {
                "name": "Coconut Water",
                "id": "6903b0c295d8230001064c80"
            },
            {
                "name": "Water and Ice Cubes",
                "id": "6903b0c295d8230001064c7d"
            },
            {
                "name": "Soda and Mixers",
                "id": "6903b0c295d8230001064c78"
            },
            {
                "name": "Ice Tea & Kombucha",
                "id": "6903b0c295d8230001064c7c"
            },
            {
                "name": "Diet Soft Drinks",
                "id": "6903b0c295d8230001064c7e"
            },
            {
                "name": "Non Alcoholic Beverages",
                "id": "6903b0c295d8230001064c7b"
            },
            {
                "name": "Chilled",
                "id": "692eadd0910d9f000100c2c0"
            },
            {
                "name": "Party Packs",
                "id": "69a17c7d5011b80001ede83c"
            },
            {
                "name": "Hydration",
                "id": "6903b0c295d8230001064c82"
            },
            {
                "name": "Fresh Juices",
                "id": "6903b0c295d8230001064c81"
            },
            {
                "name": "Instant Drink Mixes",
                "id": "6903b0c295d8230001064c83"
            },
            {
                "name": "Regional Favourites",
                "id": "6903b0c295d8230001064c79"
            },
            {
                "name": "Cold Coffee",
                "id": "6903b0c295d8230001064c85"
            },
            {
                "name": "Milk Based Drinks",
                "id": "6903b0c295d8230001064c84"
            }
        ]
    },
    "Ice Creams & Desserts": {
        "cName": "Ice Creams and Frozen Desserts",
        "tType": "taxonomy 10",
        "section": "Snacks",
        "subs": [
            {
                "name": "Tubs & Party Packs",
                "id": "6903b0c295d8230001064c89"
            },
            {
                "name": "Cones",
                "id": "6903b0c295d8230001064c8a"
            },
            {
                "name": "Sticks",
                "id": "6903b0c295d8230001064c8b"
            },
            {
                "name": "Top Deals",
                "id": "6a5638416009fa0001dce711"
            },
            {
                "name": "Cups",
                "id": "6903b0c295d8230001064c91"
            },
            {
                "name": "Guiltfree",
                "id": "6903b0c295d8230001064c8d"
            },
            {
                "name": "Real Fruit",
                "id": "69b94cf4b6373a00010b3b3b"
            },
            {
                "name": "Gourmet",
                "id": "6903b0c295d8230001064c8c"
            },
            {
                "name": "Kulfi",
                "id": "6903b0c295d8230001064c8f"
            },
            {
                "name": "Cakes & Sandwiches",
                "id": "6903b0c295d8230001064c92"
            },
            {
                "name": "Rare Finds",
                "id": "6903b0c295d8230001064c88"
            },
            {
                "name": "Premium",
                "id": "6903b0c295d8230001064c90"
            },
            {
                "name": "Regional Favorites",
                "id": "6903b0c295d8230001064c93"
            },
            {
                "name": "Brownies & Cakes",
                "id": "6903b0c295d8230001064c94"
            },
            {
                "name": "Syrups",
                "id": "6903b0c295d8230001064c95"
            }
        ]
    },
    "Chips & Namkeens": {
        "cName": "Chips and Namkeens",
        "tType": "taxonomy 10",
        "section": "Snacks",
        "subs": [
            {
                "name": "Chips and Crisps",
                "id": "6903b0c295d8230001064c99"
            },
            {
                "name": "Bhujia and Namkeens",
                "id": "6903b0c295d8230001064c9d"
            },
            {
                "name": "Palm Oil Free",
                "id": "6a1024275f9ab700014de9df"
            },
            {
                "name": "Indian Snacks",
                "id": "6903b0c295d8230001064c9e"
            },
            {
                "name": "Baked and Roasted",
                "id": "6a1024275f9ab700014de9e0"
            },
            {
                "name": "Nuts",
                "id": "6903b0c295d8230001064ca0"
            },
            {
                "name": "Puffs and Crunchies",
                "id": "6903b0c295d8230001064c9b"
            },
            {
                "name": "Makhana & Dry Fruits",
                "id": "6903b0c295d8230001064c9f"
            },
            {
                "name": "Healthy Snacking",
                "id": "6903b0c295d8230001064ca3"
            },
            {
                "name": "Nachos",
                "id": "6903b0c295d8230001064c9a"
            },
            {
                "name": "Popcorn",
                "id": "6903b0c295d8230001064ca1"
            },
            {
                "name": "Fasting Snacks",
                "id": "699428c05011b80001ede81d"
            },
            {
                "name": "Regional Favourites",
                "id": "6903b0c295d8230001064c9c"
            },
            {
                "name": "Party Packs",
                "id": "6903b0c295d8230001064ca6"
            },
            {
                "name": "Gift Hampers",
                "id": "6903b0c295d8230001064ca2"
            },
            {
                "name": "Sweet Treats",
                "id": "6903b0c295d8230001064ca7"
            }
        ]
    },
    "Chocolates": {
        "cName": "Chocolates",
        "tType": "taxonomy 10",
        "section": "Snacks",
        "subs": [
            {
                "name": "Milk Chocolates",
                "id": "693d17b2c0e8870001d2d8fd"
            },
            {
                "name": "Dark Chocolates",
                "id": "693d17b2c0e8870001d2d8f8"
            },
            {
                "name": "Premium",
                "id": "693d1c2031a0de00019cd18b"
            },
            {
                "name": "Gift Boxes",
                "id": "693d17b2c0e8870001d2d8f9"
            },
            {
                "name": "Top Deals",
                "id": "6a5638416009fa0001dce712"
            },
            {
                "name": "Shared Packs",
                "id": "693d448b31a0de00019cd18c"
            },
            {
                "name": "Wafers",
                "id": "693d82725485ff0001d3ec20"
            },
            {
                "name": "Kunafa Chocolate",
                "id": "69c2674fb2f6170001b1dd3e"
            },
            {
                "name": "Gourmet collection",
                "id": "693d17b2c0e8870001d2d8fa"
            },
            {
                "name": "Candies & More",
                "id": "693d17b2c0e8870001d2d8f7"
            },
            {
                "name": "Gums & Mint",
                "id": "693d17b2c0e8870001d2d8fb"
            }
        ]
    },
    "Biscuits & Cakes": {
        "cName": "Biscuits and Cakes",
        "tType": "taxonomy 10",
        "section": "Snacks",
        "subs": [
            {
                "name": "Cakes & Pies",
                "id": "693c23bd4df316000117b882"
            },
            {
                "name": "Cream Biscuits",
                "id": "693c23bd4df316000117b885"
            },
            {
                "name": "Cookies",
                "id": "693c23bd4df316000117b884"
            },
            {
                "name": "Marie & Digestive",
                "id": "693c23bd4df316000117b88b"
            },
            {
                "name": "Salted & Plain",
                "id": "693c23bd4df316000117b890"
            },
            {
                "name": "Wafers",
                "id": "693c23bd4df316000117b892"
            },
            {
                "name": "Regional Favourites",
                "id": "693c23bd4df316000117b88e"
            },
            {
                "name": "Healthy Snacking",
                "id": "693c23bd4df316000117b88a"
            },
            {
                "name": "Gift Boxes",
                "id": "693c23bd4df316000117b888"
            },
            {
                "name": "Baking Ingredients",
                "id": "693c23bd4df316000117b881"
            },
            {
                "name": "Gourmet collection",
                "id": "693c23bd4df316000117b889"
            },
            {
                "name": "Pancake Mixes",
                "id": "693c23bd4df316000117b88d"
            },
            {
                "name": "Fresh Bakery",
                "id": "69e23de6e473890001fbb7c7"
            },
            {
                "name": "Rusk",
                "id": "693c23bd4df316000117b88f"
            },
            {
                "name": "Dessert Mixes",
                "id": "693c23bd4df316000117b886"
            }
        ]
    },
    "Tea, Coffee & Drinks": {
        "cName": "Tea, Coffee and Milk drinks",
        "tType": "taxonomy 10",
        "section": "Snacks",
        "subs": [
            {
                "name": "Tea",
                "id": "6903b0c295d8230001064cfa"
            },
            {
                "name": "Instant Coffee",
                "id": "6903b0c295d8230001064cfb"
            },
            {
                "name": "Filter & Ground Coffee",
                "id": "6903b0c295d8230001064cfc"
            },
            {
                "name": "Drink Mixes",
                "id": "6903b0c295d8230001064d01"
            },
            {
                "name": "Green & Herbal Tea",
                "id": "6903b0c295d8230001064cfd"
            },
            {
                "name": "Cold Coffee",
                "id": "6903b0c295d8230001064d00"
            },
            {
                "name": "Regional Favourites",
                "id": "6903b0c295d8230001064cfe"
            },
            {
                "name": "Syrups & Mixes",
                "id": "69b17a805011b80001ede85d"
            },
            {
                "name": "Milkshake & Smoothie",
                "id": "6903b0c295d8230001064d04"
            },
            {
                "name": "Cookies and Rusks",
                "id": "6903b0c295d8230001064d07"
            },
            {
                "name": "Premixes",
                "id": "6903b0c295d8230001064d06"
            },
            {
                "name": "Adult Nutrition",
                "id": "6903b0c295d8230001064d03"
            },
            {
                "name": "Top Deals",
                "id": "69662b2901da4f00010080db"
            },
            {
                "name": "Imported",
                "id": "696e372795eb7700017f9a2b"
            }
        ]
    },
    "Sauces & Spreads": {
        "cName": "Sauces and Spreads",
        "tType": "taxonomy 10",
        "section": "Snacks",
        "subs": [
            {
                "name": "Chocolate Spreads",
                "id": "6903b0c295d8230001064ced"
            },
            {
                "name": "Tomato Ketchup",
                "id": "6903b0c295d8230001064cf0"
            },
            {
                "name": "Peanut Butters",
                "id": "6903b0c295d8230001064cec"
            },
            {
                "name": "Jams",
                "id": "6903b0c295d8230001064cf7"
            },
            {
                "name": "Mayo & Spreads",
                "id": "6903b0c295d8230001064cef"
            },
            {
                "name": "Dips & Dressing",
                "id": "6903b0c295d8230001064cf6"
            },
            {
                "name": "Cooking Sauces",
                "id": "6903b0c295d8230001064cf4"
            },
            {
                "name": "Asian Sauces",
                "id": "6903b0c295d8230001064cf3"
            },
            {
                "name": "Honey and Cider Vineger",
                "id": "6903b0c295d8230001064cee"
            },
            {
                "name": "Regional Favourites",
                "id": "6903b0c295d8230001064cf1"
            }
        ]
    },
    "Sweet Corner": {
        "cName": "Sweet Corner",
        "tType": "taxonomy 10",
        "section": "Snacks",
        "subs": [
            {
                "name": "Kaju Katli & Barfi",
                "id": "693f772b01a77200013e2a09"
            },
            {
                "name": "Cakes and Pies",
                "id": "693f772b01a77200013e2a0e"
            },
            {
                "name": "Gulab Jamun",
                "id": "693f772b01a77200013e2a0c"
            },
            {
                "name": "Top Deals",
                "id": "6a5638416009fa0001dce713"
            },
            {
                "name": "Cream Biscuits",
                "id": "69eb43c5a51c5400018ac258"
            },
            {
                "name": "Mysore Pak",
                "id": "693f772b01a77200013e2a10"
            },
            {
                "name": "Chocofills",
                "id": "69eb43c5a51c5400018ac259"
            },
            {
                "name": "Ladoos",
                "id": "693f772b01a77200013e2a11"
            },
            {
                "name": "Pedhas",
                "id": "693f772b01a77200013e2a12"
            },
            {
                "name": "Rasgulla",
                "id": "693f772b01a77200013e2a0b"
            },
            {
                "name": "Dry Fruit Sweets",
                "id": "693f772b01a77200013e2a0a"
            },
            {
                "name": "Chikki",
                "id": "693fab2c01a77200013e2a13"
            },
            {
                "name": "Rasmalai",
                "id": "693fab2c01a77200013e2a14"
            },
            {
                "name": "Gulkand & Paan",
                "id": "693fab2c01a77200013e2a15"
            },
            {
                "name": "Dessert Mixes",
                "id": "693f772b01a77200013e2a0d"
            }
        ]
    },
    "Noodles, Pasta & Vermicelli": {
        "cName": "Noodles, Pasta, Vermicelli",
        "tType": "taxonomy 10",
        "section": "Snacks",
        "subs": [
            {
                "name": "Instant Noodles",
                "id": "693f772b01a77200013e29fc"
            },
            {
                "name": "Korean Noodles",
                "id": "693f772b01a77200013e29fe"
            },
            {
                "name": "Cup Noodles",
                "id": "693f772b01a77200013e29fd"
            },
            {
                "name": "Instant Pasta",
                "id": "693f772b01a77200013e2a02"
            },
            {
                "name": "Vermicelli",
                "id": "693f772b01a77200013e2a03"
            },
            {
                "name": "Cooking Pasta",
                "id": "693f772b01a77200013e2a01"
            },
            {
                "name": "Hakka Noodles",
                "id": "693f772b01a77200013e29ff"
            },
            {
                "name": "Ready to eat",
                "id": "693f772b01a77200013e2a05"
            },
            {
                "name": "Soups",
                "id": "693f772b01a77200013e2a04"
            }
        ]
    },
    "Frozen Food": {
        "cName": "Frozen Food",
        "tType": "taxonomy 10",
        "section": "Snacks",
        "subs": [
            {
                "name": "Veg Frozen Snacks",
                "id": "693d82725485ff0001d3ec2e"
            },
            {
                "name": "Non Veg Frozen Snacks",
                "id": "693d82725485ff0001d3ec29"
            },
            {
                "name": "Cold Cuts",
                "id": "693d82725485ff0001d3ec23"
            },
            {
                "name": "Frozen Vegetables",
                "id": "693d82725485ff0001d3ec24"
            },
            {
                "name": "Momos & Baos",
                "id": "693d82725485ff0001d3ec27"
            },
            {
                "name": "Kebabs",
                "id": "693d82725485ff0001d3ec26"
            },
            {
                "name": "Roti, Paranthas & Sheets",
                "id": "693d82725485ff0001d3ec2c"
            },
            {
                "name": "Seafood",
                "id": "693d82725485ff0001d3ec2d"
            },
            {
                "name": "Raw Frozen",
                "id": "693d82725485ff0001d3ec2a"
            },
            {
                "name": "Regional Favourites",
                "id": "693d82725485ff0001d3ec2b"
            }
        ]
    },
    "Dry Fruits & Seeds Mix": {
        "cName": "Dry Fruits and Seeds Mix",
        "tType": "taxonomy 10",
        "section": "Snacks",
        "subs": [
            {
                "name": "Dryfruits Gift Boxes",
                "id": "6a8ff3fb479ae600017590a6"
            },
            {
                "name": "Cashews",
                "id": "69492e33cfaac00001f0780f"
            },
            {
                "name": "Mixed Dry Fruits",
                "id": "6949160474f4c20001b6bdff"
            },
            {
                "name": "Almonds",
                "id": "6949160474f4c20001b6be00"
            },
            {
                "name": "Dates",
                "id": "69492e33cfaac00001f07810"
            },
            {
                "name": "Top Deals",
                "id": "6a22540b25164200017a8659"
            },
            {
                "name": "Pista & Walnuts",
                "id": "69492e33cfaac00001f07812"
            },
            {
                "name": "Makhana and Seeds",
                "id": "69492e33cfaac00001f07813"
            },
            {
                "name": "Nuts and Seeds Mix",
                "id": "69492e33cfaac00001f07815"
            },
            {
                "name": "Dried Fruits and Berries",
                "id": "69492e33cfaac00001f07814"
            },
            {
                "name": "Premium dry Fruits",
                "id": "6970b51fb9ed3d00010081ee"
            }
        ]
    },
    "Paan Corner": {
        "cName": "Paan Corner",
        "tType": "taxonomy 10",
        "section": "Snacks",
        "subs": [
            {
                "name": "Regular Cigarettes",
                "id": "6903b0c295d8230001064cdf"
            },
            {
                "name": "Rolling Tobacco",
                "id": "6a1024275f9ab700014de9e1"
            },
            {
                "name": "Lighters",
                "id": "6985e16a35d7fd0001bf0db7"
            },
            {
                "name": "Flavour Cigarettes",
                "id": "6903b0c295d8230001064ce0"
            },
            {
                "name": "Ashtray",
                "id": "6985e16a35d7fd0001bf0db8"
            },
            {
                "name": "Smoking Accessories",
                "id": "6903b0c295d8230001064ce1"
            },
            {
                "name": "Hookah Needs",
                "id": "6903b0c295d8230001064ce2"
            },
            {
                "name": "Nicotine Alternatives",
                "id": "6903b0c295d8230001064ce3"
            },
            {
                "name": "Gum and Mint",
                "id": "6903b0c295d8230001064ce5"
            },
            {
                "name": "Paan and Mouth Fresheners",
                "id": "6903b0c295d8230001064ce7"
            }
        ]
    },
    "Bath & Body": {
        "cName": "Bath and Body",
        "tType": "taxonomy 14",
        "section": "Beauty",
        "subs": [
            {
                "name": "Soaps",
                "id": "6903b10bd2c61b000112ba93"
            },
            {
                "name": "Shower gel",
                "id": "6903b10bd2c61b000112baa4"
            },
            {
                "name": "Oral care",
                "id": "6903b10bd2c61b000112baa0"
            },
            {
                "name": "Handwash",
                "id": "6903b10bd2c61b000112ba94"
            },
            {
                "name": "Fragrance & Talc",
                "id": "6903b10bd2c61b000112ba9c"
            },
            {
                "name": "Value Pack",
                "id": "6aa954d1114a1800015f6063"
            },
            {
                "name": "Body Lotion & Oils",
                "id": "6903b10bd2c61b000112ba9b"
            },
            {
                "name": "Mens Perfume",
                "id": "6903b10bd2c61b000112ba9e"
            },
            {
                "name": "Womens Perfume",
                "id": "6903b10bd2c61b000112baa7"
            },
            {
                "name": "Shaving Foam and Cartridges",
                "id": "6903b10bd2c61b000112baa3"
            },
            {
                "name": "Shaving brush and Kit",
                "id": "6903b10bd2c61b000112baa2"
            },
            {
                "name": "Shampoo",
                "id": "6903b10bd2c61b000112ba96"
            },
            {
                "name": "Conditioner",
                "id": "6903b10bd2c61b000112ba97"
            },
            {
                "name": "Face Care",
                "id": "6903b10bd2c61b000112ba95"
            },
            {
                "name": "Bath Accessories",
                "id": "6903b10bd2c61b000112ba98"
            },
            {
                "name": "Bath & Beauty gifts",
                "id": "6903b10bd2c61b000112ba9a"
            },
            {
                "name": "Men Trimmers & Razors",
                "id": "6903b10bd2c61b000112baa9"
            },
            {
                "name": "Mens Deos",
                "id": "6903b10bd2c61b000112ba9d"
            },
            {
                "name": "Womens Deos",
                "id": "6903b10bd2c61b000112baa6"
            },
            {
                "name": "Women Hair Removal cream",
                "id": "6903b10bd2c61b000112baa5"
            },
            {
                "name": "Roll on",
                "id": "6903b10bd2c61b000112baa1"
            },
            {
                "name": "Women Trimmers & Razors",
                "id": "6903b10bd2c61b000112baa8"
            },
            {
                "name": "Lip care",
                "id": "6903b10bd2c61b000112baaa"
            },
            {
                "name": "Multi groomers",
                "id": "6903b10bd2c61b000112ba9f"
            },
            {
                "name": "After Shave",
                "id": "6903b10bd2c61b000112ba99"
            }
        ]
    },
    "Hair Care": {
        "cName": "Hair Care",
        "tType": "taxonomy 14",
        "section": "Beauty",
        "subs": [
            {
                "name": "Hair Oils and Serums",
                "id": "6903b10bd2c61b000112baad"
            },
            {
                "name": "Shampoo",
                "id": "6903b10bd2c61b000112baae"
            },
            {
                "name": "Conditioners & Masks",
                "id": "6903b10bd2c61b000112baaf"
            },
            {
                "name": "Hair Colour",
                "id": "6903b10bd2c61b000112bab0"
            },
            {
                "name": "Premium Brands",
                "id": "6903b10bd2c61b000112bab1"
            },
            {
                "name": "Hair Styling Gels & Creams",
                "id": "6903b10bd2c61b000112bab3"
            },
            {
                "name": "Combs & Brushes",
                "id": "6903b10bd2c61b000112bab4"
            },
            {
                "name": "Hair Dryers and Stylers",
                "id": "6903b10bd2c61b000112bab5"
            },
            {
                "name": "Hair Supplements",
                "id": "6903b10bd2c61b000112bab6"
            }
        ]
    },
    "Skincare": {
        "cName": "Skincare",
        "tType": "taxonomy 14",
        "section": "Beauty",
        "subs": [
            {
                "name": "Face wash and scrubs",
                "id": "6903b10bd2c61b000112bab8"
            },
            {
                "name": "Masks & Cleansers",
                "id": "6903b10bd2c61b000112bab9"
            },
            {
                "name": "Serums, Toners",
                "id": "6903b10bd2c61b000112baba"
            },
            {
                "name": "Creams & Moisturizers",
                "id": "6903b10bd2c61b000112babb"
            },
            {
                "name": "Sunscreen",
                "id": "6903b10bd2c61b000112babc"
            },
            {
                "name": "Body Lotions",
                "id": "6903b10bd2c61b000112babe"
            },
            {
                "name": "Beauty Supplements",
                "id": "6903b10bd2c61b000112babf"
            }
        ]
    },
    "Makeup": {
        "cName": "Makeup",
        "tType": "taxonomy 14",
        "section": "Beauty",
        "subs": [
            {
                "name": "Lips",
                "id": "6903b10bd2c61b000112bac2"
            },
            {
                "name": "Eyes",
                "id": "6903b10bd2c61b000112bac3"
            },
            {
                "name": "Face",
                "id": "6903b10bd2c61b000112bac5"
            },
            {
                "name": "Nails",
                "id": "6903b10bd2c61b000112bac7"
            },
            {
                "name": "Tools & Brushes",
                "id": "6903b10bd2c61b000112bac8"
            },
            {
                "name": "Beauty Supplements",
                "id": "6903b10bd2c61b000112bac9"
            }
        ]
    },
    "Feminine Hygiene": {
        "cName": "Feminine Hygiene",
        "tType": "taxonomy 14",
        "section": "Beauty",
        "subs": [
            {
                "name": "Sanitary Pads",
                "id": "6903b10bd2c61b000112bacc"
            },
            {
                "name": "Period Panties and Liners",
                "id": "6903b10bd2c61b000112bacd"
            },
            {
                "name": "Hair Removal",
                "id": "6903b10bd2c61b000112bace"
            },
            {
                "name": "Menstrual Cups and Tampons",
                "id": "6903b10bd2c61b000112bacf"
            },
            {
                "name": "Intimate Wipes and Wash",
                "id": "6903b10bd2c61b000112bad1"
            },
            {
                "name": "Disposal Bags and Cramp Relief",
                "id": "6903b10bd2c61b000112bad2"
            }
        ]
    },
    "Sexual Wellness": {
        "cName": "Sexual Wellness",
        "tType": "taxonomy 14",
        "section": "Beauty",
        "subs": [
            {
                "name": "Condoms",
                "id": "6903b10bd2c61b000112bad4"
            },
            {
                "name": "Lubricants",
                "id": "6903b10bd2c61b000112bad5"
            },
            {
                "name": "Massagers",
                "id": "6903b10bd2c61b000112bad6"
            },
            {
                "name": "Enhancers",
                "id": "6903b10bd2c61b000112bad7"
            },
            {
                "name": "Gift Kits",
                "id": "6903b10bd2c61b000112bad8"
            }
        ]
    },
    "Health & Pharma": {
        "cName": "Health and Pharma",
        "tType": "taxonomy 14",
        "section": "Beauty",
        "subs": [
            {
                "name": "Masks & Sanitizers",
                "id": "6a57570521b41f0001ef459d"
            },
            {
                "name": "Protein & Sports Nutrition",
                "id": "6a574e8421b41f0001ef459a"
            },
            {
                "name": "Immunity & Energy Boosters",
                "id": "6a57570521b41f0001ef459c"
            },
            {
                "name": "Gummies",
                "id": "6a57570521b41f0001ef459e"
            },
            {
                "name": "Weight Management",
                "id": "6a57570521b41f0001ef459b"
            },
            {
                "name": "Superfoods",
                "id": "6a57570521b41f0001ef459f"
            }
        ]
    },
    "Baby Care": {
        "cName": "Baby Care",
        "tType": "taxonomy 14",
        "section": "Beauty",
        "subs": [
            {
                "name": "Baby Diapers",
                "id": "6903b10bd2c61b000112baef"
            },
            {
                "name": "Baby Food and Formula",
                "id": "6903b10bd2c61b000112baf0"
            },
            {
                "name": "Baby Bathing",
                "id": "6903b10bd2c61b000112baf1"
            },
            {
                "name": "Baby Wipes",
                "id": "6903b10bd2c61b000112baf2"
            },
            {
                "name": "Baby Cream & Lotions",
                "id": "6903b10bd2c61b000112baf4"
            },
            {
                "name": "Gifts & More",
                "id": "6903b10bd2c61b000112bafc"
            },
            {
                "name": "Feeding and Teething Needs",
                "id": "6903b10bd2c61b000112baf8"
            },
            {
                "name": "Baby Oil and Talc",
                "id": "6903b10bd2c61b000112baf6"
            },
            {
                "name": "Baby Hygiene",
                "id": "6903b10bd2c61b000112bafa"
            },
            {
                "name": "Books and Toys",
                "id": "6903b10bd2c61b000112baf9"
            },
            {
                "name": "Baby Oral Care",
                "id": "6903b10bd2c61b000112baf5"
            },
            {
                "name": "Travel Needs & Baby Gears",
                "id": "6903b10bd2c61b000112bafe"
            },
            {
                "name": "Baby Pharma",
                "id": "6903b10bd2c61b000112baf7"
            },
            {
                "name": "Clothes & Accessories",
                "id": "6903b10bd2c61b000112bafb"
            },
            {
                "name": "Mom Care",
                "id": "6903b10bd2c61b000112bafd"
            }
        ]
    },
    "Home & Kitchen": {
        "cName": "Home and Kitchen",
        "tType": "IM Meatsy",
        "section": "Household",
        "subs": [
            {
                "name": "Non Toxic Cookware",
                "id": "69a6853c8ec23b0001d51dcb"
            },
            {
                "name": "Premium Storage Brands",
                "id": "6a107175f653f400014e56af"
            },
            {
                "name": "Home decor",
                "id": "6903b179fe6d7500013a0d13"
            },
            {
                "name": "304 Stainless Steel",
                "id": "6a107175f653f400014e56ae"
            },
            {
                "name": "Linen & Furnishing",
                "id": "6903b179fe6d7500013a0d14"
            },
            {
                "name": "Kitchen Tools",
                "id": "6903b179fe6d7500013a0d0c"
            },
            {
                "name": "Jars & Containers",
                "id": "6903b179fe6d7500013a0d09"
            },
            {
                "name": "Bottles, Flask and Tumblers",
                "id": "6903b179fe6d7500013a0d0a"
            },
            {
                "name": "Tiffins & Lunch Bag",
                "id": "6a27ff73600211000131660a"
            },
            {
                "name": "Bath and laundry",
                "id": "6903b179fe6d7500013a0d0e"
            },
            {
                "name": "Serveware & Crockery",
                "id": "6903b179fe6d7500013a0d16"
            },
            {
                "name": "Cookware",
                "id": "6903b179fe6d7500013a0d07"
            },
            {
                "name": "Tissues & Disposables",
                "id": "6903b179fe6d7500013a0d18"
            },
            {
                "name": "Home Utility",
                "id": "6a27ff73600211000131660b"
            },
            {
                "name": "Storage Organizers & Utility",
                "id": "6903b179fe6d7500013a0d17"
            },
            {
                "name": "cups and mugs",
                "id": "6903b179fe6d7500013a0d10"
            },
            {
                "name": "Gardening",
                "id": "6903b179fe6d7500013a0d11"
            },
            {
                "name": "Glasses & Barware",
                "id": "6903b179fe6d7500013a0d12"
            },
            {
                "name": "Air Freshners",
                "id": "6903b179fe6d7500013a0d0d"
            },
            {
                "name": "Bakeware & BBQ",
                "id": "6903b179fe6d7500013a0d0b"
            },
            {
                "name": "Vehicale care & Accessories",
                "id": "6903b179fe6d7500013a0d19"
            },
            {
                "name": "Party Planning",
                "id": "6903b179fe6d7500013a0d15"
            },
            {
                "name": "Cleaning tools",
                "id": "6903b179fe6d7500013a0d0f"
            }
        ]
    },
    "Puja Store": {
        "cName": "Puja Store",
        "tType": "IM Meatsy",
        "section": "Household",
        "subs": [
            {
                "name": "Idols & Books",
                "id": "6903b179fe6d7500013a0d1f"
            },
            {
                "name": "Diya & Baati",
                "id": "6903b179fe6d7500013a0d20"
            },
            {
                "name": "Agarbatti & Stand",
                "id": "6903b179fe6d7500013a0d21"
            },
            {
                "name": "Dhoop",
                "id": "6903b179fe6d7500013a0d22"
            },
            {
                "name": "Hawan Needs",
                "id": "6903b179fe6d7500013a0d23"
            },
            {
                "name": "Tika, Thread & Mala",
                "id": "6903b179fe6d7500013a0d24"
            },
            {
                "name": "Kalash & Gangajal",
                "id": "6903b179fe6d7500013a0d25"
            },
            {
                "name": "Camphor & Matchbox",
                "id": "6903b179fe6d7500013a0d26"
            },
            {
                "name": "Sambrani Cups",
                "id": "6903b179fe6d7500013a0d27"
            },
            {
                "name": "Flowers & Betel Leaves",
                "id": "6903b179fe6d7500013a0d28"
            },
            {
                "name": "Ghee & Oil",
                "id": "6903b179fe6d7500013a0d29"
            },
            {
                "name": "Puja Thali",
                "id": "6903b179fe6d7500013a0d2a"
            },
            {
                "name": "Puja Cloth",
                "id": "6903b179fe6d7500013a0d2b"
            },
            {
                "name": "Mandir Decor",
                "id": "6903b179fe6d7500013a0d2c"
            },
            {
                "name": "Fresh Fruits",
                "id": "6903b179fe6d7500013a0d2e"
            },
            {
                "name": "Dry Fruits",
                "id": "6903b179fe6d7500013a0d2f"
            },
            {
                "name": "Sweets",
                "id": "6903b179fe6d7500013a0d30"
            }
        ]
    },
    "Cleaners & Repellents": {
        "cName": "Cleaners and Repellents",
        "tType": "IM Meatsy",
        "section": "Household",
        "subs": [
            {
                "name": "Liquid Detergents",
                "id": "6903b179fe6d7500013a0d33"
            },
            {
                "name": "Repellent",
                "id": "6903b179fe6d7500013a0d42"
            },
            {
                "name": "Mosquito Refills",
                "id": "6903b179fe6d7500013a0d3e"
            },
            {
                "name": "Detergent Powders",
                "id": "6903b179fe6d7500013a0d32"
            },
            {
                "name": "Racquets",
                "id": "6903b179fe6d7500013a0d3f"
            },
            {
                "name": "Laundry Additives",
                "id": "6903b179fe6d7500013a0d3d"
            },
            {
                "name": "Cockroach & Crawling insect killer",
                "id": "6903b179fe6d7500013a0d3b"
            },
            {
                "name": "Tissues & Disposables",
                "id": "6a3a643a60f2a90001f51437"
            },
            {
                "name": "Dishwash Gel",
                "id": "6903b179fe6d7500013a0d3c"
            },
            {
                "name": "Toilet Cleaners",
                "id": "6903b179fe6d7500013a0d38"
            },
            {
                "name": "Mosquito Repellent",
                "id": "6903b179fe6d7500013a0d43"
            },
            {
                "name": "Surface Disinfectants",
                "id": "6903b179fe6d7500013a0d41"
            },
            {
                "name": "Top Deals",
                "id": "69706f26a176a40001054615"
            },
            {
                "name": "Rat Repellent",
                "id": "6903b179fe6d7500013a0d40"
            },
            {
                "name": "Brooms & Mops",
                "id": "6903b179fe6d7500013a0d34"
            },
            {
                "name": "Dustbins & Pans",
                "id": "6903b179fe6d7500013a0d36"
            },
            {
                "name": "Wipes & Scrubs",
                "id": "6903b179fe6d7500013a0d3a"
            },
            {
                "name": "Kitchen Cleaning",
                "id": "6903b179fe6d7500013a0d37"
            },
            {
                "name": "Bathroom Cleaning",
                "id": "6903b179fe6d7500013a0d39"
            },
            {
                "name": "Floor Cleaners",
                "id": "6903b179fe6d7500013a0d35"
            }
        ]
    },
    "Toys & Stationery": {
        "cName": "Toys and Stationery",
        "tType": "IM Meatsy",
        "section": "Household",
        "subs": [
            {
                "name": "Die-cast cars",
                "id": "69bcff6db56c7a0001b3e7a8"
            },
            {
                "name": "Safe play toys",
                "id": "69bcff6db56c7a0001b3e7a7"
            },
            {
                "name": "Screen Time Replacement",
                "id": "6a181a584ad6960001549a59"
            },
            {
                "name": "Pen,Pencils and markers",
                "id": "6903b179fe6d7500013a0d54"
            },
            {
                "name": "Toy cars and guns",
                "id": "6903b179fe6d7500013a0d47"
            },
            {
                "name": "Notebooks and Diaries",
                "id": "6903b179fe6d7500013a0d52"
            },
            {
                "name": "Card and Board Games",
                "id": "6903b179fe6d7500013a0d45"
            },
            {
                "name": "School supplies",
                "id": "6903b179fe6d7500013a0d55"
            },
            {
                "name": "Soft Toys",
                "id": "6903b179fe6d7500013a0d56"
            },
            {
                "name": "Office stationery",
                "id": "6903b179fe6d7500013a0d53"
            },
            {
                "name": "Dolls & pretend kits",
                "id": "6903b179fe6d7500013a0d51"
            },
            {
                "name": "Colouring Supplies",
                "id": "6903b179fe6d7500013a0d50"
            },
            {
                "name": "Action Figurines",
                "id": "6903b179fe6d7500013a0d4a"
            },
            {
                "name": "Building Blocks, Puzzles & More",
                "id": "6903b179fe6d7500013a0d48"
            },
            {
                "name": "Art & Craft",
                "id": "6903b179fe6d7500013a0d49"
            },
            {
                "name": "Baby & Musical toys",
                "id": "6903b179fe6d7500013a0d4d"
            },
            {
                "name": "Outdoor Toys",
                "id": "6903b179fe6d7500013a0d4b"
            },
            {
                "name": "Tiffin & Lunch boxes",
                "id": "6903b179fe6d7500013a0d57"
            },
            {
                "name": "STEM & Learning",
                "id": "6903b179fe6d7500013a0d46"
            },
            {
                "name": "Scooters and Ride ons",
                "id": "6903b179fe6d7500013a0d4c"
            },
            {
                "name": "Bags",
                "id": "6903b179fe6d7500013a0d4e"
            },
            {
                "name": "Books",
                "id": "6903b179fe6d7500013a0d4f"
            }
        ]
    },
    "Electronics & Appliances": {
        "cName": "Electronics and Appliances",
        "tType": "IM Meatsy",
        "section": "Household",
        "subs": [
            {
                "name": "Earphones & headsets",
                "id": "6903b179fe6d7500013a0d61"
            },
            {
                "name": "Mobiles",
                "id": "6903b179fe6d7500013a0d67"
            },
            {
                "name": "Kitchen Appliances",
                "id": "6903b179fe6d7500013a0d64"
            },
            {
                "name": "Speakers & Soundbars",
                "id": "6903b179fe6d7500013a0d6b"
            },
            {
                "name": "Laptops, Tablets and Monitors",
                "id": "6903b179fe6d7500013a0d65"
            },
            {
                "name": "Personal Care Appliances",
                "id": "69b7c133958236000180ec1d"
            },
            {
                "name": "Home Appliances",
                "id": "6903b179fe6d7500013a0d63"
            },
            {
                "name": "Powerbanks Chargers Cables",
                "id": "6903b179fe6d7500013a0d68"
            },
            {
                "name": "Smartwatches",
                "id": "6903b179fe6d7500013a0d6a"
            },
            {
                "name": "Health Care Appliances",
                "id": "6903b179fe6d7500013a0d62"
            },
            {
                "name": "Lights & Bulbs",
                "id": "6903b179fe6d7500013a0d66"
            },
            {
                "name": "Energy Saver Fans",
                "id": "69b92d8c91ebf20001c1496f"
            },
            {
                "name": "Batteries & Extensions",
                "id": "6903b179fe6d7500013a0d5f"
            },
            {
                "name": "Computer Accessories",
                "id": "6903b179fe6d7500013a0d60"
            },
            {
                "name": "Top Deals",
                "id": "69706f26a176a40001054616"
            },
            {
                "name": "Electric Kettles",
                "id": "6903b179fe6d7500013a0d5c"
            },
            {
                "name": "Smart & Streaming Devices",
                "id": "6903b179fe6d7500013a0d69"
            }
        ]
    },
    "Fashion": {
        "cName": "Fashion",
        "tType": "IM Meatsy",
        "section": "Household",
        "subs": [
            {
                "name": "Men's Innerwear",
                "id": "6903b179fe6d7500013a0d6d"
            },
            {
                "name": "Women's Innerwear",
                "id": "6903b179fe6d7500013a0d7d"
            },
            {
                "name": "T- Shirt",
                "id": "6903b179fe6d7500013a0d7c"
            },
            {
                "name": "Menswear",
                "id": "6903b179fe6d7500013a0d77"
            },
            {
                "name": "Womenswear",
                "id": "6903b179fe6d7500013a0d7b"
            },
            {
                "name": "Belts & Wallets",
                "id": "6903b179fe6d7500013a0d70"
            },
            {
                "name": "Footwear",
                "id": "6903b179fe6d7500013a0d7f"
            },
            {
                "name": "Watches",
                "id": "6903b179fe6d7500013a0d7e"
            },
            {
                "name": "Hair Accessories",
                "id": "6903b179fe6d7500013a0d73"
            },
            {
                "name": "Sunglasses",
                "id": "6903b179fe6d7500013a0d79"
            },
            {
                "name": "Chains & Necklace",
                "id": "6903b179fe6d7500013a0d71"
            },
            {
                "name": "Bangles & Bracelets",
                "id": "6903b179fe6d7500013a0d6f"
            },
            {
                "name": "Handbags & Purses",
                "id": "6903b179fe6d7500013a0d74"
            },
            {
                "name": "Earrings",
                "id": "6903b179fe6d7500013a0d72"
            },
            {
                "name": "Precious coins & Articles",
                "id": "6903b179fe6d7500013a0d78"
            },
            {
                "name": "Trolley & Backpacks",
                "id": "6903b179fe6d7500013a0d7a"
            },
            {
                "name": "Anklets, Rings & More",
                "id": "6903b179fe6d7500013a0d6e"
            },
            {
                "name": "Kids Accessories",
                "id": "6903b179fe6d7500013a0d75"
            },
            {
                "name": "Kidswear",
                "id": "6903b179fe6d7500013a0d76"
            }
        ]
    }
}
  };

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ==========================================================================
     Anti-Bot & Verification Helpers (Reverse-Engineered Swiggy Protocol)
     ========================================================================== */

  function generateMatcher() {
    const rand5 = () => Math.floor(10000 + Math.random() * 90000).toString();
    const raw = rand5() + Date.now().toString() + rand5();
    return raw.split('').map((d) => (parseInt(d, 10) + 7).toString(36)).join('');
  }

  function getDeviceId() {
    try {
      const keys = ['deviceId', 'device_id', 'x-device-id', 'swiggy_d_id'];
      for (const k of keys) {
        const v = localStorage.getItem(k);
        if (v && v.length > 10) return v;
      }
      const m = document.cookie.match(/(?:_device_id|deviceId|swiggy_d_id)=([^;]+)/);
      if (m && m[1]) return decodeURIComponent(m[1]);
    } catch (e) {}
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  function getBuildVersion() {
    try {
      if (window.__BUILD_VERSION__) return window.__BUILD_VERSION__;
      if (window.__SWIGGY_GLOBAL__?.buildVersion) return window.__SWIGGY_GLOBAL__.buildVersion;
      for (const e of performance.getEntries()) {
        const m = e.name.match(/build[-_]?version[=/:]([0-9.]+)/i);
        if (m) return m[1];
      }
    } catch (e) {}
    return CFG.buildVersion;
  }

  function detectStoreIds(allowPrompt = false) {
    let pid = null;
    let secid = null;

    function extractFromStr(str) {
      if (!str || typeof str !== 'string') return;
      try {
        const q = str.includes('?') ? str.split('?')[1] : (str.includes('=') ? str : '');
        if (q) {
          const p = new URLSearchParams(q);
          const pPid = p.get('primaryStoreId') || p.get('primary_store_id') || p.get('storeId') || p.get('store_id');
          const pSec = p.get('secondaryStoreId') || p.get('secondary_store_id');
          if (pPid && !pid && /^\d{4,}$/.test(pPid)) pid = pPid;
          if (pSec && !secid && /^\d{4,}$/.test(pSec)) secid = pSec;
        }
      } catch (e) {}

      if (!pid) {
        const mPid = str.match(/(?:"primaryStoreId"|"primary_store_id"|"storeId"|"store_id")\s*[:=]\s*"?(\d{4,})"?/i);
        if (mPid) pid = mPid[1];
      }
      if (!secid) {
        const mSec = str.match(/(?:"secondaryStoreId"|"secondary_store_id")\s*[:=]\s*"?(\d{4,})"?/i);
        if (mSec) secid = mSec[1];
      }
    }

    // 1. Current Window Location (URL bar query params and hash)
    try {
      if (typeof window !== 'undefined' && window.location) {
        extractFromStr(window.location.search);
        extractFromStr(window.location.hash);
        extractFromStr(window.location.href);
      }
    } catch (e) {}

    // 2. Performance Entries (inspected in reverse order for latest active dark store)
    try {
      if (typeof performance !== 'undefined' && performance.getEntries) {
        const entries = performance.getEntries();
        for (let i = entries.length - 1; i >= 0; i--) {
          if (pid && secid) break;
          const u = entries[i]?.name;
          if (u && (u.includes('storeId') || u.includes('store_id') || u.includes('primaryStoreId') || u.includes('secondaryStoreId') || u.includes('instamart'))) {
            extractFromStr(u);
          }
        }
      }
    } catch (e) {}

    // 3. Window Globals / State
    try {
      ['__INITIAL_STATE__', '___INITIAL_STATE__', '__SWIGGY_GLOBAL__', '__PRELOADED_STATE__'].forEach((k) => {
        if (pid && secid) return;
        try {
          const state = window[k];
          if (state) extractFromStr(typeof state === 'string' ? state : JSON.stringify(state));
        } catch (e) {}
      });
    } catch (e) {}

    // 4. LocalStorage & SessionStorage
    try {
      ['localStorage', 'sessionStorage'].forEach((storeName) => {
        if (pid && secid) return;
        try {
          const store = window[storeName];
          if (store && store.length) {
            for (let i = 0; i < store.length; i++) {
              if (pid && secid) break;
              const k = store.key(i);
              const v = store.getItem(k);
              extractFromStr(v);
            }
          }
        } catch (e) {}
      });
    } catch (e) {}

    // 5. Cookies
    try {
      if (typeof document !== 'undefined' && document.cookie) {
        extractFromStr(document.cookie);
      }
    } catch (e) {}

    // 6. Optional interactive prompt only when scouting is triggered and detection completely failed
    if (!pid && allowPrompt) {
      try {
        const manual = prompt('Could not auto-detect store ID. Paste your storeId (or storeId,secondaryStoreId):', '');
        if (manual) {
          extractFromStr(manual);
          if (!pid) {
            const parts = manual.split(',').map((s) => s.trim()).filter((s) => /^\d{4,}$/.test(s));
            if (parts.length > 0) pid = parts[0];
            if (parts.length > 1) secid = parts[1];
          }
        }
      } catch (e) {}
    }

    if (!pid) return null;
    return {
      sid: pid,
      pid: pid,
      secid: secid || ''
    };
  }

  /* ==========================================================================
     Safe API Request Pipeline with Adaptive Anti-429 Cooldown
     ========================================================================== */

  let activeDispatch = null;

  async function apiRequestSafe(url, method = 'GET', body = null, isRetry = false, retry = 0) {
    const matcher = generateMatcher();
    const headers = {
      'accept': '*/*',
      'accept-language': 'en-US,en;q=0.9',
      'content-type': 'application/json',
      'matcher': matcher,
      'x-build-version': getBuildVersion(),
      'x-device-id': getDeviceId(),
    };

    try {
      const opts = { method, headers, credentials: 'include' };
      if (body) opts.body = JSON.stringify(body);

      const res = await fetch(url, opts);
      let json = null;
      try { json = await res.json(); } catch (e) {}

      const isRateLimited =
        res.status === 429 ||
        res.status === 403 ||
        json?.statusCode === 429 ||
        json?.statusCode === 403 ||
        json?.status === 429 ||
        json?.status === 403;

      if (isRateLimited) {
        if (!isRetry) {
          return null;
        }

        if (retry >= 2) {
          const errMsg = 'Rate limit cooldown exceeded maximum retries.';
          statusEl.textContent = errMsg;
          return null;
        }

        const baseWait = 5000 * Math.pow(2, retry);
        const jitter = Math.floor(Math.random() * 2000);
        const totalWaitSec = Math.round((baseWait + jitter) / 1000);

        for (let s = totalWaitSec; s > 0; s--) {
          const cdMsg = `WAF Rate limit (429) cooling down: ${s}s…`;
          statusEl.textContent = cdMsg;
          await sleep(1000);
        }

        statusEl.textContent = 'Resuming retry with fresh auth token…';
        return apiRequestSafe(url, method, body, true, retry + 1);
      }

      if (res.status === 200 && json && json.data) {
        return json;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  function extractVariations(node, out) {
    if (!node || typeof node !== 'object') return;
    if (node.variations && Array.isArray(node.variations)) {
      out.push(...node.variations);
    } else if (node.displayName && (node.price || node.offerPrice)) {
      out.push(node);
    } else {
      Object.values(node).forEach((v) => extractVariations(v, out));
    }
  }

  function parseCardsVariations(data, catKey, catObj, sub, storeIds, resultMap) {
    if (!data?.data?.cards) return { scanned: 0, maxDiscount: 0, itemsFound: 0, itemsList: [] };

    const variations = [];
    extractVariations(data.data, variations);
    if (!variations.length) return { scanned: 0, maxDiscount: 0, itemsFound: 0, itemsList: [] };

    let scanned = 0;
    let maxDiscount = 0;
    let itemsFound = 0;
    const itemsList = [];

    for (const v of variations) {
      if (v.inventory?.inStock === false) continue;
      scanned++;

      const mrp = parseFloat(v.price?.mrp?.units || v.price?.mrp || 0);
      const price = parseFloat(v.price?.offerPrice?.units || v.price?.offerPrice || 0);
      const discount = mrp > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0;
      const savings = Math.max(0, Math.round(mrp - price));
      const name = v.displayName;
      if (!name) continue;

      maxDiscount = Math.max(maxDiscount, discount);

      const rawSku = v.skuId || v.spinId;
      const skuId = rawSku || name;
      const imageId = v.imageIds?.[0] || v.imageId || '';
      const imageUrl = imageId
        ? `https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_360,h_360,c_fit/${imageId}`
        : null;

      const searchLink = `https://www.swiggy.com/instamart/search?custom_back=true&query=${encodeURIComponent(name)}`;
      const itemLink = searchLink;

      const item = {
        skuId,
        name,
        brand: v.brandName || v.brand || 'Instamart',
        pack: v.quantityDescription || '',
        price,
        mrp,
        discount,
        savings,
        category: catKey.replace(/^\S+\s/, ''),
        subCategory: sub.name,
        rating: v.rating?.value ? `${v.rating.value} ★` : null,
        ratingCount: v.rating?.count || null,
        imageUrl,
        image: imageId,
        itemLink,
        searchLink
      };

      const existing = resultMap.get(name);
      if (!existing || price < existing.price) {
        resultMap.set(name, item);
        itemsFound++;
      }
      itemsList.push(item);
    }

    return { scanned, maxDiscount, itemsFound, itemsList };
  }

  async function fetchSubcategoryDeals(catKey, catObj, sub, storeIds, resultMap, onProgress, isRetry = false) {
    onProgress?.(`Fetching ${catObj.cName} > ${sub.name} (Page 1)…`);

    let url = '';
    let body = null;
    let method = 'GET';
    const isColl = Boolean(sub.isCollection || catObj.campaignType === 'collection');

    if (isColl) {
      method = 'GET';
      url = `https://www.swiggy.com/api/instamart/collection/items?collectionId=${sub.id}&isMonetised=true&storeId=${storeIds.sid}&primaryStoreId=${storeIds.pid}&secondaryStoreId=${storeIds.secid}&offset=0&serviceLine=INSTAMART`;
    } else if (sub.id) {
      method = 'POST';
      url = `https://www.swiggy.com/api/instamart/category-listing/filter/v2?storeId=${storeIds.sid}&primaryStoreId=${storeIds.pid}&secondaryStoreId=${storeIds.secid}&pageNo=0&offset=0&page_name=category_listing_filter`;
      body = {
        categoryName: catObj.cName,
        filterName: sub.name,
        filterId: sub.id,
        taxonomyType: catObj.tType || 'taxonomy 5',
        items_offset: '0',
        facets: [],
        sortAttribute: 'discountPercentHighToLow'
      };
    } else {
      method = 'GET';
      url = `https://www.swiggy.com/api/instamart/category-listing/v2?categoryName=${encodeURIComponent(catObj.cName)}&taxonomyType=${encodeURIComponent(catObj.tType)}&offset=0&storeId=${storeIds.sid}&primaryStoreId=${storeIds.pid}&secondaryStoreId=${storeIds.secid}`;
    }

    const data = await apiRequestSafe(url, method, body, isRetry);
    if (!data || !data.data) {
      return { ok: false, failed: true, scanned: 0, maxDiscount: 0, itemsFound: 0 };
    }

    const parsed = parseCardsVariations(data, catKey, catObj, sub, storeIds, resultMap);
    let scanned = parsed.scanned;
    let maxDiscount = parsed.maxDiscount;
    let itemsFound = parsed.itemsFound;
    let fetchedPage2 = false;

    // Smart Page 2 Expansion: If Page 1 has 15+ items and the lowest discount > 50%, grab Page 2
    const items = parsed.itemsList;
    const lastItem = items.length > 0 ? items[items.length - 1] : null;

    if (sub.id && items.length >= 15 && lastItem && lastItem.discount > 50) {
      onProgress?.(`Last item on Page 1 is ${lastItem.discount}% OFF (>50%) — fetching Page 2…`);
      const p2Delay = isRetry
        ? CFG.pacing.subMin + Math.floor(Math.random() * (CFG.pacing.subMax - CFG.pacing.subMin))
        : 150;
      await sleep(p2Delay);

      let url2 = '';
      let body2 = null;
      let method2 = 'GET';

      if (isColl) {
        method2 = 'GET';
        url2 = `https://www.swiggy.com/api/instamart/collection/items?collectionId=${sub.id}&isMonetised=true&storeId=${storeIds.sid}&primaryStoreId=${storeIds.pid}&secondaryStoreId=${storeIds.secid}&offset=1&serviceLine=INSTAMART`;
      } else {
        method2 = 'POST';
        url2 = `https://www.swiggy.com/api/instamart/category-listing/filter/v2?storeId=${storeIds.sid}&primaryStoreId=${storeIds.pid}&secondaryStoreId=${storeIds.secid}&pageNo=1&offset=1&page_name=category_listing_filter`;
        body2 = {
          categoryName: catObj.cName,
          filterName: sub.name,
          filterId: sub.id,
          taxonomyType: catObj.tType || 'taxonomy 5',
          items_offset: String(CFG.itemsPerPage),
          facets: [],
          sortAttribute: 'discountPercentHighToLow'
        };
      }

      const data2 = await apiRequestSafe(url2, method2, body2, isRetry);
      if (data2 && data2.data) {
        const parsed2 = parseCardsVariations(data2, catKey, catObj, sub, storeIds, resultMap);
        scanned += parsed2.scanned;
        maxDiscount = Math.max(maxDiscount, parsed2.maxDiscount);
        itemsFound += parsed2.itemsFound;
        fetchedPage2 = true;
      }
    }

    return { ok: true, failed: false, scanned, maxDiscount, itemsFound, fetchedPage2 };
  }

  async function fetchCampaignDeals(catKey, catObj, storeIds, resultMap, onProgress) {
    let scanned = 0;
    let maxDiscount = 0;
    let itemsFound = 0;
    let page = 0;
    let hasMore = true;

    while (hasMore && page < 6) {
      onProgress?.(`Fetching ${catObj.cName} (Page ${page + 1})…`);

      let url = '';
      if (catObj.campaignType === 'mxn') {
        url = `https://www.swiggy.com/api/instamart/campaign/mxn/v2?layoutId=${catObj.layoutId}&offset=${page}&customerPage=STORES_MxN_3&metaInfo=&storeId=${storeIds.sid}&primaryStoreId=${storeIds.pid}&secondaryStoreId=${storeIds.secid}`;
      } else if (catObj.campaignType === 'collection') {
        url = `https://www.swiggy.com/api/instamart/collection/items?collectionId=${catObj.collectionId}&isMonetised=true&storeId=${storeIds.sid}&primaryStoreId=${storeIds.pid}&secondaryStoreId=${storeIds.secid}&offset=${page}&serviceLine=INSTAMART`;
      }

      const data = await apiRequestSafe(url, 'GET', null, true);
      if (!data || !data.data) break;

      const parsed = parseCardsVariations(data, catKey, catObj, { name: catObj.cName, id: '' }, storeIds, resultMap);
      scanned += parsed.scanned;
      itemsFound += parsed.itemsFound;
      maxDiscount = Math.max(maxDiscount, parsed.maxDiscount);

      const nextOffset = data.data?.pageOffset?.nextOffset;
      if (nextOffset !== undefined && nextOffset !== '' && Number(nextOffset) > page) {
        page = Number(nextOffset);
        await sleep(200);
      } else {
        hasMore = false;
      }
    }

    return { scanned, maxDiscount, itemsFound, fetchedPage2: page > 0 };
  }

  /* ==========================================================================
     In-Browser Floating Overlay UI (Side Panel)
     ========================================================================== */

  document.getElementById('ih4-root')?.remove();
  document.getElementById('ih4-style')?.remove();

  const style = document.createElement('style');
  style.id = 'ih4-style';
  style.textContent = `
    #ih4-root, #ih4-root * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    #ih4-root { position: fixed; z-index: 2147483000; inset: auto 20px 20px auto; }

    #ih4-fab {
      position: relative; width: 54px; height: 54px; border-radius: 50%; border: none; cursor: pointer;
      background: #0f172a; color: #fff; display: flex; align-items: center; justify-content: center;
      box-shadow: 0 8px 24px rgba(15,23,42,.32); transition: transform .15s ease, background .15s ease;
    }
    #ih4-fab:hover { transform: translateY(-2px); background: #fc8019; }
    #ih4-fab svg { width: 24px; height: 24px; }
    #ih4-fab-badge {
      position: absolute; top: -4px; right: -4px; min-width: 20px; height: 20px; padding: 0 5px;
      border-radius: 10px; background: #fc8019; color: #fff; font-size: 11px; font-weight: 700;
      display: flex; align-items: center; justify-content: center; box-shadow: 0 0 0 2px #fff;
    }

    #ih4-panel {
      position: fixed; top: 0; right: 0;
      height: 100vh; height: 100dvh; max-height: -webkit-fill-available;
      width: 450px; max-width: 96vw;
      background: #fff; box-shadow: -8px 0 35px rgba(15,23,42,.15); border-left: 1px solid #e2e8f0;
      display: flex; flex-direction: column; transform: translateX(100%); transition: transform .22s ease;
      z-index: 2147483001; overflow: hidden;
    }
    #ih4-panel.open { transform: translateX(0); }
    @media (max-width: 640px) {
      #ih4-panel {
        width: 100%; max-width: 100%;
        height: 100dvh; height: 100vh; max-height: -webkit-fill-available;
      }
    }

    #ih4-panel-head { padding: 18px 20px 14px; border-bottom: 1px solid #f1f5f9; position: relative; flex-shrink: 0; }
    #ih4-panel-head .ih4-title { font-size: 16px; font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 8px; }
    #ih4-panel-head .ih4-badge { font-size: 10.5px; padding: 2px 7px; border-radius: 10px; background: #fff7ed; color: #c2410c; border: 1px solid #ffedd5; font-weight: 700; letter-spacing: .02em; }
    #ih4-panel-head .ih4-sub { font-size: 12px; color: #64748b; margin-top: 3px; line-height: 1.4; }
    #ih4-close {
      position: absolute; top: 16px; right: 16px; width: 30px; height: 30px; border-radius: 8px;
      border: none; background: #f1f5f9; color: #64748b; cursor: pointer; display: flex; align-items: center; justify-content: center;
    }
    #ih4-close:hover { background: #e2e8f0; color: #0f172a; }

    #ih4-section-tabs {
      display: flex; gap: 6px; padding: 8px 16px; background: #fff; border-bottom: 1px solid #f1f5f9; overflow-x: auto; scrollbar-width: none; flex-shrink: 0;
    }
    #ih4-section-tabs::-webkit-scrollbar { display: none; }
    .ih4-sec-tab {
      font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 14px; border: 1px solid #e2e8f0;
      background: #f8fafc; color: #475569; cursor: pointer; white-space: nowrap; transition: all .12s ease;
    }
    .ih4-sec-tab:hover { border-color: #cbd5e1; color: #0f172a; }
    .ih4-sec-tab.active { background: #0f172a; color: #fff; border-color: #0f172a; }

    #ih4-list {
      flex: 1 1 0%; min-height: 0; overflow-y: auto; -webkit-overflow-scrolling: touch;
      padding: 12px 14px;
    }

    .ih4-cat-card {
      border: 1.5px solid #e2e8f0; border-radius: 10px; margin-bottom: 10px; transition: border-color .15s ease, background .15s ease;
      background: #fff; overflow: hidden;
    }
    .ih4-cat-card:hover { border-color: #cbd5e1; }
    .ih4-cat-card.selected { border-color: #fc8019; background: #fffaf5; }

    .ih4-cat-main {
      display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 11px 13px; cursor: pointer; user-select: none;
      background: #ffffff; transition: background .12s;
    }
    .ih4-cat-card.selected .ih4-cat-main { background: #fff7ed; }
    .ih4-cat-left { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
    
    .ih4-cat-name { font-size: 13.5px; font-weight: 700; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .ih4-cat-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
    .ih4-cat-badge {
      font-size: 11px; font-weight: 600; padding: 2px 7px; border-radius: 10px; background: #f1f5f9; color: #475569;
    }
    .ih4-cat-card.selected .ih4-cat-badge { background: #ea580c; color: #fff; font-weight: 700; }
    .ih4-chevron {
      width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;
      font-size: 10px; color: #64748b; transition: transform .2s ease;
    }
    .ih4-cat-card.expanded .ih4-chevron {
      transform: rotate(180deg);
    }

    /* Subcategories Box (Collapsed by default, expanded on toggle) */
    .ih4-subs-box {
      display: none; padding: 10px 12px 12px; border-top: 1px dashed #e2e8f0; background: #fafbfc;
    }
    .ih4-cat-card.expanded .ih4-subs-box {
      display: block;
    }
    .ih4-cat-card.selected .ih4-subs-box { background: #fffaf5; border-top-color: #fed7aa; }

    .ih4-subs-head {
      display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; gap: 8px;
    }
    .ih4-subs-status { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: .02em; }
    .ih4-cat-card.selected .ih4-subs-status { color: #c2410c; }
    
    .ih4-subs-actions { display: flex; gap: 6px; }
    .ih4-btn-action {
      background: #fff; border: 1px solid #cbd5e1; border-radius: 4px; padding: 2px 7px; font-size: 10.5px;
      font-weight: 600; color: #334155; cursor: pointer; transition: all .1s ease;
    }
    .ih4-btn-action:hover { background: #f1f5f9; border-color: #94a3b8; color: #0f172a; }

    .ih4-sub-grid { display: flex; flex-wrap: wrap; gap: 6px; }
    
    .ih4-sub-pill {
      font-size: 11.5px; color: #475569; background: #fff; border: 1px solid #cbd5e1; border-radius: 14px;
      padding: 3.5px 10px; cursor: pointer; display: inline-flex; align-items: center; gap: 5px;
      transition: all .12s ease; user-select: none;
    }
    .ih4-sub-pill:hover { border-color: #94a3b8; color: #0f172a; }
    
    .ih4-sub-pill.checked {
      background: #fff7ed; border-color: #ea580c; color: #9a3412; font-weight: 700;
      box-shadow: 0 1px 3px rgba(234,88,12,.12);
    }
    .ih4-sub-icon { font-size: 11px; line-height: 1; }

    #ih4-panel-foot {
      padding: 14px 18px max(18px, env(safe-area-inset-bottom, 18px));
      border-top: 1px solid #f1f5f9; background: #fff; flex-shrink: 0;
    }
    #ih4-summary-line { font-size: 12.5px; color: #64748b; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; }
    #ih4-fetch {
      width: 100%; padding: 12px; border-radius: 10px; border: none; background: #0f172a; color: #fff;
      font-size: 13.5px; font-weight: 700; cursor: pointer; transition: background .15s ease, transform .1s ease;
    }
    #ih4-fetch:hover:not(:disabled) { background: #fc8019; }
    #ih4-fetch:active:not(:disabled) { transform: translateY(1px); }
    #ih4-fetch:disabled { background: #e2e8f0; color: #94a3b8; cursor: not-allowed; }
    #ih4-status { font-size: 12px; color: #64748b; margin-top: 9px; min-height: 16px; text-align: center; line-height: 1.4; }
    #ih4-open-results-link { display: none; margin-top: 8px; font-size: 12.5px; color: #fc8019; text-align: center; font-weight: 700; cursor: pointer; }
  `;
  document.head.appendChild(style);

  const root = document.createElement('div');
  root.id = 'ih4-root';
  root.innerHTML = `
    <div id="ih4-panel">
      <div id="ih4-panel-head">
        <div class="ih4-title">
          <span>Instamart Deal Scout</span>
          <span class="ih4-badge">Aisle Selector</span>
        </div>
        <div class="ih4-sub">Choose a category and cherry-pick subcategories to scout Page 1 top deals.</div>
        <div id="ih4-store-pod-badge" style="margin-top: 8px; font-size: 11.5px; padding: 5px 10px; border-radius: 6px; background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; display: flex; align-items: center; justify-content: space-between; cursor: pointer; user-select: none;" title="Click to refresh or edit store ID">
          <div style="display: flex; align-items: center; gap: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            <span id="ih4-store-dot" style="width: 7px; height: 7px; border-radius: 50%; background: #16a34a; flex-shrink: 0;"></span>
            <span id="ih4-store-pod-text">Detecting store pod…</span>
          </div>
          <span style="font-size: 11px; color: #64748b; margin-left: 6px; flex-shrink: 0;">↻</span>
        </div>
        <button id="ih4-close" title="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>

      <div id="ih4-section-tabs">
        ${CFG.sections.map((sec, i) => '<button class="ih4-sec-tab' + (i === 0 ? ' active' : '') + '" data-sec="' + sec + '">' + sec + '</button>').join('')}
      </div>

      <div id="ih4-list"></div>

      <div id="ih4-panel-foot">
        <div id="ih4-summary-line">
          <span id="ih4-cats-count" style="font-weight:600;color:#64748b;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:280px;">No subcategories selected</span>
          <span style="font-size:11px;color:#16a34a;font-weight:700;">Top Deals</span>
        </div>
        <button id="ih4-fetch" disabled>Select subcategories to scout</button>
        <div id="ih4-status"></div>
        <div id="ih4-open-results-link">Open Results Tab ↗</div>
      </div>
    </div>

    <button id="ih4-fab" title="Instamart Deal Scout" aria-label="Open Instamart Hunter">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
      <span id="ih4-fab-badge" style="display:none;">0</span>
    </button>
  `;
  document.body.appendChild(root);

  const panel = root.querySelector('#ih4-panel');
  const fab = root.querySelector('#ih4-fab');
  const fabBadge = root.querySelector('#ih4-fab-badge');
  const listEl = root.querySelector('#ih4-list');
  const fetchBtn = root.querySelector('#ih4-fetch');
  const statusEl = root.querySelector('#ih4-status');
  const catsCountEl = root.querySelector('#ih4-cats-count');
  const openResultsLink = root.querySelector('#ih4-open-results-link');
  const secTabs = root.querySelectorAll('.ih4-sec-tab');
  const storeBadgeEl = root.querySelector('#ih4-store-pod-badge');
  const storeTextEl = root.querySelector('#ih4-store-pod-text');
  const storeDotEl = root.querySelector('#ih4-store-dot');

  let activeStoreIds = null;

  function updateStorePodDisplay(storeIds) {
    if (!storeTextEl || !storeBadgeEl) return;
    if (storeIds && storeIds.sid) {
      activeStoreIds = storeIds;
      storeBadgeEl.style.background = '#f0fdf4';
      storeBadgeEl.style.color = '#166534';
      storeBadgeEl.style.borderColor = '#bbf7d0';
      if (storeDotEl) storeDotEl.style.background = '#16a34a';
      const secText = storeIds.secid ? ` <span style="color:#64748b;font-weight:normal;">(Sec: ${storeIds.secid})</span>` : '';
      storeTextEl.innerHTML = `🏪 Store Pod: <b>${storeIds.sid}</b>${secText}`;
    } else {
      activeStoreIds = null;
      storeBadgeEl.style.background = '#fffbeb';
      storeBadgeEl.style.color = '#92400e';
      storeBadgeEl.style.borderColor = '#fde68a';
      if (storeDotEl) storeDotEl.style.background = '#f59e0b';
      storeTextEl.innerHTML = `⚠️ Store not detected. Click any aisle or tap ↻ to set`;
    }
  }

  if (storeBadgeEl) {
    storeBadgeEl.addEventListener('click', () => {
      const refreshed = detectStoreIds(true);
      updateStorePodDisplay(refreshed);
    });
  }

  fab.addEventListener('click', () => panel.classList.toggle('open'));
  root.querySelector('#ih4-close').addEventListener('click', () => panel.classList.remove('open'));

  let isScouting = false;
  let hasResults = false;
  let finalItemsCache = [];
  let latestMetaCache = null;

  // Single-Category Selection State & Accordion State:
  let selectedCat = null;
  let selectedSubs = new Set();
  const expandedCats = new Set(); // Categories currently expanded by the user
  let currentSection = 'All';

  function getCleanCatName(catKey) {
    return catKey.replace(/^\S+\s/, '');
  }

  function updateFooter() {
    if (isScouting) return;
    hasResults = false;
    fetchBtn.style.background = '';
    openResultsLink.style.display = 'none';

    if (!selectedCat || selectedSubs.size === 0) {
      catsCountEl.textContent = 'No subcategories selected';
      catsCountEl.style.color = '#64748b';
      fabBadge.style.display = 'none';
      fabBadge.textContent = '0';
      fetchBtn.disabled = true;
      fetchBtn.textContent = 'Select subcategories to scout';
      return;
    }

    const catObj = CFG.cats[selectedCat];
    const cleanName = getCleanCatName(selectedCat);
    const count = selectedSubs.size;
    const total = catObj.subs?.length || 1;

    fabBadge.style.display = 'flex';
    fabBadge.textContent = String(count);

    if (count === total) {
      catsCountEl.innerHTML = `Selected: <b>${cleanName}</b> (All ${count} aisles)`;
      catsCountEl.style.color = '#0f172a';
      fetchBtn.disabled = false;
      fetchBtn.textContent = `Fetch All ${cleanName} (${count} aisles)`;
    } else {
      catsCountEl.innerHTML = `Selected: <b>${cleanName}</b> (${count}/${total} aisles)`;
      catsCountEl.style.color = '#0f172a';
      fetchBtn.disabled = false;
      fetchBtn.textContent = `Fetch ${count} Subcategories in ${cleanName}`;
    }
  }

  function renderCategories() {
    listEl.innerHTML = '';
    let matchCount = 0;

    for (const [catKey, catObj] of Object.entries(CFG.cats)) {
      if (currentSection !== 'All' && catObj.section !== currentSection) continue;

      const cleanCatName = getCleanCatName(catKey);
      const subs = catObj.subs || [];

      matchCount++;
      const isSelectedCat = selectedCat === catKey;
      const countSelected = isSelectedCat ? selectedSubs.size : 0;
      const totalSubs = subs.length;
      const isExpanded = expandedCats.has(catKey);

      const card = document.createElement('div');
      card.className = `ih4-cat-card${isSelectedCat && countSelected > 0 ? ' selected' : ''}${isExpanded ? ' expanded' : ''}`;

      // Header with Title, Badge & Expand Chevron (No Radio Button)
      const header = document.createElement('div');
      header.className = 'ih4-cat-main';
      header.innerHTML = `
        <div class="ih4-cat-left">
          <span class="ih4-cat-name">${catKey}</span>
        </div>
        <div class="ih4-cat-right">
          <span class="ih4-cat-badge">${isSelectedCat && countSelected > 0 ? (`${countSelected}/${totalSubs} selected`) : (`${totalSubs} aisles`)}</span>
          <span class="ih4-chevron">▼</span>
        </div>
      `;

      // Clicking anywhere on header: toggles accordion expansion
      header.addEventListener('click', () => {
        if (expandedCats.has(catKey)) {
          expandedCats.delete(catKey);
        } else {
          expandedCats.add(catKey);
        }
        renderCategories();
      });

      // Subcategories Box (Collapsed by default)
      const subsBox = document.createElement('div');
      subsBox.className = 'ih4-subs-box';

      // Subcategory header with Select All / Clear
      const subsHead = document.createElement('div');
      subsHead.className = 'ih4-subs-head';
      subsHead.innerHTML = `
        <span class="ih4-subs-status">${isSelectedCat && countSelected > 0 ? (`${countSelected} of ${totalSubs} aisles selected`) : (`${totalSubs} subcategories:`)}</span>
        <div class="ih4-subs-actions">
          <button type="button" class="ih4-btn-action" data-action="all">Select All</button>
          <button type="button" class="ih4-btn-action" data-action="none">Clear</button>
        </div>
      `;

      subsHead.querySelector('[data-action="all"]').addEventListener('click', (e) => {
        e.stopPropagation();
        selectedCat = catKey;
        selectedSubs = new Set(subs.map(s => s.id || s.name));
        expandedCats.add(catKey);
        renderCategories();
        updateFooter();
      });

      subsHead.querySelector('[data-action="none"]').addEventListener('click', (e) => {
        e.stopPropagation();
        if (selectedCat === catKey) {
          selectedCat = null;
          selectedSubs.clear();
          renderCategories();
          updateFooter();
        }
      });

      subsBox.appendChild(subsHead);

      // Subcategory Pills Grid
      const pillGrid = document.createElement('div');
      pillGrid.className = 'ih4-sub-grid';

      subs.forEach((sub) => {
        const subKey = sub.id || sub.name;
        const isChecked = isSelectedCat && selectedSubs.has(subKey);

        const pill = document.createElement('button');
        pill.type = 'button';
        pill.className = `ih4-sub-pill${isChecked ? ' checked' : ''}`;
        pill.innerHTML = `
          <span class="ih4-sub-icon">${isChecked ? '✓' : '+'}</span>
          <span class="ih4-sub-text">${sub.name}</span>
        `;

        pill.addEventListener('click', (e) => {
          e.stopPropagation();
          if (selectedCat !== catKey) {
            // Switched category -> deselect previous category and select only this subcategory
            selectedCat = catKey;
            selectedSubs = new Set([subKey]);
            expandedCats.add(catKey);
          } else {
            // Same category -> toggle subcategory
            if (selectedSubs.has(subKey)) {
              selectedSubs.delete(subKey);
              if (selectedSubs.size === 0) {
                selectedCat = null;
              }
            } else {
              selectedSubs.add(subKey);
            }
          }
          renderCategories();
          updateFooter();
        });

        pillGrid.appendChild(pill);
      });

      subsBox.appendChild(pillGrid);
      card.appendChild(header);
      card.appendChild(subsBox);
      listEl.appendChild(card);
    }

    if (matchCount === 0) {
      listEl.innerHTML = '<div style="padding:32px 14px;text-align:center;color:#94a3b8;font-size:12.5px;">No categories in this section.</div>';
    }
  }

  secTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      secTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      currentSection = tab.dataset.sec;
      renderCategories();
    });
  });

  renderCategories();
  updateFooter();

  /* ==========================================================================
     Results Tab Application Shell (Zepto-Style 5-Column Grid with Brand Filter)
     ========================================================================== */

  function buildResultsTabHTML(categoriesList, initialData = null, initialMeta = null) {
    const serializedData = initialData ? JSON.stringify(initialData).replace(/<\/script>/gi, '<\\/script>') : 'null';
    const serializedMeta = initialMeta ? JSON.stringify(initialMeta).replace(/<\/script>/gi, '<\\/script>') : 'null';
    const hasInitial = Array.isArray(initialData);

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Instamart Hunter v4 — Top Deals Results</title>
  <style>
    :root {
      --bg: #f8fafc;
      --card-bg: #ffffff;
      --border: #e2e8f0;
      --border-hover: #cbd5e1;
      --text: #0f172a;
      --text-muted: #64748b;
      --orange: #fc8019;
      --green: #16a34a;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.45;
    }

    header {
      position: sticky; top: 0; background: #ffffff; color: #0f172a; padding: 14px 24px; z-index: 10;
      display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;
      border-bottom: 1px solid var(--border);
    }
    header h1 {
      font-size: 16px; margin: 0; font-weight: 800; letter-spacing: -.01em;
      display: flex; align-items: center; gap: 8px; color: #0f172a;
    }
    header .badge {
      font-size: 11px; background: #fff7ed; color: #ea580c; border: 1px solid #ffedd5;
      padding: 2px 8px; border-radius: 12px; font-weight: 700;
    }
    header .count { font-size: 13px; color: var(--text-muted); font-weight: 600; }

    /* Controls Bar: Search, Subcategory, Brand, Sort */
    .controls {
      position: sticky; top: 53px; background: #ffffff; border-bottom: 1px solid var(--border);
      padding: 12px 24px; display: flex; gap: 10px; flex-wrap: wrap; z-index: 9;
      align-items: center;
    }
    .controls input, .controls select {
      padding: 9px 12px; border-radius: 8px; border: 1px solid #cbd5e1;
      font-size: 13px; color: #0f172a; background: #ffffff; outline: none;
      transition: border-color .15s ease;
    }
    .controls input:focus, .controls select:focus { border-color: var(--orange); }
    .controls input { flex: 2; min-width: 220px; }
    .controls select { flex: 1; min-width: 150px; cursor: pointer; }
    .controls.disabled { opacity: .5; pointer-events: none; }

    /* Loading Spinner */
    #loading { padding: 80px 20px; text-align: center; }
    .spinner {
      width: 36px; height: 36px; border-radius: 50%; border: 3.5px solid #e2e8f0;
      border-top-color: var(--orange); margin: 0 auto 16px; animation: ih4-spin 0.8s linear infinite;
    }
    @keyframes ih4-spin { to { transform: rotate(360deg); } }
    #loading .msg { font-size: 15px; color: #1e293b; font-weight: 700; }
    #loading .sub { font-size: 12.5px; color: #64748b; margin-top: 6px; }
    #loading .bar-wrap { width: 240px; height: 6px; border-radius: 4px; background: #e2e8f0; margin: 16px auto 0; overflow: hidden; }
    #loading .bar { height: 100%; width: 0%; background: var(--orange); transition: width .2s ease; }

    /* 5-Column Responsive Product Card Grid (Zepto Style) */
    .product-grid {
      display: grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      gap: 16px;
      padding: 20px 24px 60px;
      max-width: 1440px;
      margin: 0 auto;
    }
    @media (max-width: 1200px) {
      .product-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    }
    @media (max-width: 900px) {
      .product-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    }
    @media (max-width: 768px) {
      .product-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        gap: 10px !important;
        padding: 10px 10px 60px !important;
      }
      .img-wrap {
        height: 120px !important;
        padding: 8px !important;
      }
      .product-img {
        max-height: 105px !important;
      }
      .card-body {
        padding: 10px !important;
      }
      .product-title {
        font-size: 12px !important;
        min-height: 32px !important;
      }
      .selling-price {
        font-size: 14px !important;
      }
      .controls {
        padding: 10px 12px !important;
        gap: 8px !important;
      }
      .controls input {
        min-width: 140px;
        width: 100%;
      }
      .controls select {
        min-width: calc(50% - 4px);
      }
    }

    /* Product Card */
    .product-card {
      position: relative;
      background: #ffffff;
      border: 1px solid var(--border);
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: transform .15s ease, box-shadow .15s ease, border-color .15s ease;
    }
    .product-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
      border-color: #cbd5e1;
    }

    /* Discount Badge (Green Background on Top Left) */
    .discount-badge {
      position: absolute;
      top: 9px;
      left: 9px;
      background: var(--green);
      color: #ffffff;
      font-size: 11px;
      font-weight: 800;
      padding: 3px 7px;
      border-radius: 6px;
      z-index: 2;
      letter-spacing: 0.02em;
      box-shadow: 0 2px 6px rgba(22, 163, 74, 0.25);
    }

    /* Product Image Container (Centered) */
    .img-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 145px;
      background: #fafbfc;
      padding: 12px;
      text-decoration: none;
      position: relative;
    }
    .product-img {
      max-height: 125px;
      max-width: 100%;
      object-fit: contain;
      transition: transform .15s ease;
    }
    .product-card:hover .product-img {
      transform: scale(1.03);
    }
    .img-placeholder {
      font-size: 32px;
      color: #94a3b8;
    }

    /* Product Info Below Image */
    .card-body {
      padding: 12px 14px 14px;
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .meta-line {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
      margin-bottom: 4px;
    }
    .brand-name {
      font-size: 10.5px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 110px;
    }
    .subcat-pill {
      font-size: 10px;
      color: #475569;
      background: #f1f5f9;
      padding: 1px 6px;
      border-radius: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100px;
    }

    .product-title {
      font-size: 13px;
      font-weight: 600;
      color: #0f172a;
      line-height: 1.38;
      text-decoration: none;
      margin-bottom: 4px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      min-height: 36px;
    }
    .product-title:hover {
      color: var(--orange);
    }

    .pack-text {
      font-size: 11.5px;
      color: #64748b;
      margin-bottom: 10px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .price-container {
      margin-top: auto;
      display: flex;
      align-items: baseline;
      gap: 6px;
      flex-wrap: wrap;
    }
    .selling-price {
      font-size: 15px;
      font-weight: 800;
      color: #0f172a;
    }
    .mrp-price {
      font-size: 12px;
      color: #94a3b8;
      text-decoration: line-through;
    }
    .save-tag {
      font-size: 10.5px;
      font-weight: 700;
      color: var(--green);
      margin-left: auto;
    }

    .empty-state {
      padding: 80px 20px;
      text-align: center;
      color: #64748b;
      font-size: 13.5px;
      grid-column: 1 / -1;
    }
  </style>
</head>
<body>
  <header>
    <h1>🛒 Instamart Category Scout <span class="badge">Top Deals</span></h1>
    <div class="header-actions">
      <span class="count" id="count">${hasInitial ? initialData.length + ' deals' : 'Starting Scout…'}</span>
    </div>
  </header>

  <div class="controls ${hasInitial ? '' : 'disabled'}" id="controls">
    <input id="search" placeholder="🔍 Search product, brand, pack, aisle…" />
    <select id="subFilter">
      <option value="">All Subcategories</option>
    </select>
    <select id="brandFilter">
      <option value="">All Brands</option>
    </select>
    <select id="sortSelect">
      <option value="discount-desc">🔥 Highest Discount %</option>
      <option value="savings-desc">💰 Highest Savings (₹)</option>
      <option value="price-asc">💵 Price: Low to High</option>
      <option value="price-desc">💎 Price: High to Low</option>
      <option value="name-asc">🔤 Name: A to Z</option>
    </select>
  </div>

  <div id="loading" style="${hasInitial ? 'display:none;' : ''}">
    <div class="spinner"></div>
    <div class="msg" id="loadMsg">Connecting to Swiggy Instamart…</div>
    <div class="sub" id="loadSub">Scouting top deals across selected categories</div>
    <div class="bar-wrap"><div class="bar" id="loadBar"></div></div>
  </div>

  <div class="product-grid" id="productGrid"></div>

  <script>
    let DATA = ${serializedData} || [];
    let META = ${serializedMeta} || null;
    let query = '', subFilter = '', brandFilter = '', sortOption = 'discount-desc';

    function esc(s) {
      return String(s || '').replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
    }

    function updateSubFilter() {
      const subSelect = document.getElementById('subFilter');
      if (!subSelect) return;
      const currentVal = subSelect.value;
      const subs = Array.from(new Set(DATA.map(r => r.subCategory).filter(Boolean))).sort((a, b) => a.localeCompare(b));
      let optHtml = '<option value="">All Subcategories (' + subs.length + ')</option>';
      subs.forEach(s => {
        optHtml += '<option value="' + esc(s) + '"' + (s === currentVal ? ' selected' : '') + '>' + esc(s) + '</option>';
      });
      subSelect.innerHTML = optHtml;
    }

    function updateBrandFilter() {
      const brandSelect = document.getElementById('brandFilter');
      if (!brandSelect) return;
      const currentVal = brandSelect.value;
      const brands = Array.from(new Set(DATA.map(r => r.brand).filter(Boolean))).sort((a, b) => a.localeCompare(b));
      let optHtml = '<option value="">All Brands (' + brands.length + ')</option>';
      brands.forEach(b => {
        optHtml += '<option value="' + esc(b) + '"' + (b === currentVal ? ' selected' : '') + '>' + esc(b) + '</option>';
      });
      brandSelect.innerHTML = optHtml;
    }

    function render() {
      const q = query.trim().toLowerCase();

      let rows = DATA.filter((r) => {
        if (subFilter && r.subCategory !== subFilter) return false;
        if (brandFilter && r.brand !== brandFilter) return false;
        if (!q) return true;
        return (
          (r.name || '') + ' ' +
          (r.brand || '') + ' ' +
          (r.pack || '') + ' ' +
          (r.subCategory || '')
        ).toLowerCase().includes(q);
      });

      rows.sort((a, b) => {
        switch (sortOption) {
          case 'discount-desc': return (b.discount || 0) - (a.discount || 0);
          case 'savings-desc': return (b.savings || 0) - (a.savings || 0);
          case 'price-asc': return (a.price || 0) - (b.price || 0);
          case 'price-desc': return (b.price || 0) - (a.price || 0);
          case 'name-asc': return (a.name || '').localeCompare(b.name || '');
          default: return (b.discount || 0) - (a.discount || 0);
        }
      });

      document.getElementById('count').textContent = rows.length + ' of ' + DATA.length + ' deals';
      const gridEl = document.getElementById('productGrid');

      if (rows.length === 0) {
        gridEl.innerHTML = '<div class="empty-state">No products matched your search or filters.</div>';
      } else {
        gridEl.innerHTML = rows.map((r) => {
          const imgUrl = r.imageUrl || (r.image ? ('https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_360,h_360,c_fit/' + esc(r.image)) : '');
          const brand = r.brand || 'Instamart';
          const sub = r.subCategory || '';
          const sLink = r.searchLink || ('https://www.swiggy.com/instamart/search?custom_back=true&query=' + encodeURIComponent(r.name));

          let cardHtml = '<div class="product-card">';
          if (r.discount > 0) {
            cardHtml += '<div class="discount-badge">' + r.discount + '% OFF</div>';
          }
          cardHtml += '<a class="img-wrap" href="' + esc(sLink) + '" target="_blank" rel="noopener" title="Open ' + esc(r.name) + ' on Instamart">';
          if (imgUrl) {
            cardHtml += '<img class="product-img" src="' + imgUrl + '" alt="' + esc(r.name) + '" loading="lazy" />';
          } else {
            cardHtml += '<div class="img-placeholder">🛒</div>';
          }
          cardHtml += '</a>';
          cardHtml += '<div class="card-body">';
          cardHtml += '<div class="meta-line">';
          cardHtml += '<span class="brand-name" title="' + esc(brand) + '">' + esc(brand) + '</span>';
          if (sub) {
            cardHtml += '<span class="subcat-pill" title="' + esc(sub) + '">' + esc(sub) + '</span>';
          }
          cardHtml += '</div>';
          cardHtml += '<a class="product-title" href="' + esc(sLink) + '" target="_blank" rel="noopener" title="' + esc(r.name) + '">' + esc(r.name) + '</a>';
          cardHtml += '<div class="pack-text">' + (r.pack ? esc(r.pack) : '&nbsp;') + '</div>';
          cardHtml += '<div class="price-container">';
          cardHtml += '<span class="selling-price">₹' + r.price + '</span>';
          if (r.mrp > r.price) {
            cardHtml += '<span class="mrp-price">₹' + r.mrp + '</span>';
          }
          if (r.savings > 0) {
            cardHtml += '<span class="save-tag">Save ₹' + r.savings + '</span>';
          }
          cardHtml += '</div></div></div>';
          return cardHtml;
        }).join('');
      }
    }

    document.getElementById('search').addEventListener('input', (e) => { query = e.target.value; render(); });
    document.getElementById('subFilter').addEventListener('change', (e) => { subFilter = e.target.value; render(); });
    document.getElementById('brandFilter').addEventListener('change', (e) => { brandFilter = e.target.value; render(); });
    document.getElementById('sortSelect').addEventListener('change', (e) => { sortOption = e.target.value; render(); });

    window.__ihReceive = function (msg) {
      if (!msg || (msg.source && msg.source !== 'ih4')) return;
      if (msg.type === 'progress') {
        const loadMsg = document.getElementById('loadMsg');
        const loadSub = document.getElementById('loadSub');
        const loadBar = document.getElementById('loadBar');
        if (loadMsg) loadMsg.textContent = msg.text || 'Fetching…';
        if (typeof msg.doneCount === 'number' && typeof msg.total === 'number') {
          if (loadSub) loadSub.textContent = msg.doneCount + ' of ' + msg.total + ' items completed';
          if (loadBar) loadBar.style.width = Math.round((msg.doneCount / msg.total) * 100) + '%';
        }
      } else if (msg.type === 'done') {
        DATA = msg.items || [];
        META = msg.meta || null;
        updateSubFilter();
        updateBrandFilter();
        document.getElementById('loading').style.display = 'none';
        document.getElementById('controls').classList.remove('disabled');
        render();
      }
    };

    window.addEventListener('message', (e) => {
      if (e.data && e.data.source === 'ih4') {
        window.__ihReceive(e.data);
      }
    });

    if (${hasInitial}) {
      document.getElementById('loading').style.display = 'none';
      document.getElementById('controls').classList.remove('disabled');
      updateSubFilter();
      updateBrandFilter();
      render();
    } else {
      try {
        if (window.opener && window.opener.__IH4_LATEST_MSG__) {
          window.__ihReceive(window.opener.__IH4_LATEST_MSG__);
        }
      } catch (e) {}

      try {
        const stored = sessionStorage.getItem('__IH4_LATEST_DEALS__');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && (Date.now() - (parsed.time || 0) < 180000)) {
            window.__ihReceive(parsed);
          }
        }
      } catch (e) {}
    }
  </script>
</body>
</html>`;
  }

  /* ==========================================================================
     Execution Controller (Granular Subcategory Scout Loop)
     ========================================================================== */

  function openResults() {
    if (!finalItemsCache || (!finalItemsCache.length && !latestMetaCache)) return;
    const catNameClean = selectedCat ? getCleanCatName(selectedCat) : 'Instamart';
    const w = window.open('', '_blank');
    if (w) {
      w.document.open();
      w.document.write(buildResultsTabHTML([catNameClean], finalItemsCache, latestMetaCache));
      w.document.close();
    }
  }

  openResultsLink.addEventListener('click', openResults);

  fetchBtn.addEventListener('click', async () => {
    if (isScouting) return;

    if (hasResults) {
      openResults();
      return;
    }

    if (!selectedCat || selectedSubs.size === 0) return;

    const storeIds = detectStoreIds(true) || activeStoreIds;
    if (!storeIds) {
      statusEl.textContent = 'Could not detect store ID. Please navigate to an Instamart page or click ↻ on the store pod above.';
      updateStorePodDisplay(null);
      return;
    }
    updateStorePodDisplay(storeIds);

    const catKey = selectedCat;
    const catObj = CFG.cats[catKey];
    if (!catObj) return;

    const catNameClean = getCleanCatName(catKey);
    const activeSubs = (catObj.subs || []).filter(s => selectedSubs.has(s.id || s.name));

    if (activeSubs.length === 0) {
      statusEl.textContent = 'Please select at least one subcategory.';
      return;
    }

    isScouting = true;
    hasResults = false;
    expandedCats.clear();
    listEl.querySelectorAll('.ih4-cat-card.expanded').forEach(card => card.classList.remove('expanded'));
    fetchBtn.disabled = true;
    fetchBtn.textContent = '⏳ Scouting Deals…';
    fetchBtn.style.background = '';
    openResultsLink.style.display = 'none';

    const dispatch = (msg) => {
      const payload = { source: 'ih4', time: Date.now(), ...msg };
      try { sessionStorage.setItem('__IH4_LATEST_DEALS__', JSON.stringify(payload)); } catch (e) {}
      try { window.__IH4_LATEST_MSG__ = payload; } catch (e) {}
    };

    activeDispatch = dispatch;
    const resultMap = new Map();
    let totalScanned = 0;
    let overallMaxDiscount = 0;

    const totalSubs = activeSubs.length;

    if (catObj.isCampaign) {
      statusEl.textContent = `Scouting "${catNameClean}" deals…`;
      dispatch({ type: 'progress', text: `Scouting "${catNameClean}" deals…`, doneCount: 0, total: 1 });

      const res = await fetchCampaignDeals(catKey, catObj, storeIds, resultMap, (detail) => {
        statusEl.textContent = detail;
        dispatch({ type: 'progress', text: detail, doneCount: 0, total: 1 });
      });

      if (res) {
        totalScanned = res.scanned;
        overallMaxDiscount = res.maxDiscount;
      }
    } else {
      statusEl.textContent = `Scouting ${totalSubs} subcategories in "${catNameClean}"…`;
      dispatch({ type: 'progress', text: `Scouting ${totalSubs} subcategories in "${catNameClean}"…`, doneCount: 0, total: totalSubs });

      const failedTasks = [];
      let doneCount = 0;

      // Phase 1: Fast initial pass (150ms gap between subcategories)
      for (let i = 0; i < totalSubs; i++) {
        const sub = activeSubs[i];
        const taskLabel = `${catNameClean} > ${sub.name}`;

        dispatch({
          type: 'progress',
          text: `Scouting [${i + 1}/${totalSubs}]: ${taskLabel}…`,
          doneCount,
          total: totalSubs
        });

        statusEl.textContent = `[${i + 1}/${totalSubs}] Scouting "${sub.name}"…`;

        const res = await fetchSubcategoryDeals(catKey, catObj, sub, storeIds, resultMap, (detail) => {
          statusEl.textContent = `[${i + 1}/${totalSubs}] ${detail}`;
          dispatch({ type: 'progress', text: `[${i + 1}/${totalSubs}] ${detail}`, doneCount, total: totalSubs });
        }, false);

        if (!res || res.failed) {
          failedTasks.push(sub);
          statusEl.textContent = `[${i + 1}/${totalSubs}] "${sub.name}" queued for retry`;
        } else {
          totalScanned += res.scanned;
          overallMaxDiscount = Math.max(overallMaxDiscount, res.maxDiscount);
        }

        doneCount++;

        if (i < totalSubs - 1) {
          await sleep(150);
        }
      }

      // Phase 2: Retry phase WITH jitter (1.8s - 2.8s) for any failed subcategories
      if (failedTasks.length > 0) {
        statusEl.textContent = `Retrying ${failedTasks.length} subcategories with anti-429 jitter (1.8s–2.8s)…`;
        await sleep(1200);

        for (let j = 0; j < failedTasks.length; j++) {
          const sub = failedTasks[j];
          const pauseMs = CFG.pacing.subMin + Math.floor(Math.random() * (CFG.pacing.subMax - CFG.pacing.subMin));
          const pauseSec = (pauseMs / 1000).toFixed(1);

          statusEl.textContent = `[Retry ${j + 1}/${failedTasks.length}] Waiting ${pauseSec}s jitter before "${sub.name}"…`;
          dispatch({
            type: 'progress',
            text: `Retry jitter (${pauseSec}s) before "${sub.name}"…`,
            doneCount: totalSubs - failedTasks.length + j,
            total: totalSubs
          });

          await sleep(pauseMs);

          statusEl.textContent = `[Retry ${j + 1}/${failedTasks.length}] Retrying "${sub.name}"…`;
          const res = await fetchSubcategoryDeals(catKey, catObj, sub, storeIds, resultMap, (detail) => {
            statusEl.textContent = `[Retry ${j + 1}/${failedTasks.length}] ${detail}`;
          }, true);

          if (res && !res.failed) {
            totalScanned += res.scanned;
            overallMaxDiscount = Math.max(overallMaxDiscount, res.maxDiscount);
          }
        }
      }
    }

    const finalItems = Array.from(resultMap.values());
    finalItemsCache = finalItems;
    latestMetaCache = {
      totalScanned,
      overallMaxDiscount,
      totalSubs,
      totalCats: 1,
      categoryName: catNameClean
    };

    isScouting = false;
    hasResults = true;

    statusEl.innerHTML = `<span style="color:#16a34a;font-weight:700;">✓ Complete:</span> Loaded <b>${finalItems.length} deals</b> across ${totalSubs} subcategories (Max: ${overallMaxDiscount}% OFF).`;
    dispatch({ type: 'done', items: finalItems, meta: latestMetaCache });

    fetchBtn.disabled = false;
    fetchBtn.style.background = '#16a34a';
    fetchBtn.textContent = `🟢 View ${finalItems.length} Deals in Results Tab ↗`;

    openResultsLink.style.display = 'block';
    openResultsLink.textContent = `✨ View ${finalItems.length} Deals in Results Tab ↗`;

    openResults();
  });

  panel.classList.add('open');

  // Auto-detect store IDs immediately when sidebar loads
  const initialStoreIds = detectStoreIds(false);
  updateStorePodDisplay(initialStoreIds);

  // Passive background re-check if not detected yet (e.g. Swiggy API call still pending)
  if (!initialStoreIds) {
    const checkTimer = setInterval(() => {
      if (activeStoreIds) {
        clearInterval(checkTimer);
        return;
      }
      const rechecked = detectStoreIds(false);
      if (rechecked) {
        updateStorePodDisplay(rechecked);
        clearInterval(checkTimer);
      }
    }, 1000);
    setTimeout(() => clearInterval(checkTimer), 10000);
  }
})();
