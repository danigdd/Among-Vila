import '../styles/general-styles.css';
import '../styles/mainPage-styles.css';
import logo from '../resources/logofull.webp';

export function renderMain() {
  const root = document.getElementById('content');
  root.innerHTML = '';

  // MAIN LOGO
  const mainLogoDom = document.createElement('img');
  mainLogoDom.id = 'mainLogo_id';
  mainLogoDom.src = logo;
  root.appendChild(mainLogoDom);

  // MAIN TITLE
  const titleGameDescriptionDOM = document.createElement('div');
  titleGameDescriptionDOM.id = 'titleGameDescription_id';
  titleGameDescriptionDOM.textContent = 'Empieza a jugar por la Vila';
  root.appendChild(titleGameDescriptionDOM);

  // PLAY BUTTON
  const playButtonDOM = document.createElement('button');
  playButtonDOM.id = 'playButton_id';
  playButtonDOM.textContent = 'Juega ya';
  root.appendChild(playButtonDOM);
}
