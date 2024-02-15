var formid;

function contactValidation(this_button) {
    var mod = this_button.parents('div:first').find('form:first').attr('module');
    var formeditor_id = this_button.parents('div:first').find('form:first').children('.bbcrm-form-wrapper').attr('id');
    formid = this_button.parents('div:first').find('form:first').attr('id');
    var form_data = this_button.parents('div.bbcrm-window:first').find('form:first').serialize();

    var params = [];
    params.push(this_button);
    params.push(form_data);
    params.push(formid);

    bbcrm_validate(this_button.parents('div:first').find('form:first').attr('id'),
        this_button.parents('div:first').find('form:first').children('.bbcrm-form-wrapper').attr('id'),
        this_button.parents('div:first').find('form:first').attr('module'),
        this_button.parents('div.bbcrm-window:first').find('form:first').serialize(),
        submitContact,
        params,
        null, null, this_button);
}

function submitContact(this_button) {
    var formData = new FormData();
    formData.append("data", jQuery("#"+formid).serialize());
    jQuery('#'+formid+' input[type="file"]').each(function( index ) {
	formData.append(this.getAttribute('name'), this.files[0]);
    });
    formData.append('authorization', getCookie('auth_token'));
    jQuery.ajax({
        url: api_path + 'submitcontact',
        method: 'POST',
        data: formData,
	contentType: false, 
	processData: false,
        success: function (response) {
            response = JSON.parse(response);
            if (response.code === 200) {
		//jQuery("#contact-form").empty();
		//jQuery("#contact-form").append( response.body.html );
		
		//added by Abe to correct for multiple forms submitting only the first form on the page
		par = jQuery("#"+formid).parent();
		jQuery("#"+formid).parent().empty();
		par.append(response.body.html);
		

            } else if (response.code === 422){
		if(this_button.length && this_button[0] instanceof jQuery){
			this_button[0].attr("disabled", false)
    		}
                jQuery.each(response.body.html,function(key,value){
                    //jQuery("#"+key).val(value)
                    console.log(value[0]);
                    jQuery('#'+formid+' .bbcrm-form-wrapper #field_'+key+" .bbcrm-error-message").text( value[0] );

                })
            }
        }
    });
}
