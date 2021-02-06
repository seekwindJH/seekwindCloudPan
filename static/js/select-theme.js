if (localStorage && localStorage.getItem('theme') == 'dark') {
    $('#theme').attr('href', '/css/bootstrap.dark.min.css')
}
$().ready(() => {
    if (localStorage && localStorage.getItem('theme') == 'dark') {
        $('#switch-mode').attr('checked', false)
    }
    $('#switch-mode').change(() => {
        if ($('#switch-mode').prop('checked')) {
            $('#theme').attr('href', '/css/bootstrap.min.css')
            localStorage.removeItem('theme')
        }
        else {
            $('#theme').attr('href', '/css/bootstrap.dark.min.css')
            localStorage.setItem('theme', 'dark')
        }
    })
})