/* eslint-disable no-undef */
"use strict";

// const { ipcRenderer } = require('electron')

const loadConfig = document.getElementById("load-config");
const setOutputDir = document.getElementById("set-output-dir");
const patreonLink = document.getElementById("patreon-link");
const outputLocation = document.getElementById("output-location");
const bookList = document.getElementById("book-select");
const contentLoadMessage = document.getElementById("config-loader");
const generateButton = document.getElementById("munch-book");
const userField = document.getElementById("user");

var config;

patreonLink.addEventListener("click", (event) => {
  event.preventDefault();
  window.api.patreon();
});

loadConfig.addEventListener("click", (event) => {
  event.preventDefault();
  window.api.send("loadConfig");
});

setOutputDir.addEventListener("click", (event) => {
  event.preventDefault();
  window.api.send("outputDir");
});

generateButton.addEventListener("click", (event) => {
  event.preventDefault();
  generateButton.disabled = true;
  const bookCode = document.getElementById("book-select");
  const generateTokens = document.getElementById("generate-tokens");
  
  if (bookCode.value !== 0) {
    window.api.send("generate", { bookCode: bookCode.value, generateTokens: generateTokens.checked });
  }

});

window.api.receive("generate", () => {
  generateButton.disabled = false;
});


window.api.receive("books", (data) => {
  data.forEach((book) => {
    console.log(`${book.bookCode} : ${book.book}`);
  });
  const bookHtml = data.reduce((html, book) => {
    html += `<option value="${book.bookCode}">${book.book}</option>`;
    return html;
  }, "<option value=\"0\">Select book:</option>");
  bookList.innerHTML = bookHtml;
});

window.api.receive("user", (data) => {
  if (data.error) {
    userField.innerHTML = "<b>Authentication Failure - please generate and load a new config file!</b>";
  }
  else if (data.userDisplayName) {
    userField.innerHTML = `<b>User name:</b> ${data.userDisplayName}`;
  }
});


window.api.receive("config", (config) => {
  console.log("Received config from main process");
  console.log(config);

  if (config.cobalt) {
    contentLoadMessage.innerHTML = "Config loaded!";
    setOutputDir.disabled = false;
    window.api.send("user");
    if (config.outputDirEnv) {
      generateButton.disabled = false;
      outputLocation.innerHTML = config.outputDirEnv;
      window.api.send("books");
    }
    document.getElementById("generate-tokens").checked = config.generateTokens === true;
  } else {
    console.warn("No config file!");
    contentLoadMessage.innerHTML = "Config not found";
  }
});
window.api.send("config", "get config");

