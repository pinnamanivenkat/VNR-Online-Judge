$(() => {
    $('#startContest').on('click', function () {
        $.ajax({
            type: "POST",
            url: "/startContest/" + contestCode,
            success: function (data) {
                window.location = "/contest/" + contestCode;
            },
            error: function (data) {
                window.location='/login';
            }
        });
    });
});