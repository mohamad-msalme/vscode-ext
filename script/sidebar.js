(function () {
  const tsvscode = acquireVsCodeApi();

  let authUser = "";
  document
    .getElementById("btnSigninByGitHub")
    .addEventListener("click", signinByGitHub);
  document.getElementById("btnLogout").addEventListener("click", logout);
  document.getElementById("btnTime").addEventListener("click", btnTime);

  function logout() {
    tsvscode.postMessage({
      type: "logout",
      value: undefined,
    });
  }

  function btnTime() {
    tsvscode.postMessage({
      type: "timeReport",
      value: undefined,
    });
  }

  function signinByGitHub() {
    tsvscode.postMessage({
      type: "loginByGitHub",
      value: undefined,
    });
  }

  function getTimeButton() {
    return document.getElementById("btnTime");
  }

  function getUsernameTextfield() {
    return document.getElementById("txtfieldUsername");
  }

  function getGitHubButton() {
    return document.getElementById("btnSigninByGitHub");
  }

  function getLogoutButton() {
    return document.getElementById("btnLogout");
  }

  function updateAuthUser(username) {
    if (username) {
      getUsernameTextfield().innerHTML = `Hello ${username},`;
      getTimeButton().style.display = "block";
      getGitHubButton().style.display = "none";
      getLogoutButton().style.display = "block";
    } else {
      getTimeButton().style.display = "none";
      getUsernameTextfield().innerHTML = "Not authorized !";
      getGitHubButton().style.display = "block";
      getLogoutButton().style.display = "none";
    }
  }

  // Handle messages sent from the extension to the webview
  window.addEventListener("message", (event) => {
    const message = event.data; // The json data that the extension sent
    switch (message.command) {
      case "authUser":
        updateAuthUser(message.value);
        break;
    }
  });

  // Post message to get
  tsvscode.postMessage({
    type: "getAuthUser",
    value: undefined,
  });
})();
