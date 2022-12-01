const USER_KEY = '__USER__';
const WELCOME_DURATION = 10 * 1000;

function showNotification() {
  const n = new Notification('感谢访问李金珂的小屋', {
    image: '/images/my.jpeg',
    icon: '/images/my.jpeg',
    body: '要想学仙术, 哪能不吃苦',
  });

  n.onshow = () => {
    setTimeout(n.close.bind(n), 5000);
  };

  n.onclose = () => {
    console.log('Notification close');
  };
}

function isNewUser() {
  return !localStorage.getItem(USER_KEY);
}

function saveUser() {
  localStorage.setItem(USER_KEY, true);
}

function showWelcomePage() {
  const HTML = `
  <div class="loading-content">
    <svg>
      <path
        d="M50 50
            L50 50
            A15 2 0 1 0 110 30
            L105 100
            v -50
            L 70 85
            L141 70
            L104 120
            v 100
            A 1 2 0 0 1 69 204
            L31 167
            L196 127"
      ></path>
      <path
        d="M300 50
        L 210 136
        M257 89
        L 370 126
        M 245 155
        h 70
        M 245 175
        h 70
        M 275 155
        v 90
        M 257 232
        L 228 213
        M 320 200
        l 50 -30
        M 205 245
        h 160"
      ></path>
      <path
        d="M380 50
        h 90
        h -45
        v 70
        h -50
        h 100
        h -50
        v 80
        L 280 263
        L 532 157
        A 4 3 0 0 1 666 56
        L 580 130
        v 30
        h 30
        v -25
        h -30
        h 30
        v 150
        L 545 222"
      ></path>
    </svg>
  </div>
  `;

  const node = document.createElement('div');
  node.classList = 'loading';
  node.innerHTML = HTML;
  document.body.appendChild(node);

  setTimeout(() => {
    node.remove();
  }, WELCOME_DURATION);
}

function switchDark() {
  const time = document.querySelector('#time');
  DarkReader?.auto({
    brightness: 100,
    contrast: 90,
    sepia: 10,
  });
  time.addEventListener('change', (e) => {
    if (e.target.checked) {
      DarkReader?.enable({
        brightness: 100,
        contrast: 90,
        sepia: 10,
      });
    } else {
      DarkReader?.disable();
    }
  });
}

window.onload = () => {
  Notification.requestPermission(() => {
    if (isNewUser()) {
      showNotification();
      saveUser();
    }
  });
  if (isNewUser()) {
    showWelcomePage();
    saveUser();
  }
};
