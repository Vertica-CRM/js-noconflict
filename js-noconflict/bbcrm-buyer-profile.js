var formid;

function buyerUpdateValidation(this_button) {

    var mod = this_button.parents('div:first').find('form:first').attr('module');
    var formeditor_id = this_button.parents('div:first').find('form:first').children('.bbcrm-form-wrapper').attr('id');
    formid = this_button.parents('div:first').find('form:first').attr('id');
    var form_data = this_button.parents('div.bbcrm-window:first').find('form:first').serialize();

    var params = [];
    params.push(form_data);
    params.push(formid);

    bbcrm_validate(this_button.parents('div:first').find('form:first').attr('id'),
        this_button.parents('div:first').find('form:first').children('.bbcrm-form-wrapper').attr('id'),
        this_button.parents('div:first').find('form:first').attr('module'),
        this_button.parents('div.bbcrm-window:first').find('form:first').serialize(),
        updateBuyerProfile,
        params,
        null, null);
}

function updateBuyerProfile() {

        jQuery.ajax({
            url: api_path + 'updateprofile',
            method: 'POST',
            data: {
                data: jQuery("#"+formid).serialize(),
                authorization: getCookie('auth_token')
            },
            success: function (response) {
                response = JSON.parse(response);
                if (response.code === 200) {
                    alert("Profile updates successfully!");
                } else if (response.code === 422){
                    jQuery.each(response.body.html,function(key,value){
                        //jQuery("#"+key).val(value)
                        console.log(value[0]);
                        jQuery('#'+formid+' .bbcrm-form-wrapper #field_'+key+" .bbcrm-error-message").text( value[0] );

                    })
                }
            }
        });
}