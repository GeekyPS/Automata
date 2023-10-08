// function to check if user is logged in (using cookie)
function getCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

document.addEventListener("DOMContentLoaded", function () {
  // changing the login button text based on whether user is logged in or not
  const loginButton = document.getElementById("login-btn");
  const token = getCookie('token');
  if(token){
    loginButton.innerText = "Logout";
  }else{
    loginButton.innerText = "Login";
  }

  const formUrlInput = document.getElementById("form-url");
  const fillDetailsButton = document.querySelector(".fill-details-btn");

  // Function to enable or disable the button based on the input field value
  function toggleFillButton() {
    if (formUrlInput.value.trim() === "") {
      fillDetailsButton.disabled = true;
    } else {
      fillDetailsButton.disabled = false;
    }
  }
  formUrlInput.addEventListener("input", toggleFillButton);

  toggleFillButton();
});

function validateUrl(url) {
  return /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(url);
}

let images = [];

function showSubmittedFields() {
  const div = document.getElementById("hello");

  images.forEach((url) => {
    const img = document.createElement("img");
    img.src = url;
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.appendChild(img);

    div.appendChild(anchor);
  });
}

// login funtion
function login(event) {
  event.preventDefault();
  const token = getCookie('token');
  if(!token)
    window.location.replace(`http://localhost:3030/auth/google`);
  else
    window.location.replace(`http://localhost:3030/auth/google/logout`);
}

function fillForm() {
  var loadingOverlay = document.querySelector(".loading-overlay");

  loadingOverlay.style.display = "flex";
  var formUrl = document.getElementById("form-url").value;
  var errorMessage = document.getElementById("error-message");

  if (!validateUrl(formUrl)) {
    errorMessage.innerText = "Please enter a valid URL";
    return;
  }

  errorMessage.innerText = "";

  var xhr = new XMLHttpRequest();
  xhr.open("POST", "/api/fill-details", true);
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.onload = function () {
    loadingOverlay.style.display = "none";

    if (xhr.status >= 200 && xhr.status < 400) {
      var response = JSON.parse(xhr.responseText);
      var data = response.data;
      let imageUrls = [];

      images = imageUrls;

      for (let i = 0; i < data.length; i++) {
        imageUrls.push(window.location.href + `${data[i]}`);
      }

      document.body.innerHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Form Submission Success</title>
          <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f8f9fa;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            overflow-y: auto;
            
        }
        .container {
            max-width: 400px;
            background-color: #fff;
            border-radius: 10px;
            padding: 40px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #343a40;
            margin-bottom: 20px;
        }
        p {
            font-size: 18px;
            color: #6c757d;
            margin-bottom: 30px;
        }
        .wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .success-icon {
            font-size: 80px;
            color: #28a745;
            margin-bottom: 20px;
            display: block;
            margin-left: auto;
            margin-right: auto;
        }
        .btn {
            display: inline-block;
            padding: 10px 20px;
            font-size: 16px;
            color: #fff;
            background-color: #007bff;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            text-decoration: none;
        }
        .btn:hover {
            background-color: #0056b3;
        }
          </style>
        </head>
        <body>
          <div class="wrapper">
     
          <div class="container">
            <div class="success-icon">&#10004;</div>
            <h1>Form Submitted Successfully!</h1>
            <p>Thank you for your submission.</p>
            <a href="#" class="btn" onclick="location.reload()">Back to Home</a>
            <a class="btn" onclick="showSubmittedFields()">Show Submitted Fields</a>
          </div>
          <div id="hello"></div>
          
          </div>
        </body>
        </html>`;
    } else {
      alert("Error: " + xhr.statusText);
    }
  };

  xhr.onerror = function () {
    loadingOverlay.style.display = "none";

    alert("Error: Unable to make the request.");
  };

  xhr.send(JSON.stringify({ link: formUrl }));
}
