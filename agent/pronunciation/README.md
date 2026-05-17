# BRGR Voice Agent — Pronunciation Dictionaries

Two PLS (Pronunciation Lexicon Specification) files for the ElevenLabs agent:

| File | Locale | Purpose |
|---|---|---|
| `brgr-pronunciation-en.pls` | `en-US` | Expands brand abbreviations (BRGR→burger, CHKN→chicken, GRLD→grilled), fixes commonly-mispronounced food terms (Konafa, Sriracha, Jalapeño, Nutella, Pistachio), and forces digit-by-digit reads of Egyptian phone prefixes. |
| `brgr-pronunciation-ar.pls` | `ar-EG` | Transliterates Latin-script menu names into Egyptian Arabic so the agent renders "Atomic Double" as "أتوميك دابل" and "EGP" as "جنيه" with correct cadence. |

## Format

W3C PLS 1.0 with `alphabet="ipa"`. Each entry uses one of:

- `<alias>` — text substitution applied before TTS. Most reliable; preferred for abbreviations.
- `<phoneme>` — IPA phoneme string. Used for proper nouns and accented words. Supported by Eleven Multilingual v2, Eleven v3, and Turbo v2.5.

## Upload

### Dashboard
1. Open `https://elevenlabs.io/app/voice-lab/pronunciation-dictionaries`
2. **New** → upload each `.pls` file
3. Open the BRGR agent → **Voice settings** → attach both dictionaries
4. Save

### API
```bash
curl -X POST "https://api.elevenlabs.io/v1/pronunciation-dictionaries/add-from-file" \
  -H "xi-api-key: $ELEVENLABS_API_KEY" \
  -F "name=BRGR English" \
  -F "file=@brgr-pronunciation-en.pls"

curl -X POST "https://api.elevenlabs.io/v1/pronunciation-dictionaries/add-from-file" \
  -H "xi-api-key: $ELEVENLABS_API_KEY" \
  -F "name=BRGR Egyptian Arabic" \
  -F "file=@brgr-pronunciation-ar.pls"
```

Each call returns a `pronunciation_dictionary_id` + `version_id`. Reference them in the agent config under `pronunciation_dictionary_locators` and re-push with `elevenlabs agents push`.

## Updating entries

PLS files are versioned in ElevenLabs. After editing:

```bash
curl -X POST "https://api.elevenlabs.io/v1/pronunciation-dictionaries/$DICT_ID/add-from-file" \
  -H "xi-api-key: $ELEVENLABS_API_KEY" \
  -F "file=@brgr-pronunciation-en.pls"
```

The endpoint returns a new `version_id` — update the locator in the agent config to use it.

## Testing

In the ElevenLabs playground, paste a sample like:

```
Hey! Want me to add the Atomic Double for 310 EGP? It's our spicy CHKN-free hero.
```

Without the dictionary, you'll hear "B-R-G-R" spelled letter-by-letter and "C-H-K-N" mangled. With it, you'll hear *burger* and *chicken*.
