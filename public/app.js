const API_URL = 'https://218280782-sit-209.now.sh/api';

if (localStorage.getItem("user") == undefined && (window.location.pathname != "/login" && window.location.pathname != "/register")) {
    window.location.href = "/login";
}

//Loading the devices
$.get(`${API_URL}/users/${localStorage.getItem("user")}/devices`)
    .then(response => {
        response.forEach(device => {
            $('#devices tbody').append(`
            <tr data-device-id=${device._id}>
                <td>${device.user}</td>
                <td>${device.name}</td>
            </tr>`
            );
        });
    })
    .catch(error => {
        console.log(`Error: ${error}`);
    });

$('#navbar').load('navbar.html');
$('#footer').load('footer.html');

function showAlert(text) {
    $('#message').css('display', 'block');
    $('#message-text').text(text);
}

function closeAlert() {
    $('#message').css('display', 'none');
    $('#message-text').text("");
}

function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('isAdmin');
    location.href = '/login';
}

//Adding a device to the list
$('#add-device').on('click', function () {
    const user = $('#user').val();
    const name = $('#name').val();
    const sensorData = [];

    const body = {
        name,
        user,
        sensorData
    };

    $.post(`${API_URL}/devices`, body)
        .then(response => {
            location.href = '/';
        })
        .catch(error => {
            console.error(`Error: ${error}`);
        });
});

//Sending a command
$('#send-command').on('click', function () {
    const command = $('#command').val();
    console.log(`Command is ${command}`);
});

//Creating an account
$('#register').on('click', () => {
    const newusername = $('#username').val().toLowerCase();
    const newpassword = $('#password').val();
    const confirmPassword = $('#confirm-password').val();

    if (newpassword != confirmPassword) {
        showAlert("Passwords do not match!");
        return;
    }

    if (newpassword.length < 8) {
        showAlert("Password length must be 8+ characters long!");
        return;
    }

    $.post(`${API_URL}/register`, { newusername, newpassword })
        .then(response => {
            if (response.success) {
                location.href = '/login';
            }
            else if (response == "User already exists.") {
                showAlert("User already exists!");
            }
        }).
        catch(error => {
            console.error(`Error: ${error}`);
            showAlert("Cannot connect login servers. Please try again later.");
        });
});

//Login in
$('#login').on('click', () => {
    const username = $('#username').val().toLowerCase();
    const password = $('#password').val();

    $.post(`${API_URL}/authenticate`, { username, password })
        .then(response => {
            if (response.success) {
                localStorage.setItem('user', username);
                localStorage.setItem('isAdmin', response.isAdmin);
                location.href = '/';
            }
        }).
        catch(error => {
            console.error(`Error: ${error}`);
            showAlert("Cannot connect login servers. Please try again later.");
        });
});

$('input').on('click', () => {
    closeAlert();
});

//Show Device History
$("#devices tbody").on('click', "tr", (e) => {
    const deviceId = $(e.currentTarget).attr('data-device-id');
    $.get(`${API_URL}/devices/${deviceId}/device-history`)
        .then(response => {
            response.map(sensorData => {
                $('#historyContent').html(" ");
                $('#historyContent').append(`
                  <tr>
                    <td>${sensorData.ts}</td>
                    <td>${sensorData.temp}</td>
                    <td>${sensorData.loc.lat}</td>
                    <td>${sensorData.loc.lon}</td>
                  </tr>
                `);
            });

            $('#historyModal').modal('show');
        })
        .catch(err => {
            alert("Failed to get device information.");
        });
});