class Cursor {
  intervalId = null;
  element = null;

  /**
   * @param {HTMLElement} cursorElement
   */
  constructor(cursorElement) {
    this.cursorElement = cursorElement;
  }

  stop() {
    this.cursorElement.classList.add('hidden');
    clearInterval(this.intervalId);
  }

  start() {
    this.cursorElement.classList.remove('hidden');
    this.intervalId = setInterval(() => {
      this.cursorElement.classList.toggle('hidden');
    }, 500);
  }
}

class TerminalText {
  /**
   * @param {HTMLElement} textElement
   * @param {string} textElement
   * @param {number} typeSpeed
   */
  constructor(textElement, text, typeSpeed = 2, startCount = 0) {
    this.textElement = textElement;
    this.text = text;
    this.typeSpeed = typeSpeed;
    this.typeCount = startCount;

    if (this.typeCount > 0) {
      this.typeText();
    }
  }

  typeText() {
    this.typeCount += this.typeSpeed;
    const typedText = this.text.substring(0, this.typeCount);
    this.textElement.innerText = typedText;
  }

  clear() {
    this.typeCount = 0;
    this.textElement.innerText = '';
  }
}

class Overlay {
  /**
   *
   * @param {HTMLElement} element
   * @param {string} soundOpen
   * @param {number} autoCloseTimeout
   * @param {function} onCloseCallback
   * @param {string} soundClose
   * @param {number} closeTimeout
   */
  constructor(
    element,
    soundOpen,
    autoCloseTimeout,
    onCloseCallback,
    soundClose,
    closeTimeout
  ) {
    this.element = element;
    this.autoCloseTimeout = autoCloseTimeout;
    this.onCloseCallback = onCloseCallback;
    this.audioOpen = soundOpen && new Audio(soundOpen);
    this.audioClose = soundClose && new Audio(soundClose);
    this.closeTimeout = closeTimeout;

    this.element
      .querySelector('.overlay-close')
      .addEventListener('click', () => {
        this.close();
      });
  }

  open() {
    if (this.audioOpen) {
      this.audioOpen.play();
    }
    this.showOverlayBackground();
    this.element.classList.remove('hidden');

    if (this.autoCloseTimeout) {
      setTimeout(() => {
        this.close();
        if (typeof this.onCloseCallback === 'function') {
          this.onCloseCallback();
        }
      }, this.autoCloseTimeout);
    }
  }

  close() {
    const doTheClosing = () => {
      this.element.classList.add('hidden');
      this.hideOverlayBackground();
      if (typeof this.onCloseCallback === 'function') {
        this.onCloseCallback();
      }
    };
    if (this.audioOpen) {
      this.audioOpen.pause();
      this.audioOpen.currentTime = 0;
    }
    if (this.audioClose) {
      this.audioClose.play();
      setTimeout(() => {
        doTheClosing();
      }, this.closeTimeout);
    } else {
      doTheClosing();
    }
  }

  showOverlayBackground() {
    document.querySelector('.overlay-background').classList.remove('hidden');
  }

  hideOverlayBackground() {
    document.querySelector('.overlay-background').classList.add('hidden');
  }
}

const hackingAlert = new Overlay(
  document.getElementById('alert'),
  './sounds/alarm.wav',
  2000,
  () => {
    productOverlay.open();
  }
);

const productOverlay = new Overlay(
  document.getElementById('product-overlay'),
  './sounds/robot-transmission.ogg',
  null,
  null,
  './sounds/spaceship-interface.wav',
  1000
);

const productHackerOverlay = new Overlay(
  document.getElementById('product-console-overlay'),
  null,
  null,
  null,
  './sounds/lushlife-levelup.wav',
  1000
);

function preLoadAudioFiles(doneCallback) {
  const audioFiles = [
    './sounds/robot-transmission.ogg',
    './sounds/spaceship-interface.wav',
    './sounds/alarm.wav',
    './sounds/ambient-bg.wav',
    './sounds/lushlife-levelup.wav',
    './sounds/powerup.flac',
  ];

  function preloadAudio(url) {
    const audio = new Audio();
    audio.addEventListener('canplaythrough', loadedAudio, false);
    audio.src = url;
  }

  let loaded = 0;
  function loadedAudio() {
    loaded++;
    if (loaded == audioFiles.length) {
      doneCallback();
    }
  }

  for (const file of audioFiles) {
    preloadAudio(file);
  }
}

preLoadAudioFiles(() => {
  setTimeout(() => {
    document.getElementById('loading-program').classList.add('hidden');
    document.getElementById('hacker-program-loaded').classList.remove('hidden');
    document.querySelector('.start-button').addEventListener('click', () => {
      document.getElementById('hacker-program-loaded').classList.add('hidden');
      startProgram();
    });
  }, 2000);
});

function startProgram() {
  document.getElementById('hacker-program').classList.remove('hidden');
  const bgAudio = new Audio('./sounds/ambient-bg.wav');
  bgAudio.loop = true;
  bgAudio.play();

  const cursor = new Cursor(document.querySelector('.main-cursor'));
  const terminalText = new TerminalText(
    document.querySelector('.main-console'),
    window.kernel,
    2
  );
  cursor.start();

  let cursorTimeoutId = null;
  window.addEventListener('keypress', () => {
    cursor.stop();
    clearTimeout(cursorTimeoutId);
    terminalText.typeText();
    cursorTimeoutId = setTimeout(() => {
      cursor.start();
    }, 500);
  });
}

const productCursor = new Cursor(document.querySelector('.product-cursor'));
const productTerminalText = new TerminalText(
  document.querySelector('.product-console'),
  window.kernel,
  2,
  0
);
productCursor.start();

document.querySelector('.buy-button').addEventListener('click', () => {
  if (document.querySelector('.buy-button').classList.contains('hacked')) {
    createGameOverOverlay().open();
    return;
  }
  productHackerOverlay.open();
  window.addEventListener('keypress', overlayTyperKeypressEvent);
  productHackerOverlay.onCloseCallback = () => {
    window.removeEventListener('keypress', overlayTyperKeypressEvent);
  };

  function overlayTyperKeypressEvent(event) {
    event.preventDefault();
    if (event.charCode === 13) {
      // Enter key
      productHackerOverlay.close();
      productIsHacked();
    }
    productTerminalText.typeText();
  }
});

document.getElementById('secret-button').addEventListener('click', () => {
  hackingAlert.open();
});

function createGameOverOverlay() {
  const element = document.createElement('div');
  element.classList.add('alert', 'overlay', 'game-over-overlay', 'hidden');
  element.style.top = randomIntFromInterval(10, 500) + 'px';
  element.style.left = randomIntFromInterval(10, 300) + 'px';
  element.innerHTML = `<div class="overlay-close">x</div>
    <div class="overlay-container">
      Du har lyckats hacka sidan! Lamborghini är köpt för 0 kr.
    </div>`;
  document.getElementById('hacker-program').appendChild(element);
  return new Overlay(
    element,
    './sounds/powerup.flac',
    null,
    null,
    './sounds/spaceship-interface.wav',
    1000
  );
}

function productIsHacked() {
  document.querySelector('.buy-button').classList.add('hacked', 'blink');
}

function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
