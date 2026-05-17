<?xml version="1.0" encoding="UTF-8"?>
<!--
  BRGR Voice Agent — Egyptian Arabic Pronunciation Lexicon
  Format: W3C Pronunciation Lexicon Specification (PLS) 1.0
  Compatible with ElevenLabs pronunciation dictionaries.

  Strategy:
    Per system prompt, item names ALWAYS stay in English when the agent
    speaks Arabic ("عايز Atomic Double"). This lexicon teaches the model
    how to pronounce Latin-script item names with an Egyptian-friendly
    cadence, plus handles common Egyptian-Arabic numerals/currency.
-->
<lexicon version="1.0"
         xmlns="http://www.w3.org/2005/01/pronunciation-lexicon"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://www.w3.org/2005/01/pronunciation-lexicon
                             http://www.w3.org/TR/2007/CR-pronunciation-lexicon-20071212/pls.xsd"
         alphabet="ipa"
         xml:lang="ar-EG">

  <!-- ============ BRAND ABBREVIATIONS → Arabic transliteration ============ -->
  <!-- BRGR is the brand name. Spell it letter-by-letter in English letter
       names (بي آر جي آر), NOT as the Arabic word for burger (برجر). -->

  <lexeme>
    <grapheme>CHKN</grapheme>
    <alias>تشيكن</alias>
  </lexeme>

  <lexeme>
    <grapheme>GRLD</grapheme>
    <alias>جريلد</alias>
  </lexeme>

  <lexeme>
    <grapheme>Prez</grapheme>
    <alias>بريز</alias>
  </lexeme>

  <lexeme>
    <grapheme>J-Bomb</grapheme>
    <alias>جاي بومب</alias>
  </lexeme>

  <lexeme>
    <grapheme>CinnaBomb</grapheme>
    <alias>سينابومب</alias>
  </lexeme>

  <!-- ============ CURRENCY ============ -->
  <lexeme>
    <grapheme>EGP</grapheme>
    <alias>جنيه</alias>
  </lexeme>

  <lexeme>
    <grapheme>L.E.</grapheme>
    <alias>جنيه</alias>
  </lexeme>

  <!-- ============ ENGLISH MENU TERMS IN ARABIC SPEECH ============ -->
  <!-- Helps the model render item names with Egyptian cadence -->
  <lexeme>
    <grapheme>Original Single</grapheme>
    <alias>أوريجينال سينجل</alias>
  </lexeme>

  <lexeme>
    <grapheme>Original Double</grapheme>
    <alias>أوريجينال دابل</alias>
  </lexeme>

  <lexeme>
    <grapheme>Atomic Single</grapheme>
    <alias>أتوميك سينجل</alias>
  </lexeme>

  <lexeme>
    <grapheme>Atomic Double</grapheme>
    <alias>أتوميك دابل</alias>
  </lexeme>

  <lexeme>
    <grapheme>Truffle Single</grapheme>
    <alias>ترافل سينجل</alias>
  </lexeme>

  <lexeme>
    <grapheme>Truffle Double</grapheme>
    <alias>ترافل دابل</alias>
  </lexeme>

  <lexeme>
    <grapheme>American Single</grapheme>
    <alias>أمريكان سينجل</alias>
  </lexeme>

  <lexeme>
    <grapheme>American Double</grapheme>
    <alias>أمريكان دابل</alias>
  </lexeme>

  <lexeme>
    <grapheme>Cheese BRGR Single</grapheme>
    <alias>تشيز بي آر جي آر سينجل</alias>
  </lexeme>

  <lexeme>
    <grapheme>Cheese BRGR Double</grapheme>
    <alias>تشيز بي آر جي آر دابل</alias>
  </lexeme>

  <lexeme>
    <grapheme>Buffalo CHKN</grapheme>
    <alias>بافلو تشيكن</alias>
  </lexeme>

  <lexeme>
    <grapheme>CHKN American</grapheme>
    <alias>تشيكن أمريكان</alias>
  </lexeme>

  <lexeme>
    <grapheme>CHKN Bites</grapheme>
    <alias>تشيكن بايتس</alias>
  </lexeme>

  <lexeme>
    <grapheme>Onion Rings</grapheme>
    <alias>أنيون رينجز</alias>
  </lexeme>

  <lexeme>
    <grapheme>Truffle Fries</grapheme>
    <alias>ترافل فرايز</alias>
  </lexeme>

  <lexeme>
    <grapheme>Curly Fries</grapheme>
    <alias>كيرلي فرايز</alias>
  </lexeme>

  <lexeme>
    <grapheme>Konafa</grapheme>
    <alias>كنافة</alias>
  </lexeme>

  <lexeme>
    <grapheme>Lotus</grapheme>
    <alias>لوتس</alias>
  </lexeme>

  <lexeme>
    <grapheme>Nutella</grapheme>
    <alias>نوتيلا</alias>
  </lexeme>

  <lexeme>
    <grapheme>Pistachio</grapheme>
    <alias>بيستاشيو</alias>
  </lexeme>

  <lexeme>
    <grapheme>Oreo</grapheme>
    <alias>أوريو</alias>
  </lexeme>

  <lexeme>
    <grapheme>Caramel</grapheme>
    <alias>كراميل</alias>
  </lexeme>

  <lexeme>
    <grapheme>Salted Caramel</grapheme>
    <alias>سولتد كراميل</alias>
  </lexeme>

  <lexeme>
    <grapheme>Vanilla</grapheme>
    <alias>فانيليا</alias>
  </lexeme>

  <lexeme>
    <grapheme>Chocolate</grapheme>
    <alias>شوكولاتة</alias>
  </lexeme>

  <lexeme>
    <grapheme>Strawberry</grapheme>
    <alias>فراولة</alias>
  </lexeme>

  <lexeme>
    <grapheme>Mango</grapheme>
    <alias>مانجو</alias>
  </lexeme>

  <lexeme>
    <grapheme>Sundae</grapheme>
    <alias>صَنداي</alias>
  </lexeme>

  <lexeme>
    <grapheme>Milkshake</grapheme>
    <alias>ميلك شيك</alias>
  </lexeme>

  <lexeme>
    <grapheme>Shake</grapheme>
    <alias>شيك</alias>
  </lexeme>

  <lexeme>
    <grapheme>Ranch</grapheme>
    <alias>رانش</alias>
  </lexeme>

  <lexeme>
    <grapheme>Sriracha</grapheme>
    <alias>سرايراتشا</alias>
  </lexeme>

  <lexeme>
    <grapheme>Jalapeno</grapheme>
    <alias>هالابينو</alias>
  </lexeme>

  <lexeme>
    <grapheme>BBQ</grapheme>
    <alias>باربكيو</alias>
  </lexeme>

  <lexeme>
    <grapheme>Patty</grapheme>
    <alias>باتي</alias>
  </lexeme>

  <lexeme>
    <grapheme>Cheese</grapheme>
    <alias>تشيز</alias>
  </lexeme>

  <lexeme>
    <grapheme>Sauce</grapheme>
    <alias>صوص</alias>
  </lexeme>

  <lexeme>
    <grapheme>Fries</grapheme>
    <alias>فرايز</alias>
  </lexeme>

  <lexeme>
    <grapheme>Hot Dog</grapheme>
    <alias>هوت دوج</alias>
  </lexeme>

  <lexeme>
    <grapheme>Cheese-Dog</grapheme>
    <alias>تشيز دوج</alias>
  </lexeme>

</lexicon>
