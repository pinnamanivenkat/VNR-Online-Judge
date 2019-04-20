$(() => {
  $('#submitCode').click(function() {
    const code = editor.getValue();
    const language = $('#language').val();
    console.log(code);
    console.log(language);
    console.log(duringContest);
    let url = '/submit/';
    if (duringContest) {
      url+=contestCode+'/'+problemCode;
    } else {
      url += problemCode;
    }
    console.log(url);
    $.ajax({
      type: 'POST',
      url,
      data: {
        code,
        language,
        problemCode,
      },
      success: function(data) {
        if (data.status == 200) {
          if(duringContest) {
            window.location = '/contest/'+contestCode+'/viewsolution/'+data.submissionCode;
          } else {
            window.location = '/viewsolution/'+data.submissionCode;
          }
        } else {
          alert('Please login to submit');
        }
      },error: function(data) {
        alert('Please login');
        window.location = '/login';
      }
    });
  });
});
