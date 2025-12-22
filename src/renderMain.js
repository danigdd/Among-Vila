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
}
