$(() => {
    $('#submitCode').click(function () {
        let code = editor.getValue();
        let language = $('#language').val();
        console.log(code);
        console.log(language);
        $.ajax({
            type: "POST",
            url: '/submit/' + problemCode,
            data: {
                code,
                language,
                problemCode
            },
            success: function (data) {
                alert('sample');
                if (data.status == 200) {
                    window.location = '/viewsolution/'+data.submissionCode;
                } else {
                    alert("Please login to submit");
                }
            }
        });
    });
});