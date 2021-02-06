const pictureSuffix = [
            'png', 'bmp', 'jpg', 'jpeg',
            'gif', 'dib', 'jpe', 'jfif',
            'tif', 'tiff', 'heic'
        ]
        const textSuffix = [
            'txt', 'dat', 'md', 'markdown'
        ]
        $().ready(() => {

            $('#file').change(() => {
                let file = $('#file').val();
                if (file) {
                    $('#upload').css({
                        display: 'inline'
                    })
                    $('#upload').text('上传')
                    $('#upload').click(() => {
                        uploadFile()
                    })
                    file = file.split('\\')
                    file = file[file.length - 1]
                    if (file.length > 15)
                        file = file.substr(0, 7) + '...' + file.substr(file.length - 5, file.length)
                    $('#file-label').html(file+`
                        <div class="progress">
                          <div id="upload-progress" class="progress-bar progress-bar-striped progress-bar-animated bg-succes" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>
                        </div>
                    `)
                }
                else {
                    $('#upload').css({
                        display: 'none'
                    })
                    $('#file-label').text('选择上传文件')
                }
            })
            $('#close-alert').click(() => {
                console.log(window.location.pathname)
                window.location.replace(window.location.pathname)
            })

            // stop event propagation
            $('tr [id^="btn-"]').click((e) => {
                e.stopPropagation()
            })

            $('tbody tr').click(function (e) {

                let index = $(this).attr('id').split('-')[1]
                let fileName = $('#name-' + index).text().trim()
                $('#modalTitle').text(fileName)
                let fileSaveDate = $('#savedate-' + index).text()
                let fileSize = $('#size-' + index).text()
                let suffix = fileName.split('.')
                suffix = suffix[suffix.length - 1]
                let modalContent = $('#modalContent')
                modalContent.html('')

                $('#saveModal').css({
                    display: 'inline'
                })
                // render text
                if (textSuffix.indexOf(suffix) >= 0) {
                    $.ajax({
                        method: 'post',
                        url: './read_text/' + fileName,
                        success: (response) => {
                            modalContent.html('')
                            if (suffix == 'md' || suffix == 'markdown') {
                                // render code block
                                $('#modalContent').html(response)
                                document.querySelectorAll('pre code').forEach((block) => {
                                    let code = block.outerHTML.trim()
                                    block = $(block).parent()[0]
                                    block.insertAdjacentHTML('beforebegin', `
                                        <div class="code-window">
                                            <div class="window-header">
                                                <span class="sur-red">●</span>
                                                <span class="sur-green">●</span>
                                                <span class="sur-yellow">●</span>
                                            </div>
                                            <pre class="code-block">`+
                                        code
                                     +`</pre>
                                        </div>
                                    `)
                                    block.remove()

                                })
                                document.querySelectorAll('pre code').forEach((block) => {
                                    hljs.highlightBlock(block);
                                });
                                $('#modalContent img').css({
                                    'max-width': '100%'
                                })
                            }

                            else {
                                modalContent.html('<pre></pre>')
                                $('#modalContent pre').text(response)
                            }
                        },
                        error: (response) => {
                        }
                    })
                }
                // render picture
                else if (pictureSuffix.indexOf(suffix) >= 0) {
                    $.ajax({
                        method: 'post',
                        url: './read_image_shape/' + fileName,
                        success: (response) => {
                            $('#modalTitle').text(fileName + '  (尺寸: ' + response + ')')
                        },
                        error: (response) => {
                        }
                    })
                    modalContent.html(`
                        <img alt="`+ fileName + `" src="./read_image/` + fileName + `">
                    `)
                    $('#modalContent img').css({
                        width: '100%',
                        height: '100%'
                    })
                }
                else {
                    modalContent.text("无法读取的文件格式")
                    $('#saveModal').css({
                        display: 'none'
                    })
                }

            })
            $.ajax({
                method: 'post',
                url: '/cloudpan/disk_space',
                success: (response) => {
                    let remainSpace = parseFloat(response.split('/')[0])
                    let totalSpace = parseFloat(response.split('/')[1])
                    let rate = parseInt((remainSpace/totalSpace) * 100 + 0.5) + '%'
                    $('#disk-space-bar').css({
                        width: rate
                    })
                    $('#disk-space-bar').html(parseInt(remainSpace/1024/1024/1024)+'G / '+parseInt(totalSpace/1024/1024/1024)+'G')
                    console.log(rate)
                }
            })

        });
        var uploadFile = () => {
            let username = $('#logo').text();
            username = username.substr(0, username.length - 3)
            let file = document.getElementById('file').files[0];
            let formData = new FormData();
            formData.append('file', file)
            let location = ''

            $('#upload-spinner').css({
                display: 'inline'
            })


            $.ajax({
                method: 'post',
                url: './' + location + 'upload',
                data: formData,
                contentType: false,
                processData: false,
                cache: false,
                xhr: () => {
                  var myXhr = $.ajaxSettings.xhr()
                  if(myXhr.upload){
                    $('.upload-file .upload-status').addClass('active')
                    myXhr.upload.addEventListener(
                      'progress',
                      progress,   // 用于显示上传进度
                      false)
                  }
                  return myXhr
                },
                success: function (response) {

                    switch (response) {
                        case 'Existed': {
                            console.log(response)
                            $('#upload').text('文件已存在')
                            break
                        }
                        case 'Success': {
                            console.log(response)
                            window.location.replace('./?success=True')
                            console.log(123)
                            break
                        }
                    }
                }
            })
        }
        var _loaded = 0
        var _timestamp = 0
        var progress = (e) => {
            if (e.lengthComputable) {
                let max = e.total
                let current = e.loaded
                let percentage = parseInt((current * 100) / max)
                if (percentage == 100) {
                    $('#upload').text('正在校验')

                }
                $('#upload-progress').css({
                    width: percentage + '%'
                })
                let speed = (current - _loaded) / (e.timeStamp - _timestamp)
                _loaded = current
                _timestamp = e.timeStamp
                if (speed > 512) {
                    speed = (speed/1024).toFixed(1) + 'MB/s'
                }
                else {
                    speed = speed.toFixed(1) + 'KB/s'
                }
                $('#upload').text(percentage+'% '+speed)

            }
        }