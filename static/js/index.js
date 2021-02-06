    $().ready(() => {

        if (localStorage) {
            $('#username').val(localStorage.getItem('username'))
            $('#password').val(localStorage.getItem('password'))
        }
        $('#memCheck').change(() => {
            if (localStorage && $('#memCheck').prop('checked')) {
                localStorage.setItem('username', $('#username').val())
                localStorage.setItem('password', $('#password').val())
            }
            else if (localStorage) {
                localStorage.removeItem('username')
                localStorage.removeItem('password')
            }
        })

    });