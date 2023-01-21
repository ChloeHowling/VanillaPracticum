const select = document.querySelector('#course');
const idBox = document.querySelector('#uvuIdBox');
const idInput = document.querySelector('#uvuId');
const logList = document.querySelector('#uvuLogs');
const logId = document.querySelector('#uvuIdDisplay');
const newLogTxtArea = document.querySelector('#newLog');
const newLogBtn = document.querySelector('#newLogBtn');

const url =
  'https://jsonserver6noo2h-tsgg--3000.local-credentialless.webcontainer.io/api/v1/';

// fetches courses dynamically to the course dropdown
fetch(url + 'courses')
  .then((response) => response.json())
  .then((data) => {
    console.log(data);
    data.forEach((course) => {
      const option = document.createElement('option');
      option.value = course.id;
      option.text = course.display;
      select.appendChild(option);
    });
  })
  .catch((error) => console.log(error));

// only display uvu id input box when a course is selected
select.addEventListener('change', () => {
  if (select.value == '') {
    idBox.style.display = 'none';
    clearLogs();
  } else {
    if (idInput != '') {
      displayLogsById(idInput.value);
    }
    idBox.style.display = 'flex';
  }
  logReady();
});

// ID input box validation check and display logs
function displayLogsById(id) {
  clearLogs();
  idInput.classList.remove('invalid');

  if (idInput.checkValidity()) {
    fetch(`${url}logs?courseId=${select.value}&uvuId=${id}`)
      .then((response) => {
        if (response.status == 200 || response.status == 304) {
          response.json().then(displayLogs);
        } else {
          logId.innerText = `Error ${response.status}, please try again.`;
        }
      })
      .catch((error) => console.log(error));
  } else if (idInput.value != '') {
    idInput.classList.add('invalid');
    logReady();
  }
}

idInput.addEventListener('keyup', (event) => {
  displayLogsById(event.target.value);
});

// display logs
function displayLogs(data) {
  clearLogs();
  if (data.length < 1) {
    logId.innerText = `Logs not found for ${idInput.value}`;
  } else {
    logId.innerText = `Student Logs for ${data[0]['uvuId']}`;
  }

  data.forEach((log) => {
    logList.appendChild(createLogListItem(log));
  });
  logReady();
}

// create collapsible log list item
function createLogListItem(log) {
  const listItem = document.createElement('li');
  listItem.innerHTML = `<div><small>${log['date']}</small></div>
  <div class="log_content" style="display:none;"><pre><p>${log['text']}</p></pre></div>`;

  listItem.addEventListener('click', (event) => {
    var logDetail = listItem.querySelector('.log_content');
    if (logDetail.style.display === 'none') {
      logDetail.style.display = 'flex';
    } else {
      logDetail.style.display = 'none';
    }
  });
  return listItem;
}

// remove logs displayed
function clearLogs() {
  logList.innerHTML = '';
  logId.innerText = '';
}

// check if log is ready when user is typing in the textarea
newLogTxtArea.addEventListener('keyup', logReady);

// check if new log is ready to be sent
function logReady() {
  if (
    logId.innerText != '' &&
    newLogTxtArea.value != '' &&
    select.value != ''
  ) {
    newLogBtn.disabled = false;
  } else {
    newLogBtn.disabled = true;
  }
}

// Translate new log information into object
function createNewLogData() {
  let currDate = new Date();
  return {
    courseId: select.value,
    uvuId: idInput.value,
    date: `${
      currDate.getMonth() + 1
    }/${currDate.getDate()}/${currDate.getFullYear()} ${
      currDate.getHours() > 12 ? currDate.getHours() - 12 : currDate.getHours()
    }:${currDate.getMinutes()}:${currDate.getSeconds()} ${
      currDate.getHours() >= 12 ? 'PM' : 'AM'
    }`,
    text: newLogTxtArea.value,
    id: generateUniqueString(7),
  };
}

// Send new log to server
newLogBtn.addEventListener('click', (event) => {
  fetch(url + 'logs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(createNewLogData()),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
});

// generate unique id for new log
function generateUniqueString(length) {
  var id = '';
  var characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for (var i = 0; i < array.length; i++) {
    id += characters.charAt(array[i] % characters.length);
  }
  return id;
}
