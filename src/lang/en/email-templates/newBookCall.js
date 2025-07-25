const subject = "New Book Call Request";
let date = new Date();
let year = date.getUTCFullYear();
const body =
  `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        padding: 0;
      }
      .email-container {
        max-width: 600px;
        margin: 40px auto;
        background-color: #ffffff;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      }
      .email-header {
        background-color: #b6a65d;
        color: #ffffff;
        padding: 20px;
        text-align: center;
      }
      .email-body {
        padding: 20px;
      }
      .email-body h2 {
        color: #333333;
      }
      .email-body p {
        margin: 10px 0;
        color: #555555;
      }
      .email-body .value {
        font-weight: bold;
        color: #333333;
      }
      .email-footer {
        background-color: #f8f8f8;
        text-align: center;
        padding: 10px;
        font-size: 12px;
        color: #aaaaaa;
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="email-header">
        <h1>New Book Call Request</h1>
      </div>
      <div class="email-body">
        <h2>Details</h2>
        <p><span class="value">Channel: </span>CHANNEL</p>
        <p><span class="value">Name: </span>NAME</p>
        <p><span class="value">Phone Number: </span>PHONENUMBER</p>
        <p><span class="value">Email: </span>EMAIL</p>
        <p><span class="value">City: </span>CITY</p>
        <p><span class="value">Job: </span>JOB</p>
        <p><span class="value">Designation: </span>DESIGNATION</p>
        <p>
          <span class="value">Message: </span>MESSAGE
        </p>
      </div>
      <div class="email-footer">
        <p>© ` +
  year +
  ` 5th Pillar Family Takaful. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>`;

module.exports = {
  subject,
  body,
};

module.exports = {
  subject,
  body,
};
