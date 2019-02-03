$(() => {
    var editor = new Simditor({
        textarea: $('#editor'),
        toolbar: true,
    });
    $('#save').click(function() {
        console.log(editor.getValue());
    })
});