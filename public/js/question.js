$(() => {
    var editor = new Simditor({
        textarea: $('#editor'),
        toolbar: true,
    });

    var testCaseCounter = 0;

    $("#createTestcase").on('click', function () {
        var counter;
        if (testCaseCounter == 0) {
            counter = 0;
        } else {
            var lastChild = $("#testCaseHolder>div:last-child").attr("id");
            counter = lastChild[lastChild.length - 1];
            counter++;
        }
        var newTestCaseDiv = $(document.createElement("div")).attr("id", "testcase" + counter).attr("class", "row");
        newTestCaseDiv.appendTo("#testCaseHolder");
        var inputFile = $(document.createElement("input")).attr("name", "input" + counter).attr("type", "file").attr("accept", ".txt").attr("class", "col-5");
        var outputFile = $(document.createElement("input")).attr("name", "output" + counter).attr("type", "file").attr("accept", ".txt").attr("class", "col-5");
        var deleteButton = $(document.createElement("input")).attr("id", "delete" + counter).attr("type", "button").attr("value", "Delete").attr("class", "col-2");
        deleteButton.on("click", function () {
            newTestCaseDiv.remove();
            testCaseCounter--;
        });
        inputFile.appendTo("#testcase" + counter);
        outputFile.appendTo("#testcase" + counter);
        deleteButton.appendTo("#testcase" + counter);
        testCaseCounter++;
    });

    $("#submit").on('click', function () {
        var form = $("#questionForm"),
            url = "/createProblem";
        var formData = new FormData();
        formData.append('questionCode', $('#problemCode').val());
        formData.append('questionText', editor.getValue());
        formData.append('difficultyLevel', $('#difficultyLevel').val());
        formData.append('visiblility',$('visiblility').val());
        console.log('sample');
        $('input[type="file"]').each(function (idx, element) {
            var file = $(this)[0].files[0];
            console.log(idx);
            if (idx % 2 == 0) {
                formData.append('input_' + (idx / 2), file);
            } else {
                formData.append('output_' + ((idx-1) / 2), file);
            }
        });
        console.log(formData);
        $.ajax({
            url,
            method: "POST",
            contentType: false,
            dataType: 'json',
            processData: false,
            contentType: false,
            data: formData,
            success: function (data) {
                console.log(data.message);
                if (data.status == 200) {
                    window.location = '/myProblems';
                } else if(data.status == 400) {
                    alert(data.message);
                }
            }
        })
    });

    $('#questionForm').bind('ajax:complete', function () {
        alert('done');
    });

    function getFormData($form) {
        var unindexed_array = $form.serializeArray();
        var indexed_array = {};

        $.map(unindexed_array, function (n, i) {
            indexed_array[n['name']] = n['value'];
        });

        return indexed_array;
    }
});