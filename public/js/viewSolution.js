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
});