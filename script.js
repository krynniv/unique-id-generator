document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('keyForm');
  const modal = document.getElementById('cipherModal');
  const cipherText = document.getElementById('cipherText');
  const closeBtn = document.getElementById('closeModal');

  // Example wordlist (replace/add to reach your full list)
  const wordlist = [
    'apple','banana','cherry','delta','echo','foxtrot','golf','hotel','india','juliet',
    'kilo','lima','mango','nectar','orange','papa','quartz','romeo','sierra','tango',
    'uniform','victor','whiskey','xray','yankee','zulu','alpha','bravo','charlie','dragon',
    'eagle','falcon','giant','harbor','island','jungle','king','lion','mountain','nova',
    'omega','python','queen','river','sun','tiger','umbrella','violet','wolf','xerox',
    'yellow','zephyr','acorn','butter','cactus','dawn','ember','frost','glacier','hazel',
    'iris','jade','koala','lunar','myth','nebula','opal','pearl','quiver','ruby','stone',
    'topaz','umber','vio','wisp','xenon','yeti','zeal','azure','blaze','crest','dune',
    'ember','flint','gale','horizon','ivory','javelin','krypton','lynx','mimic','nova',
    'onyx','pyre','quark','rift','spire','talon','ursa','vortex','willow','xenith','yarn','zenith'
  ];

  // Force lowercase and replace spaces
  form.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], input[type="tel"]')
    .forEach(input => {
      input.addEventListener('input', () => {
        input.value = input.value.toLowerCase().replace(/\s+/g, '-');
      });
    });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const formData = new FormData(form);
    const dataObj = {};
    for (const [key, value] of formData.entries()) dataObj[key] = value.toLowerCase();

    cipherText.innerHTML = `<h4>Please confirm your information:</h4>
      <ul>
        ${Object.entries(dataObj).map(([k,v]) => `<li><strong>${k.replace('_',' ')}:</strong> ${v}</li>`).join('')}
      </ul>
      <button id="confirmBtn">Confirm</button>
      <button id="editBtn">Edit</button>`;
    modal.style.display = 'block';

    document.getElementById('confirmBtn').addEventListener('click', () => {
      let combined = '';
      for (const value of Object.values(dataObj)) combined += value + '|';

      const cipherKey = CryptoJS.SHA256(combined).toString(CryptoJS.enc.Hex);

      const passphrase = hashToPassphrase(cipherKey, 50); // 50 phrases

      cipherText.innerHTML = `<h4>Your Generated Identity</h4>
        <p style="word-break: break-word; font-family: monospace;">${passphrase}</p>
        <button id="copyBtn" class="copy-btn">Copy</button>`;

      document.getElementById('copyBtn').addEventListener('click', () => {
        navigator.clipboard.writeText(passphrase).then(() => {
          document.getElementById('copyBtn').textContent = 'Copied!';
          setTimeout(() => (document.getElementById('copyBtn').textContent = 'Copy'), 1500);
        });
      });
    });

    document.getElementById('editBtn').addEventListener('click', () => modal.style.display = 'none');
  });

  closeBtn.addEventListener('click', () => modal.style.display = 'none');
  window.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });

  // ---- Convert SHA-256 hash to passphrase with 50 elements (words + chars + symbols) ----
  function hashToPassphrase(hash, elementCount = 50) {
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+=';
    const allChars = letters + letters.toUpperCase() + numbers + symbols;

    let index = 0;
    function nextByte() {
      const byte = parseInt(hash.substr(index, 2), 16);
      index += 2;
      if (index >= hash.length) index = 0;
      return byte;
    }

    const result = [];
    for (let i = 0; i < elementCount; i++) {
      const useWord = nextByte() % 2 === 0; // 50% chance to use a word
      if (useWord) {
        const word = wordlist[nextByte() % wordlist.length];
        // optionally insert a number or symbol inside word
        const inject = nextByte() % 2 === 0;
        if (inject) {
          const char = allChars[nextByte() % allChars.length];
          const pos = nextByte() % (word.length + 1);
          result.push(word.slice(0, pos) + char + word.slice(pos));
        } else {
          result.push(word);
        }
      } else {
        // random 3-6 character fragment
        const len = 3 + (nextByte() % 4); // 3-6 chars
        let fragment = '';
        for (let j = 0; j < len; j++) fragment += allChars[nextByte() % allChars.length];
        result.push(fragment);
      }
    }

    return result.join('-'); // hyphen-separated
  }
});
