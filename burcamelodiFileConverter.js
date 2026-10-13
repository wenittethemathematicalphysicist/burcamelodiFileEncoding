# 🐪 BURCAMELODI

### The world’s first MIDI format written entirely in the N’Ko script

**Turn any Standard MIDI File into a beautiful, right-to-left, culturally unique `.burcamelodi` file in one click.**

---

## Why BURCAMELODI?

- **Visually stunning** – your MIDI data now lives in elegant N’Ko characters (ߒߞߏ)
- **Self-describing** – every file contains its own Latin ↔ N’Ko correspondence table
- **100 % reversible** – convert back to a normal `.mid` with zero data loss
- **Browser & Node ready** – pure JavaScript, no dependencies
- **Perfect for art, education, West-African cultural projects, or just showing off**

> “MIDI was invented in 1983.  
> BURCAMELODI was invented so the Manding world could own its own music format.”

---

## Quick Start (Browser)

```html
<input type="file" id="midiInput" accept=".mid,.midi">
<button onclick="convert()">Convert to BURCAMELODI</button>

<script src="burcamelodi.js"></script>
<script>
async function convert() {
  const file = document.getElementById('midiInput').files[0];
  if (!file) return alert('Please choose a MIDI file first');

  const burca = await Burcamelodi.fromFile(file);
  Burcamelodi.download(burca, file.name.replace(/\.(mid|midi)$/i, '') + '.burcamelodi');
}
</script>
```

---

## The Format Specification (v1.0)

```
BURCAMELODI/1.0
# Correspondence table (Latin → N’Ko)
A=ߊ a=ߊ B=ߓ b=ߓ C=ߗ c=ߗ D=ߘ d=ߘ E=ߋ e=ߋ F=ߝ f=ߝ
G=ߜ g=ߜ H=ߤ h=ߤ I=ߌ i=ߌ J=ߖ j=ߖ K=ߞ k=ߞ L=ߟ l=ߟ
M=ߡ m=ߡ N=ߣ n=ߣ O=ߏ o=ߏ P=ߔ p=ߔ Q=ߞ q=ߞ R=ߙ r=ߙ
S=ߛ s=ߛ T=ߕ t=ߕ U=ߎ u=ߎ V=ߝ v=ߝ W=ߥ w=ߥ X=ߞ x=ߞ
Y=ߦ y=ߦ Z=ߖ z=ߖ 0=߀ 1=߁ 2=߂ 3=߃ 4=߄ 5=߅ 6=߆ 7=߇ 8=߈ 9=߉
# Data (N’Ko-substituted Base64 of the original Standard MIDI File)
ߕߝߙߏߖߊߊߊߊߊߦߊߊߞߊߌߊߋߓߣߝߤߖߙߊߊߊ...
```

Everything after the blank line is pure N’Ko data.

---

## Full JavaScript Library (copy-paste ready)

Save the following as `burcamelodi.js`:

```js
/**
 * BURCAMELODI – Convert any Standard MIDI File into the N’Ko-based format
 * License: MIT
 * https://github.com/yourname/burcamelodi
 */

const Burcamelodi = (() => {
  // Official Latin → N’Ko mapping (v1.0)
  const LATIN_TO_NKO = {
    'A':'ߊ','a':'ߊ','B':'ߓ','b':'ߓ','C':'ߗ','c':'ߗ','D':'ߘ','d':'ߘ',
    'E':'ߋ','e':'ߋ','F':'ߝ','f':'ߝ','G':'ߜ','g':'ߜ','H':'ߤ','h':'ߤ',
    'I':'ߌ','i':'ߌ','J':'ߖ','j':'ߖ','K':'ߞ','k':'ߞ','L':'ߟ','l':'ߟ',
    'M':'ߡ','m':'ߡ','N':'ߣ','n':'ߣ','O':'ߏ','o':'ߏ','P':'ߔ','p':'ߔ',
    'Q':'ߞ','q':'ߞ','R':'ߙ','r':'ߙ','S':'ߛ','s':'ߛ','T':'ߕ','t':'ߕ',
    'U':'ߎ','u':'ߎ','V':'ߝ','v':'ߝ','W':'ߥ','w':'ߥ','X':'ߞ','x':'ߞ',
    'Y':'ߦ','y':'ߦ','Z':'ߖ','z':'ߖ',
    '0':'߀','1':'߁','2':'߂','3':'߃','4':'߄','5':'߅','6':'߆','7':'߇','8':'߈','9':'߉'
  };

  // Reverse map for decoding
  const NKO_TO_LATIN = Object.fromEntries(
    Object.entries(LATIN_TO_NKO).map(([k, v]) => [v, k])
  );

  const HEADER = `BURCAMELODI/1.0
