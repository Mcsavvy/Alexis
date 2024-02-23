'use strict';
import $ from 'jquery';
import scrapeProject ,{
  getProjectDescription,
  getProjectTitle,
  getProjectTags,
  getProjectTasks,
} from './scraper';

// Content script file will run in the context of web page.
// With content script you can manipulate the web pages using
// Document Object Model (DOM).
// You can also pass information to the parent extension.

// We execute this script by making an entry in manifest.json file
// under `content_scripts` property

// For more information on Content Scripts,
// See https://developer.chrome.com/extensions/content_scripts

// e.g  https://intranet.alxswe.com/projects/100092
const PROJECT_URL = /https:\/\/intranet.alxswe.com\/projects\/\d+/;

const mobileIcon = `
<li data-container="body" data-placement="right" data-toggle="tooltip" class="open-alexis" title="" data-original-title="Alexis">
  <a href="#" onclick="event.preventDefault()">
    <div class="icon">
      <i aria-hidden="true" class="fa-solid fa-robot"></i>
    </div>
    <div class="visible-xs">Alexis</div>
  </a>
</li>
`;

const desktopIcon = `
<li data-container="body" data-placement="right" data-toggle="tooltip" class="open-alexis" title="" data-original-title="Alexis">
  <a href="#" onclick="event.preventDefault()">
    <div class="icon">
      <i aria-hidden="true" class="fa-solid fa-robot"></i>
    </div>
    <div class="visible-xs">Alexis</div>
  </a>
</li>
`;

// Log `title` of current active web page
const pageTitle = $('title').text();
console.log(
  `Page title is: '${pageTitle}' - evaluated by Chrome extension's 'contentScript.js' file`
);


$(() => {
  $(mobileIcon).insertBefore($('ul.nav.navbar-nav > li').first());
  $(desktopIcon).insertBefore($('.sidebar.navigation > ul > li').first());
  $(".open-alexis").on("click", () => {
    console.log('Alexis clicked');
    chrome.runtime.sendMessage({ type: 'open_side_panel' });
    chrome.runtime.sendMessage({ message: 'ping', from: 'content script' }, (response) => {
      console.log('Received response from %s:', response.from, response.response);
    });
  });
  if (PROJECT_URL.test(window.location.href)) {
    console.log('This is a project page');
    const project = scrapeProject();
    console.log('Project:');
    console.log(project);
  }
})


