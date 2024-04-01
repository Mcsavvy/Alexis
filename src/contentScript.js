'use strict';
import $ from 'jquery';
import scrapeProject ,{
  getProjectDescription,
  getProjectTitle,
  getProjectTags,
  getProjectTasks,
} from './scraper';
import * as Sentry from '@sentry/browser';
import { environ } from './utils';


const PROJECT_PAT = /\/projects\/\d+/;
const API_URL = environ.API_URL;


window.addEventListener('load', function () {
  Sentry.init({
    dsn: environ.SENTRY_DSN,
    tracesSampleRate: 1.0,
  });
});

/**
 * @typedef {{
 *  project: boolean,
 *  tasks: boolean[]
 * }} ProjectExistsResponse
 */

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

async function saveProject() {
  const project = scrapeProject();
  const projectExistsPayload = {
    project: project.id,
    tasks: project.tasks.map(task => task.id)
  };
  const response = await fetch(`${API_URL}/project/exists`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(projectExistsPayload)
  });
  /** @type {ProjectExistsResponse} */
  const data = await response.json();

  let projectPayload = Object.assign({}, project);
  projectPayload.tasks = [];
  if (!data.project) {
    projectPayload = project;
  } else {
    for (let i = 0; i < project.tasks.length; i++) {
      if (!data.tasks[i]) {
        projectPayload.tasks.push(project.tasks[i]);
      }
    }
  }
  if (projectPayload.tasks.length === 0) {
    return project;
  }
  await fetch(`${API_URL}/project/save`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(projectPayload)
  });
  return project;
}

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
  if (PROJECT_PAT.test(location.pathname)) {
    console.log('This is a project page');
    saveProject().then((project) => {
      console.log('Project:', project);
    });
  }
})


