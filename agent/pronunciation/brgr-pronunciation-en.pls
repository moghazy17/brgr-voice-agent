<?xml version="1.0" encoding="UTF-8"?>
<!--
  BRGR Voice Agent — English Pronunciation Lexicon
  Format: W3C Pronunciation Lexicon Specification (PLS) 1.0
  Compatible with ElevenLabs pronunciation dictionaries.

  Upload via:
    ElevenLabs Dashboard → Voices → Pronunciation Dictionaries → New
    or API: POST /v1/pronunciation-dictionaries/add-from-file

  Conventions:
    - <alias>     : safe spelling-replacement (best for abbreviations).
    - <phoneme>   : IPA phoneme string (supported by Eleven Multilingual v2,
                    Eleven v3, Turbo v2.5). Use for proper nouns.
-->
<lexicon version="1.0"
         xmlns="http://www.w3.org/2005/01/pronunciation-lexicon"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://www.w3.org/2005/01/pronunciation-lexicon
                             http://www.w3.org/TR/2007/CR-pronunciation-lexicon-20071212/pls.xsd"
         alphabet="ipa"
         xml:lang="en-US">

  <!-- ============ BRAND ABBREVIATIONS ============ -->
  <!-- BRGR is the brand name. Spell it letter-by-letter, NOT "burger". -->


  <lexeme>
    <grapheme>CHKN</grapheme>
    <alias>chicken</alias>
  </lexeme>

  <lexeme>
    <grapheme>GRLD</grapheme>
    <alias>grilled</alias>
  </lexeme>

  <lexeme>
    <grapheme>Prez</grapheme>
    <alias>prez</alias>
    <phoneme>prɛz</phoneme>
  </lexeme>

  <lexeme>
    <grapheme>CinnaBomb</grapheme>
    <alias>cinna bomb</alias>
  </lexeme>

  <lexeme>
    <grapheme>J-Bomb</grapheme>
    <alias>jay bomb</alias>
  </lexeme>

  <!-- ============ CURRENCY ============ -->
  <lexeme>
    <grapheme>EGP</grapheme>
    <alias>Egyptian pounds</alias>
  </lexeme>

  <lexeme>
    <grapheme>L.E.</grapheme>
    <alias>Egyptian pounds</alias>
  </lexeme>

  <!-- ============ EGYPTIAN / ARABIC LOANWORDS ============ -->
  <lexeme>
    <grapheme>Konafa</grapheme>
    <grapheme>konafa</grapheme>
    <grapheme>Kunafa</grapheme>
    <grapheme>kunafa</grapheme>
    <phoneme>kʊˈnæː.fə</phoneme>
  </lexeme>

  <!-- ============ FOOD TERMS (often mispronounced) ============ -->
  <lexeme>
    <grapheme>Jalapeno</grapheme>
    <grapheme>jalapeno</grapheme>
    <grapheme>Jalapeño</grapheme>
    <phoneme>ˌhæl.əˈpeɪ.njoʊ</phoneme>
  </lexeme>

  <lexeme>
    <grapheme>Sriracha</grapheme>
    <grapheme>sriracha</grapheme>
    <phoneme>sɪˈrɑː.tʃə</phoneme>
  </lexeme>

  <lexeme>
    <grapheme>Nutella</grapheme>
    <grapheme>nutella</grapheme>
    <phoneme>nuːˈtɛl.ə</phoneme>
  </lexeme>

  <lexeme>
    <grapheme>Pistachio</grapheme>
    <grapheme>pistachio</grapheme>
    <phoneme>pɪˈstɑː.ʃi.oʊ</phoneme>
  </lexeme>

  <lexeme>
    <grapheme>Lotus</grapheme>
    <grapheme>lotus</grapheme>
    <phoneme>ˈloʊ.təs</phoneme>
  </lexeme>

  <lexeme>
    <grapheme>Oreo</grapheme>
    <grapheme>oreo</grapheme>
    <phoneme>ˈɔːr.i.oʊ</phoneme>
  </lexeme>

  <lexeme>
    <grapheme>Truffle</grapheme>
    <grapheme>truffle</grapheme>
    <phoneme>ˈtrʌf.əl</phoneme>
  </lexeme>

  <lexeme>
    <grapheme>Buffalo</grapheme>
    <grapheme>buffalo</grapheme>
    <phoneme>ˈbʌf.ə.loʊ</phoneme>
  </lexeme>

  <lexeme>
    <grapheme>Atomic</grapheme>
    <grapheme>atomic</grapheme>
    <phoneme>əˈtɒm.ɪk</phoneme>
  </lexeme>

  <lexeme>
    <grapheme>Moroccan</grapheme>
    <grapheme>moroccan</grapheme>
    <phoneme>məˈrɒk.ən</phoneme>
  </lexeme>

  <lexeme>
    <grapheme>caramelized</grapheme>
    <grapheme>Caramelized</grapheme>
    <phoneme>ˈkær.ə.mə.laɪzd</phoneme>
  </lexeme>

  <lexeme>
    <grapheme>Sundae</grapheme>
    <grapheme>sundae</grapheme>
    <phoneme>ˈsʌn.deɪ</phoneme>
  </lexeme>

  <lexeme>
    <grapheme>BBQ</grapheme>
    <alias>barbecue</alias>
  </lexeme>

  <lexeme>
    <grapheme>Tangy BBQ</grapheme>
    <alias>tangy barbecue</alias>
  </lexeme>

  <!-- ============ NUMBER / PHONE HELPERS ============ -->
  <!-- Egyptian mobile prefixes — recite digit-by-digit -->
  <lexeme>
    <grapheme>010</grapheme>
    <alias>oh one oh</alias>
  </lexeme>

  <lexeme>
    <grapheme>011</grapheme>
    <alias>oh one one</alias>
  </lexeme>

  <lexeme>
    <grapheme>012</grapheme>
    <alias>oh one two</alias>
  </lexeme>

  <lexeme>
    <grapheme>015</grapheme>
    <alias>oh one five</alias>
  </lexeme>

  <!-- ============ MENU ITEMS (explicit English pronunciation) ============ -->
  <lexeme>
    <grapheme>Original Single</grapheme>
    <alias>Original Single</alias>
  </lexeme>

  <lexeme>
    <grapheme>Original Double</grapheme>
    <alias>Original Double</alias>
  </lexeme>

  <lexeme>
    <grapheme>Atomic Single</grapheme>
    <alias>Atomic Single</alias>
  </lexeme>

  <lexeme>
    <grapheme>Atomic Double</grapheme>
    <alias>Atomic Double</alias>
  </lexeme>

  <lexeme>
    <grapheme>The Truffle Single</grapheme>
    <alias>The Truffle Single</alias>
  </lexeme>

  <lexeme>
    <grapheme>The Truffle Double</grapheme>
    <alias>The Truffle Double</alias>
  </lexeme>

  <lexeme>
    <grapheme>J-Bomb Single</grapheme>
    <alias>jay bomb Single</alias>
  </lexeme>

  <lexeme>
    <grapheme>J-Bomb Double</grapheme>
    <alias>jay bomb Double</alias>
  </lexeme>

  <lexeme>
    <grapheme>American Single</grapheme>
    <alias>American Single</alias>
  </lexeme>

  <lexeme>
    <grapheme>American Double</grapheme>
    <alias>American Double</alias>
  </lexeme>

  <lexeme>
    <grapheme>CHKN BRGR</grapheme>
    <alias>chicken B R G R</alias>
  </lexeme>

  <lexeme>
    <grapheme>Buffalo CHKN</grapheme>
    <alias>Buffalo chicken</alias>
  </lexeme>

  <lexeme>
    <grapheme>CHKN American</grapheme>
    <alias>chicken American</alias>
  </lexeme>

  <lexeme>
    <grapheme>GRLD CHKN Ranch</grapheme>
    <alias>grilled chicken Ranch</alias>
  </lexeme>

  <lexeme>
    <grapheme>GRLD CHKN Sriracha</grapheme>
    <alias>grilled chicken Sriracha</alias>
  </lexeme>

  <lexeme>
    <grapheme>Cheese BRGR Single</grapheme>
    <alias>Cheese B R G R Single</alias>
  </lexeme>

  <lexeme>
    <grapheme>Cheese BRGR Double</grapheme>
    <alias>Cheese B R G R Double</alias>
  </lexeme>

  <lexeme>
    <grapheme>BRGR Fries</grapheme>
    <alias>B R G R Fries</alias>
  </lexeme>

  <lexeme>
    <grapheme>BRGR House Salad</grapheme>
    <alias>B R G R House Salad</alias>
  </lexeme>

  <lexeme>
    <grapheme>BRGR Sauce</grapheme>
    <alias>B R G R Sauce</alias>
  </lexeme>

  <lexeme>
    <grapheme>Cheese Prez</grapheme>
    <alias>Cheese Prez</alias>
  </lexeme>

  <lexeme>
    <grapheme>Original Prez</grapheme>
    <alias>Original Prez</alias>
  </lexeme>

  <lexeme>
    <grapheme>Martins Hotdog</grapheme>
    <alias>Martin's Hot Dog</alias>
  </lexeme>

  <lexeme>
    <grapheme>The Cheese-Dog</grapheme>
    <alias>The Cheese Dog</alias>
  </lexeme>

  <lexeme>
    <grapheme>CHKN Bites</grapheme>
    <alias>chicken Bites</alias>
  </lexeme>

  <lexeme>
    <grapheme>Buffalo Bites</grapheme>
    <alias>Buffalo Bites</alias>
  </lexeme>

  <lexeme>
    <grapheme>Onion Rings</grapheme>
    <alias>Onion Rings</alias>
  </lexeme>

  <lexeme>
    <grapheme>Regular Fries</grapheme>
    <alias>Regular Fries</alias>
  </lexeme>

  <lexeme>
    <grapheme>Cheese Fries</grapheme>
    <alias>Cheese Fries</alias>
  </lexeme>

  <lexeme>
    <grapheme>Curly Fries</grapheme>
    <alias>Curly Fries</alias>
  </lexeme>

  <lexeme>
    <grapheme>Truffle Fries</grapheme>
    <alias>Truffle Fries</alias>
  </lexeme>

  <lexeme>
    <grapheme>Queen's Salad</grapheme>
    <alias>Queen's Salad</alias>
  </lexeme>

  <lexeme>
    <grapheme>Moroccan Salad</grapheme>
    <alias>Moroccan Salad</alias>
  </lexeme>

  <lexeme>
    <grapheme>Mini Pancakes Nutella</grapheme>
    <alias>Mini Pancakes Nutella</alias>
  </lexeme>

  <lexeme>
    <grapheme>Mini Pancakes Lotus</grapheme>
    <alias>Mini Pancakes Lotus</alias>
  </lexeme>

  <lexeme>
    <grapheme>Mini Pancakes Maple</grapheme>
    <alias>Mini Pancakes Maple</alias>
  </lexeme>

  <lexeme>
    <grapheme>Mini Pancakes Mix</grapheme>
    <alias>Mini Pancakes Mix</alias>
  </lexeme>

  <lexeme>
    <grapheme>Local Alternative Chocolate Mini Pancakes</grapheme>
    <alias>Local Alternative Chocolate Mini Pancakes</alias>
  </lexeme>

  <lexeme>
    <grapheme>CinnaBomb Mini Pancakes</grapheme>
    <alias>cinna bomb Mini Pancakes</alias>
  </lexeme>

  <lexeme>
    <grapheme>Strawberry Swirl Mini Pancakes</grapheme>
    <alias>Strawberry Swirl Mini Pancakes</alias>
  </lexeme>

  <lexeme>
    <grapheme>Salted Caramel &amp; Cream Mini Pancakes</grapheme>
    <alias>Salted Caramel and Cream Mini Pancakes</alias>
  </lexeme>

  <lexeme>
    <grapheme>Pistachio and Cream Pancakes</grapheme>
    <alias>Pistachio and Cream Pancakes</alias>
  </lexeme>

  <lexeme>
    <grapheme>Konafa Pancakes Lotus</grapheme>
    <alias>Konafa Pancakes Lotus</alias>
  </lexeme>

  <lexeme>
    <grapheme>Konafa Pancakes Â Lotus</grapheme>
    <alias>Konafa Pancakes Lotus</alias>
  </lexeme>

  <lexeme>
    <grapheme>Konafa Pancakes Nutella</grapheme>
    <alias>Konafa Pancakes Nutella</alias>
  </lexeme>

  <lexeme>
    <grapheme>Konafa Pancakes Pistachio</grapheme>
    <alias>Konafa Pancakes Pistachio</alias>
  </lexeme>

  <lexeme>
    <grapheme>Ice Cream Chocolate</grapheme>
    <alias>Ice Cream Chocolate</alias>
  </lexeme>

  <lexeme>
    <grapheme>Ice Cream Caramel</grapheme>
    <alias>Ice Cream Caramel</alias>
  </lexeme>

  <lexeme>
    <grapheme>Ice Cream Oreo</grapheme>
    <alias>Ice Cream Oreo</alias>
  </lexeme>

  <lexeme>
    <grapheme>Ice Cream Lotus</grapheme>
    <alias>Ice Cream Lotus</alias>
  </lexeme>

  <lexeme>
    <grapheme>Ice Cream Vanilla</grapheme>
    <alias>Ice Cream Vanilla</alias>
  </lexeme>

  <lexeme>
    <grapheme>Raspberry Vanilla</grapheme>
    <alias>Raspberry Vanilla</alias>
  </lexeme>

  <lexeme>
    <grapheme>Chocolate Fudge</grapheme>
    <alias>Chocolate Fudge</alias>
  </lexeme>

  <lexeme>
    <grapheme>Caramelized Almonds</grapheme>
    <alias>Caramelized Almonds</alias>
  </lexeme>

  <lexeme>
    <grapheme>Vanilla Cone</grapheme>
    <alias>Vanilla Cone</alias>
  </lexeme>

  <lexeme>
    <grapheme>Ice Cream Strawberry</grapheme>
    <alias>Ice Cream Strawberry</alias>
  </lexeme>

  <lexeme>
    <grapheme>ice Cream Salted Caramel</grapheme>
    <alias>Ice Cream Salted Caramel</alias>
  </lexeme>

  <lexeme>
    <grapheme>Ice Cream Pistachio</grapheme>
    <alias>Ice Cream Pistachio</alias>
  </lexeme>

  <lexeme>
    <grapheme>Soft Serve Cone</grapheme>
    <alias>Soft Serve Cone</alias>
  </lexeme>

  <lexeme>
    <grapheme>Konafa Sundae Mango</grapheme>
    <alias>Konafa Sundae Mango</alias>
  </lexeme>

  <lexeme>
    <grapheme>Konafa Sundae Salted Caramel</grapheme>
    <alias>Konafa Sundae Salted Caramel</alias>
  </lexeme>

  <lexeme>
    <grapheme>Konafa Sundae Lotus</grapheme>
    <alias>Konafa Sundae Lotus</alias>
  </lexeme>

  <lexeme>
    <grapheme>Konafa Sundae Nutella</grapheme>
    <alias>Konafa Sundae Nutella</alias>
  </lexeme>

  <lexeme>
    <grapheme>Konafa Sundae Â Nutella</grapheme>
    <alias>Konafa Sundae Nutella</alias>
  </lexeme>

  <lexeme>
    <grapheme>Konafa Sundae Pistachio</grapheme>
    <alias>Konafa Sundae Pistachio</alias>
  </lexeme>

  <lexeme>
    <grapheme>Vanilla Shake</grapheme>
    <alias>Vanilla Shake</alias>
  </lexeme>

  <lexeme>
    <grapheme>Chocolate Shake</grapheme>
    <alias>Chocolate Shake</alias>
  </lexeme>

  <lexeme>
    <grapheme>Lotus Shake</grapheme>
    <alias>Lotus Shake</alias>
  </lexeme>

  <lexeme>
    <grapheme>Oreo Shake</grapheme>
    <alias>Oreo Shake</alias>
  </lexeme>

  <lexeme>
    <grapheme>Strawberry Shake</grapheme>
    <alias>Strawberry Shake</alias>
  </lexeme>

  <lexeme>
    <grapheme>Caramel Shake</grapheme>
    <alias>Caramel Shake</alias>
  </lexeme>

  <lexeme>
    <grapheme>Pistachio Shake</grapheme>
    <alias>Pistachio Shake</alias>
  </lexeme>

  <lexeme>
    <grapheme>Nutella Shake</grapheme>
    <alias>Nutella Shake</alias>
  </lexeme>

  <lexeme>
    <grapheme>Salted Caramel Shake</grapheme>
    <alias>Salted Caramel Shake</alias>
  </lexeme>

  <lexeme>
    <grapheme>Konafa Milkshake Mango</grapheme>
    <alias>Konafa Milkshake Mango</alias>
  </lexeme>

  <lexeme>
    <grapheme>Konafa Milkshake Salted Caramel</grapheme>
    <alias>Konafa Milkshake Salted Caramel</alias>
  </lexeme>

  <lexeme>
    <grapheme>Konafa Milkshake lotus</grapheme>
    <alias>Konafa Milkshake Lotus</alias>
  </lexeme>

  <lexeme>
    <grapheme>Konafa Milkshake Nutella</grapheme>
    <alias>Konafa Milkshake Nutella</alias>
  </lexeme>

  <lexeme>
    <grapheme>Konafa Milkshake Â Nutella</grapheme>
    <alias>Konafa Milkshake Nutella</alias>
  </lexeme>

  <lexeme>
    <grapheme>Konafa Milkshake Pistachio</grapheme>
    <alias>Konafa Milkshake Pistachio</alias>
  </lexeme>

  <!-- ============ ADD-ONS AND SAUCES ============ -->
  <lexeme>
    <grapheme>Caramel</grapheme>
    <alias>Caramel</alias>
  </lexeme>

  <lexeme>
    <grapheme>Hazelnut</grapheme>
    <alias>Hazelnut</alias>
  </lexeme>

  <lexeme>
    <grapheme>Ketchup</grapheme>
    <alias>Ketchup</alias>
  </lexeme>

  <lexeme>
    <grapheme>Lettuce</grapheme>
    <alias>Lettuce</alias>
  </lexeme>

  <lexeme>
    <grapheme>Milk</grapheme>
    <alias>Milk</alias>
  </lexeme>

  <lexeme>
    <grapheme>Onions</grapheme>
    <alias>Onions</alias>
  </lexeme>

  <lexeme>
    <grapheme>Pickles</grapheme>
    <alias>Pickles</alias>
  </lexeme>

  <lexeme>
    <grapheme>Tomatoes</grapheme>
    <alias>Tomatoes</alias>
  </lexeme>

  <lexeme>
    <grapheme>Vanilla</grapheme>
    <alias>Vanilla</alias>
  </lexeme>

  <lexeme>
    <grapheme>Slice Cheese</grapheme>
    <alias>Slice Cheese</alias>
  </lexeme>

  <lexeme>
    <grapheme>Patty Burger</grapheme>
    <alias>Patty Burger</alias>
  </lexeme>

  <lexeme>
    <grapheme>Cheese Sauce</grapheme>
    <alias>Cheese Sauce</alias>
  </lexeme>

  <lexeme>
    <grapheme>BRGR House Sauce</grapheme>
    <alias>B R G R House Sauce</alias>
  </lexeme>

  <lexeme>
    <grapheme>Moroccan Sauce</grapheme>
    <alias>Moroccan Sauce</alias>
  </lexeme>

  <lexeme>
    <grapheme>The Queen's Sauce</grapheme>
    <alias>The Queen's Sauce</alias>
  </lexeme>

  <lexeme>
    <grapheme>Hazelnut Flavor</grapheme>
    <alias>Hazelnut Flavor</alias>
  </lexeme>

  <lexeme>
    <grapheme>Extra BRGR Sauce</grapheme>
    <alias>Extra B R G R Sauce</alias>
  </lexeme>

  <lexeme>
    <grapheme>Extra Tangy BBQ</grapheme>
    <alias>Extra Tangy Barbecue</alias>
  </lexeme>

  <lexeme>
    <grapheme>Extra Buffalo Sauce</grapheme>
    <alias>Extra Buffalo Sauce</alias>
  </lexeme>

  <lexeme>
    <grapheme>Extra Ranch</grapheme>
    <alias>Extra Ranch</alias>
  </lexeme>

  <lexeme>
    <grapheme>Dairy Milk</grapheme>
    <alias>Dairy Milk</alias>
  </lexeme>

  <lexeme>
    <grapheme>Sriracha Mayo</grapheme>
    <alias>Sriracha Mayo</alias>
  </lexeme>

  <lexeme>
    <grapheme>Buttermilk Herb Mayo</grapheme>
    <alias>Buttermilk Herb Mayo</alias>
  </lexeme>

  <lexeme>
    <grapheme>Cali Sauce</grapheme>
    <alias>Cali Sauce</alias>
  </lexeme>

  <lexeme>
    <grapheme>Ranch Sauce</grapheme>
    <alias>Ranch Sauce</alias>
  </lexeme>

  <lexeme>
    <grapheme>BRGR House Dressing</grapheme>
    <alias>B R G R House Dressing</alias>
  </lexeme>

  <lexeme>
    <grapheme>Moroccan Dressing</grapheme>
    <alias>Moroccan Dressing</alias>
  </lexeme>

  <lexeme>
    <grapheme>The Queen's Dressing</grapheme>
    <alias>The Queen's Dressing</alias>
  </lexeme>

  <lexeme>
    <grapheme>Honey Mustard</grapheme>
    <alias>Honey Mustard</alias>
  </lexeme>

  <lexeme>
    <grapheme>Buffalo Sauce</grapheme>
    <alias>Buffalo Sauce</alias>
  </lexeme>

  <lexeme>
    <grapheme>BBQ Sauce</grapheme>
    <alias>Barbecue Sauce</alias>
  </lexeme>

  <lexeme>
    <grapheme>Meat &amp; Bun</grapheme>
    <alias>Meat and Bun</alias>
  </lexeme>

  <lexeme>
    <grapheme>CHKN &amp; Bun</grapheme>
    <alias>Chicken and Bun</alias>
  </lexeme>

  <lexeme>
    <grapheme>Only Cheese</grapheme>
    <alias>Only Cheese</alias>
  </lexeme>

  <lexeme>
    <grapheme>Sauce Outside</grapheme>
    <alias>Sauce Outside</alias>
  </lexeme>

  <lexeme>
    <grapheme>Wrap (Wrapping with Lettuce)</grapheme>
    <alias>Wrap with Lettuce</alias>
  </lexeme>

  <lexeme>
    <grapheme>Sauce inside</grapheme>
    <alias>Sauce Inside</alias>
  </lexeme>

  <lexeme>
    <grapheme>Add Ketchup</grapheme>
    <alias>Add Ketchup</alias>
  </lexeme>

  <lexeme>
    <grapheme>Non-Dairy Milk</grapheme>
    <alias>Non Dairy Milk</alias>
  </lexeme>

  <lexeme>
    <grapheme>Emmental Cheese</grapheme>
    <alias>Emmental Cheese</alias>
  </lexeme>

  <lexeme>
    <grapheme>Extra Roasted Mushroom</grapheme>
    <alias>Extra Roasted Mushroom</alias>
  </lexeme>

  <lexeme>
    <grapheme>Extra Atomic Sauce</grapheme>
    <alias>Extra Atomic Sauce</alias>
  </lexeme>

  <lexeme>
    <grapheme>Extra Onion Rings</grapheme>
    <alias>Extra Onion Rings</alias>
  </lexeme>

  <lexeme>
    <grapheme>Extra maple syrup</grapheme>
    <alias>Extra Maple Syrup</alias>
  </lexeme>

  <lexeme>
    <grapheme>Free Honey Mustard</grapheme>
    <alias>Honey Mustard</alias>
  </lexeme>

</lexicon>
