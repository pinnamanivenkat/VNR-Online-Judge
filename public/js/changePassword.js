$(document).ready(function () {
    var passOne = $("#passOne").val();
    var passTwo = $("#passTwo").val();
    var passThree = $("#passThree").val();

    $("#footerText").html("Fields don't match");

    var checkAndChange = function () {
        if (passOne.length < 1 || passTwo.length < 1) {
            if ($("#footer").hasClass("correct")) {
                $("#footer").removeClass("correct").addClass("incorrect");
                $("#footerText").html("They don't match");
            } else {
                $("#footerText").html("They don't match");
            }
        } else if ($("#footer").hasClass("incorrect")) {
            if (passThree == passTwo) {
                $("#footer").removeClass("incorrect").addClass("correct");
                $("#footerText").html("Continue");
            }
        } else {
            if (passThree != passTwo) {
                $("#footer").removeClass("correct").addClass("incorrect");
                $("#footerText").html("They don't match");
            }
        }
    }

    $("input").keyup(function () {
        var newPassOne = $("#passOne").val();
        var newPassTwo = $("#passTwo").val();
        var newPassThree = $('#passThree').val();

        passOne = newPassOne;
        passTwo = newPassTwo;
        passThree = newPassThree;

        checkAndChange();
    });
});