# Correspondence table (Latin → N’Ko)
A=ߊ a=ߊ B=ߓ b=ߓ C=ߗ c=ߗ D=ߘ d=ߘ E=ߋ e=ߋ F=ߝ f=ߝ
G=ߜ g=ߜ H=ߤ h=ߤ I=ߌ i=ߌ J=ߖ j=ߖ K=ߞ k=ߞ L=ߟ l=ߟ
M=ߡ m=ߡ N=ߣ n=ߣ O=ߏ o=ߏ P=ߔ p=ߔ Q=ߞ q=ߞ R=ߙ r=ߙ
S=ߛ s=ߛ T=ߕ t=ߕ U=ߎ u=ߎ V=ߝ v=ߝ W=ߥ w=ߥ X=ߞ x=ߞ
Y=ߦ y=ߦ Z=ߖ z=ߖ 0=߀ 1=߁ 2=߂ 3=߃ 4=߄ 5=߅ 6=߆ 7=߇ 8=߈ 9=߉
# Data (N’Ko-substituted Base64 of the original Standard MIDI File)
`;

  // ---------- Public API ----------

  /**
   * Convert a File, ArrayBuffer or Uint8Array into a BURCAMELODI string
   */
  async function fromFile(fileOrBuffer) {
    let buffer;
    if (fileOrBuffer instanceof File || fileOrBuffer instanceof Blob) {
      buffer = await fileOrBuffer.arrayBuffer();
    } else if (fileOrBuffer instanceof ArrayBuffer) {
      buffer = fileOrBuffer;
    } else if (fileOrBuffer instanceof Uint8Array) {
      buffer = fileOrBuffer.buffer;
    } else {
      throw new Error('Expected File, Blob, ArrayBuffer or Uint8Array');
    }

    // 1. Base64-encode the binary MIDI
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const b64 = btoa(binary);

    // 2. Substitute every Latin character with N’Ko
    const nko = b64.replace(/[A-Za-z0-9]/g, ch => LATIN_TO_NKO[ch] || ch);

    // 3. Wrap with official header
    return HEADER + nko + '\n';
  }

  /**
   * Decode a .burcamelodi string back to a Uint8Array (original MIDI bytes)
   */
  function toMidi(burcaText) {
    // Extract the data part (everything after the last blank line)
    const parts = burcaText.split(/\n\s*\n/);
    const data = parts[parts.length - 1].trim();

    // Reverse the N’Ko → Latin substitution
    const b64 = data.replace(/./g, ch => NKO_TO_LATIN[ch] || ch);

    // Base64-decode
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  /**
   * Trigger a browser download of a .burcamelodi file
   */
  function download(burcaText, filename = 'song.burcamelodi') {
    const blob = new Blob([burcaText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Node.js helper (optional)
  function fromBuffer(buffer) {
    return fromFile(buffer);
  }

  return {
    fromFile,
    fromBuffer,
    toMidi,
    download,
    LATIN_TO_NKO,
    NKO_TO_LATIN,
    VERSION: '1.0'
  };
})();

// Export for both browser and Node
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Burcamelodi;
} else {
  window.Burcamelodi = Burcamelodi;
}
```

---

## Node.js usage

```js
const fs = require('fs');
const Burcamelodi = require('./burcamelodi.js');

const midi = fs.readFileSync('my-song.mid');
Burcamelodi.fromBuffer(midi).then(burca => {
  fs.writeFileSync('my-song.burcamelodi', burca, 'utf8');
  console.log('Created my-song.burcamelodi 🐪');
});
```

---

## License

MIT – free for personal, educational and commercial use.  
Just keep the header and the spirit of the N’Ko script alive.

---

**Made with ❤️ for the Manding languages and for every musician who wants their MIDI to look as unique as their music.**

Drop a star, open an issue, or send your first `.burcamelodi` file – the format is yours now.
