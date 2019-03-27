$(() => {
    $('#createProblem').click(function () {
        window.location = '/question';
    })
});

function deleteProblem(problemCode) {
    $.ajax({
        type: "POST",
        url: "/deleteProblem",
        data: {
            problemCode
        },
        success: function(data) {
            if(data.status == 200) {
                window.location = '/myProblems'
            } else {
                alert("Couldn't delete problem")
            }
        }
    })
}