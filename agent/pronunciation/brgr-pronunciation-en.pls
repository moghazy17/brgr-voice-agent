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

  <!-- ============ MENU ITEM CASING (preserve voice cadence) ============ -->
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

</lexicon>
