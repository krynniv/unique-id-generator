document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('keyForm');
  const modal = document.getElementById('cipherModal');
  const cipherText = document.getElementById('cipherText');
  const closeBtn = document.getElementById('closeModal');

  // A sample 256-word list for demonstration (replace with a full Diceware list for max security)
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
    'onyx','pyre','quark','rift','spire','talon','ursa','vortex','willow','xenith','yarn','zenith',
    // ...add up to 256+ words
  ];

  // Replace spaces with hyphens and force lowercase
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

const passphrase = hashToPassphrase(cipherKey, 20, 6); 

      cipherText.innerHTML = `<h4>Your Generated Identity</h4>
        <p style="word-break: break-word; font-family: monospace;">${passphrase}</p>
        <button id="copyBtn" class="copy-btn">Copy</button>`;

      // Copy button
      document.getElementById('copyBtn').addEventListener('click', () => {
        navigator.clipboard.writeText(passphrase).then(() => {
          document.getElementById('copyBtn').textContent = 'Copied!';
          setTimeout(() => (document.getElementById('copyBtn').textContent = 'Copy'), 1500);
        });
      });
    });

    // Edit button
    document.getElementById('editBtn').addEventListener('click', () => modal.style.display = 'none');
  });

  closeBtn.addEventListener('click', () => modal.style.display = 'none');

  window.addEventListener('click', e => {
    if (e.target === modal) modal.style.display = 'none';
  });

  // ---- Convert SHA-256 hash to passphrase ----
function hashToPassphrase(hash, wordCount = 20, wordLength = 6) {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+='; // NO hyphen here
  const allChars = letters + letters.toUpperCase() + numbers + symbols;

  const words = [];
  let index = 0;

  function nextByte() {
    const byte = parseInt(hash.substr(index, 2), 16);
    index += 2;
    if (index >= hash.length) index = 0;
    return byte;
  }

  for (let i = 0; i < wordCount; i++) {
    let word = '';
    for (let j = 0; j < wordLength; j++) {
      word += allChars[nextByte() % allChars.length];
    }
    words.push(word);
  }

  return words.join('-'); // clean, single separator
}


});
