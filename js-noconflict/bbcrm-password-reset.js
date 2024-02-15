jQuery(document).on('submit', "#passwordForm", function (e) {
    e.preventDefault();
jQuery("#passworResetForm .btn").attr("disabled", "disabled");
    jQuery.ajax({
        url: api_path + 'updatepassword',
        method: 'POST',
        data: {
            data: jQuery("#passwordForm").serialize(),
            authorization: getCookie('auth_token')
        },
        success: function (response) {
            response = JSON.parse(response);
            if (response.code === 200) {
                jQuery('.help-block').text('');
                alert(response.body.html);
		console.log('test');
            } else if (response.code === 422) {
                jQuery.each(response.body.html[0], function (key, value) {
                    jQuery('.help-block').text(value);
                })
            }
        }
    });


});
jQuery(document).on('submit', "#passworResetForm", function (e) {
    e.preventDefault();
jQuery("#passworResetForm .btn").attr("disabled", "disabled");
    jQuery.ajax({
        url: api_path + 'resetpassword',
        method: 'POST',
        data: {
            data: jQuery("#passworResetForm").serialize(),
        },
        success: function (response) {
            response = JSON.parse(response);
            if (response.code === 200) {
                jQuery('.help-block').text('');
                alert(response.body.html);
		console.log('forgot');
		if(document.getElementById('password')){
			document.querySelector('h4').innerText = 'Your Password Has Been Reset';
		}else{
                        document.querySelector('h4').innerText = 'A Reset Link Has Been Emailed To You';
		}
		document.getElementById('passworResetForm').remove();
            } else if (response.code === 422) {
                jQuery.each(response.body.html[0], function (key, value) {
                    jQuery('.help-block').text(value);
                })
            }
        }
    });


});
