jQuery(document).ready ( function(){

    jQuery(document).on('click', 'input[id*=\'add-to-data-room\']', function (e) {
        jQuery.ajax({
            url: api_path + 'addtodataroom',
            method: 'POST',
            data: {
                listing: e.target.id,
                authorization: getCookie('auth_token')
            },
            success: function (response) {
                response = JSON.parse(response);
                if (response.code === 200) {
                    location.reload();
                }
            }
        });
    });


    jQuery(document).on('click', '.bbcrm-download', function (e) {
        e.preventDefault();
        jQuery.ajax({
            url: api_path + 'download',
            method: 'POST',
            data: {
                dl: e.target.id,
                authorization: getCookie('auth_token')
            },
            success: function (response) {
                response = JSON.parse(response);
                console.log(response.data);
                download(response.data, response.name);
            }
        });
    });

    jQuery(document).on('click', 'input[id*=\'request-address\']', function (e) {
        
        var element = this;

        jQuery.ajax({
            url: api_path + 'requestaddress',
            method: 'POST',
            context: document.body,
            data: {
                listing: e.target.id,
                authorization: getCookie('auth_token')
            },
            success: function (response) {
                response = JSON.parse(response);
                if (response.code === 200) {
                    if(jQuery('.portfoliostatus').parent().length === 1){
                        var parent = jQuery('.portfoliostatus').parent();
                        jQuery('.portfoliostatus').remove();
                        parent.prepend(response.body.html);
                        jQuery(element).remove();
                    } else {
                        jQuery(element).parents('div:first').children('.portfoliostatus').remove();
                        jQuery(element).parents('div:first').prepend(response.body.html);
                        jQuery(element).remove();

                    }
                }
            }
        });

    });

    jQuery(document).on('click', 'input[id*=\'hide-from-data-room\']', function (e) {
        jQuery.ajax({
            url: api_path + 'hidefromdataroom',
            method: 'POST',
            data: {
                listing: e.target.id,
                authorization: getCookie('auth_token')
            },
            success: function (response) {
                response = JSON.parse(response);
                if (response.code === 200) {
                    location.reload();
                }
            }
        });
    });


});