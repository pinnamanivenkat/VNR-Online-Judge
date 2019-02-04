$(() => {
    var editor = new Simditor({
        textarea: $('#editor'),
        toolbar: true,
    });

    $("#questionForm").submit(function (e) {
        e.preventDefault();
        var form = $(this),
            url = form.attr('action');
        data = getFormData(form);
        $.ajax({
            url,
            method: "POST",
            data,
            success: function (data) {
                if (data.status == 200) {
                    window.location = '/myProblems';
                }
            }
        })
    })

    function getFormData($form) {
        var unindexed_array = $form.serializeArray();
        var indexed_array = {};

        $.map(unindexed_array, function (n, i) {
            indexed_array[n['name']] = n['value'];
        });

        return indexed_array;
    }
});