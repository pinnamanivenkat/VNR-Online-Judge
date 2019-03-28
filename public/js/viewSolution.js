$(() => {
    var loadingDiv = $('.loadingDiv');
    var cantAccessDiv = $('.cantAccessDiv');
    var shouldCall = true;
    var recurringCall = setInterval(function () {
        if (shouldCall) {
            console.log(window.location.pathname);
            $.ajax({
                url: window.location.pathname,
                type: "POST",
                success: function (data) {
                    console.log(data);
                    if (data.status == 200) {
                        shouldCall = false;
                        showCodeAndScore(data);
                        //TODO: Show code and test cases
                    } else if(data.status == 400) {
                        shouldCall = false;
                        loadingDiv.removeClass('show');
                        loadingDiv.addClass('hide');
                        cantAccessDiv.removeClass('hide');
                        cantAccessDiv.addClass('show');
                    }
                }
            });
        } else {
            clearInterval(recurringCall);
        }
    }, 3000);

    function showCodeAndScore(data) {
        $('.content').remove();
        var rowDiv = $("<div>", {"class": "row"});
        var colDiv = $("<div>", {"class": "col-12"});
        colDiv.append("<p>"+data.submissionStatus.message+"</p>");
        for(var i=0;i<data.submissionStatus.status.length;i++) {
            var element = data.submissionStatus.status[i];
            colDiv.append("<p> Test Case "+i+":"+ element.status +"</p>");
        }
        rowDiv.append(colDiv);
        $('.container').append(rowDiv);
        rowDiv = $("<div>", {"class": "row"});
        colDiv = $("<div>", {"class": "col-12"});
        preDiv = $("<pre>");
        codeDiv = $("<code>");
        codeDiv.text(data.code);
        preDiv.append(codeDiv);
        colDiv.append(preDiv);
        rowDiv.append(colDiv);
        $('.container').append(rowDiv);
    }
});