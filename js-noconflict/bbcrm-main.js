/* Added by Sami for searching with Query Params */
var search_interval;

// Why is it necessary for this to be repeated here?
// jQuery.getScript('//api1.verticacrm.com/bbcrm-assets/js-noconflict/bbcrm-constants.js', function()
//{
    // script is imported
//});


jQuery.fn.exists = function () {
    return this.length > 0;
};

jQuery.fn.myserialize = function(options) {
    // default values to send when checkbox is on or off
    var settings = {
        on: '1',
        off: '0'
    };

    // override settings if given
    if (options) {
        settings = jQuery.extend(settings, options);
    }

    // set all checkboxes to checked with the on/off setting value
    // so they get picked up by serialize()
    var $container = jQuery(this),
        $checkboxes = $container.find("input[type='checkbox']").each(function() {
            jQuery(this).val(this.checked ? settings.on : settings.off).prop('checked', true);
        });

    var serialized = ($container.serialize());

    $checkboxes.each(function() {
        var $this = jQuery(this);
        $this.prop('checked', $this.val() == 1);
    });

    return serialized;
};



function limitText(){
    jQuery(".limit").each(function(i){
        if(jQuery(this).text().length>jQuery(this).attr("limit"))
        {
            jQuery(this).text(jQuery(this).text().substr(0,jQuery(this).attr("limit"))+'...');
        }
    });
};

/** Executes a given bbcrm element */
function processTag(bbcrm_element) {

    console.log(bbcrm_element);

    var api_string = bbcrm_element.attr('api_string');

    var url = window.location.href;

    var arr = url.split('?');

    if(bbcrm_element.attr('url') && typeof arr[1] === 'undefined'){
        url = bbcrm_element.attr('url');
    }
    
    // For right now the language cookie name is hardcoded
    // Needs to be retrived from a control panel in the long term
    var data = {
        authorization: getCookie('auth_token'),
        url: url,
        language: getCookie('pll_language')
    }

    if(api_string=='submitsearchtoolnew' && window.location.search!=''){
            data.search = window.location.search.slice(1);
            data.searchtoolid = jQuery('.bbcrm-search-tool').attr('id');
    }

     if(api_string=='submitsearchtoolnew') {
        /** added by jonny to automatically submit default search parameters */
        if(bbcrm_element.attr('defaultsearch')) {
            data.search = bbcrm_element.attr('defaultsearch');
            data.searchtoolid = jQuery('.bbcrm-search-tool').attr('id');
        }
     }

    if(api_string == "customform"){
        data.formID = bbcrm_element.attr('formid');
    }

    
    if(bbcrm_element.attr('lazyload')){
        data.lazyload = bbcrm_element.attr('lazyload');
    }
    if(bbcrm_element.attr('template')){
        data.template = bbcrm_element.attr('template');
    }

    if (bbcrm_element.attr('presets')) {
        data.presets = bbcrm_element.attr('presets');
    }

    if (bbcrm_element.attr('count')) {
        data.count = bbcrm_element.attr('count');
    }

    if (bbcrm_element.attr('sort')) {
        data.sort = bbcrm_element.attr('sort');
    }

    if(bbcrm_element.attr('showselect')){     
        data.showselect = bbcrm_element.attr('showselect');     
    }

    if(bbcrm_element.attr('sidebar')){
        data.sidebar = bbcrm_element.attr('sidebar');
    }

    if(bbcrm_element.attr('redirect')){
        data.redirect = bbcrm_element.attr('redirect');
    }

    if(bbcrm_element.attr('orderby')){
        data.orderby = bbcrm_element.attr('orderby');
    }

    if (bbcrm_element.attr('style')) {
        data.style = bbcrm_element.attr('style');
    }
    if (bbcrm_element.attr('jsTree')){
	data.jsTree = bbcrm_element.attr('jsTree');
    }
    saveCSRF=jQuery.ajaxSetup().headers;  // Save the csrf header (do we need to or was this added by accident)

    delete jQuery.ajaxSetup().headers;

    jQuery.ajax({
        url: api_path + bbcrm_element.attr('api_string'),
        method: 'POST',
        data: data,
        success: function( response ) {

            console.log( response );
            var json_obj = JSON.parse( response );

            bbcrm_element.after('<div class="bbcrm-window">'+json_obj.body.html+'</div>');

            var formid = bbcrm_element.next().find('form:first').attr('id');

            if(json_obj.body.listing_id){

                var id = new Array();
                var names = new Array();

                id.push(json_obj.body.listing_id);
                names.push(json_obj.body.listing_generic_name);

                if (getCookie('listing')) {
                    if (jQuery.inArray(json_obj.body.listing_id, JSON.parse(getCookie('listing'))) < 0) {
                        id = id.concat(JSON.parse(getCookie('listing')));
                        setCookie('listing', JSON.stringify(id), 1);
                    }
                }else {
                    setCookie('listing',JSON.stringify(id),1);
                }

                if (getCookie('listing_names')) {
                    if (jQuery.inArray(json_obj.body.listing_generic_name, JSON.parse(getCookie('listing_names'))) < 0) {
                        names = names.concat(JSON.parse(getCookie('listing_names')));
                        setCookie('listing_names', JSON.stringify(names), 1);
                    }
                } else {
                    setCookie('listing_names',JSON.stringify(names),1);
                }

            }

            if(json_obj.body.buyer){
                //is buyer object is sent, populate the form
                userobj = json_obj.body.buyer;
                jQuery.each(userobj,function(key,value){
                    if(value && value != ' ' && value != ''){

                        if(jQuery("#"+key).is(':checkbox') && value == '1'){
                            jQuery("#"+key).prop('checked', true);
                        }

                        jQuery("#"+key).val(value);


                    } else {
                        if(jQuery("#"+key).is('select')){
                            jQuery("#"+key).prepend("<option value='' selected>Choose one</option>")
                        }
                    }
                })

            }

            if(json_obj.body.search_params) {
                var search = json_obj.body.search_params;
                jQuery.each(search, function(key, val) {
                    //alert( val.field+"="+val.value );
                    jQuery(".bbcrm-search-form").find("input#"+val.field).val( val.value );
                    jQuery(".bbcrm-search-form").find("select#"+val.field).val( val.value );

                    jQuery.each(val.value.split(","), function(i,e){
                        jQuery(".bbcrm-search-form").find("select[multiple]#"+val.field+" option[value='" + e + "']").prop("selected", true);
                    });
                    jQuery(".bbcrm-search-form").find("input[type=number]#"+val.field+"_min").val( val.value.split(",")[0] );
                    jQuery(".bbcrm-search-form").find("input[type=number]#"+val.field+"_max").val( val.value.split(",")[1] );

                });
            }

            if( api_string == "buyerregistration" ) {
                //alert(getCookie('listing'));

                var listing_ids_array = JSON.parse(getCookie('listing'));
                var listing_names_array = JSON.parse(getCookie('listing_names'));
                //listing_ids = listing_ids.replace("[", "");
                //listing_ids = listing_ids.replace("]", "");
               // listing_ids = listing_ids.replace(/['"\[\]]+/g, '');
               // listing_names = listing_names.replace(/['"\[\]]+/g, '');

               // listing_ids_array = listing_ids.split(",");
                //listing_names_array = listing_names.split(",");

                //alert( listing_ids );

                var listing_selection = '<div id="field_c_listing" class="form-group">'+
                    '<label class="col-sm-3 control-label" for="listingid">Listing:<span class="bbcrm-required-asterisk">*</span> </label>'+
                    '<div class="col-sm-9"> '+
                    '<select id="listingid" class="form-control" form="'+formid+'" name="listingid" type="link" required="">'+
                    '<option value="">Select a Listing</option>';
                if( getCookie('listing_names') ) {
                    for( var idx = 0; idx < listing_ids_array.length; idx++ ) {
			url = new URL(window.location.href);
			let selected = "";
			
			if (url.searchParams.get('listing_id') && listing_ids_array[idx] == url.searchParams.get('listing_id'))
				selected = "selected";
                        listing_selection += '<option value="'+listing_ids_array[idx]+'" '+selected+'>'+listing_names_array[idx]+'</option>';
                    }
                }


                listing_selection +=			'</select>'+
                    '</div>'+
                    '<span class="bbcrm-error-message  col-sm-9 col-sm-offset-3"></span>'+
                    '</div>'

                jQuery("#field_c_broker").before( listing_selection );
            }

            //populate search form fields if passed on query string
            if(api_string.includes('search')) {
                populateSearchFormFields();
            }

            limitText();

            jQuery(document).on('keypress','#Keywords',function(e) {
                console.log(e);
                if(e.which === 13){
                    search_with_redirect( jQuery(this) )
                }
            });

        }
    });
}

//sort function, pasted from stackoverflow
function dynamicSortByAttr(property) {
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        /* next line works with strings and numbers, 
         * and you may want to customize it to your needs
         */
        var result = (a.attr(property) < b.attr(property)) ? -1 : (a.attr(property) > b.attr(property)) ? 1 : 0;
        return result * sortOrder;
    }
}
function renderTags(){
    var tagsToExecute = []

    jQuery('bbcrm').each( function() {

        var bbcrm_element = jQuery(this);
        tagsToExecute.push(bbcrm_element);

    });

    /* --------- step 3: sort the list of tags by the 'order' attribute ------------ */
    //a) check if the order attribute is set, otherwise set it to 0
    for (let i = 0; i < tagsToExecute.length; ++i) {
        if(!tagsToExecute[i].attr('order')) {
            tagsToExecute[i].attr('order',0);
        }
    }

    //b) sort the array by the order attribute
    tagsToExecute.sort(dynamicSortByAttr('order'));


    /* --------- step 4: process the tags in order ------------ */
    for (let i = 0; i < tagsToExecute.length; ++i) {
        processTag(tagsToExecute[i]);
    }

}


jQuery(document).ready( function() {

    /* ----- step 1: add BBCRM footer to the page */
    jQuery('body').append('<div class="bbcrm-footer col-md-12" style="clear: both; display: block;">Powered by <a href="http://www.businessbrokerscrm.com">Business Brokers CRM</a></div>');
    jQuery('.bbcrm-footer').css("display", "block");
    renderTags();

    jQuery(document).on('submit', "#bbcrm_loginForm", function (e) {
        e.preventDefault();

        jQuery.ajax({
            url: api_path+'auth',
            method: 'POST',
            data: {
                login_data: jQuery(".bbcrm_loginForm").serialize(),
                authorization: getCookie('auth_token')
            },
            success: function (response) {
                response = JSON.parse(response);
                if(response.body.error){
                    //display error message
                    jQuery('.help-block').text(response.body.error);
                } else {
                    //set cookie
                    setCookie('auth_token',response.body.token,1);

                    window.location.replace(response.body.href);
                }
            }
        });

    });


    jQuery(document).on('submit', "#bbcrm_loginBar", function (e) {
        e.preventDefault();

        jQuery.ajax({
            url: api_path+'auth',
            method: 'POST',
            data: {
                login_data: jQuery(".bbcrm_loginBar").serialize(),
                authorization: getCookie('auth_token')
            },
            success: function (response) {
                response = JSON.parse(response);
                if(response.body.error){
                    //display error message
                    jQuery('.help-block-loginbar').html(response.body.error);
                } else {
                    //set cookie
                    setCookie('auth_token',response.body.token,1);

                    window.location.replace(response.body.href);
                }
            }
        });

    });

    jQuery(document).on('click', "#logout", function (e) {
        e.preventDefault();

        eraseCookie('auth_token');

        location.reload();

    });

    jQuery(document).on('click', "#show-login", function (e) {
        e.preventDefault();

        jQuery("#bbcrm_loginBar").show();
        jQuery("#cancel").show();
        jQuery("#show-login").hide();
    });

    jQuery(document).on('click', "#cancel", function (e) {
        e.preventDefault();

        jQuery("#bbcrm_loginBar").hide();
        jQuery("#cancel").hide();
        jQuery("#show-login").show();
    });

    jQuery(document).on('click', "#contactsellerbutton", function (e) {
        //e.preventDefault();

        //setCookie("contactlisting", "1", 1);
        var idlist = window.location.search.split('listing=');
        var contactlisting = idlist[1][0]+idlist[1][1]+idlist[1][2];
        setCookie('contactlisting', contactlisting, 1);
        //console.log("sellerbutton", getCookie('contactlisting'));
    });


    jQuery(document).on('change',"input[type=checkbox]", function(e) {
        if(this.checked) {
            jQuery(this).val(1);
        } else {
            jQuery(this).val(0);
        }
    });

    jQuery(document).on('change', 'select', function (e) {
        var self = jQuery(this);
    	var childID = jQuery(this).attr('child');
        var toChange = jQuery(this).parent().parent().parent().find("[dropdown-id="+childID.toString()+"]");
        jQuery.ajax({
            url: api_path+'dynamicdropdown',
            type:"POST",
            data:{
                "val" : jQuery(this).val(),
                "dropdownId" : jQuery(this).attr('dropdown-id')
            },
            success: function (response) {
                response = JSON.parse(response);
                jQuery(toChange).empty().append(response.body.html);
            }
        });
    });
	if(window.location.search!=='' && jQuery('bbcrm[api_string=submitsearchtoolnew]').length == 0){
		search_interval = setTimeout(function(){
			interval_function(); 
		}, 1000)
	}
});
/* Added by Sami for searching with Query Parameters */
function interval_function(){
	if(jQuery('.bbcrm-listing-searchresults-wrapper').length){
		clearTimeout(search_interval);
		search_with_query_params();
	}
}
function search_with_query_params() {
	var form_data = window.location.search.slice(1);
	var resperpage = parseInt(jQuery('.bbcrm-search-form').find('form:first').find("#resultsperpage").val());
    console.log('h23');
	
	jQuery.ajax({
		url: api_path+'submitsearchtoolNew',
		method: 'POST',
		data: { search: form_data,
				searchtoolid: jQuery('.bbcrm-search-tool').attr('id')},
		success: function( response ) {
			console.log( response );
			var r = JSON.parse( response )
			//this_button.parents('.bbcrm-search-tool:first').siblings('.bbcrm-listing-searchresults-wrapper').remove();
			var resultswrap = jQuery('.bbcrm-listing-searchresults-wrapper');
			resultswrap.empty();
			resultswrap.append(r.body.html);
			jQuery('html, body').animate({
				scrollTop: (resultswrap.offset().top - 200)
			}, 500);
			jQuery('.bbcrm-search-form').find('form:first').find("#pagenumber").val(1);
			var curr_page = parseInt(jQuery('.bbcrm-search-form').find('form:first').find("#pagenumber").val());
			if( curr_page - 1 <= 0 ) {
				jQuery('.bbcrm-listing-searchresults-wrapper').find('.pagination').find('.previous.btn').hide();
			}
			var currlistnum = resultswrap.find('#bbcrm-listings-searchresults').find('.listing-search-result').length;
			if(resperpage > currlistnum) {
				resultswrap.find('.pagination').find('.next.btn').hide();
			} else {
				resultswrap.find('.pagination').find('.next.btn').show();
			}
			if(currlistnum == 0) {
				resultswrap.find('.pagination').find('.next.btn').hide();
				resultswrap.find('.pagination').find('.previous.btn').hide();
			}
			//this_button.parents('.bbcrm-search-tool:first').after('<div class="bbcrm-listing-searchresults-wrapper">'+ r.body.html +'</div>');

			limitText();

		}
	});
}

function setCookie(cname, cvalue, exdays) {
    try{
        var d = new Date();
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
        var expires = "expires="+ d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";

        return true;

    } catch(error) {
        return error;
    }

}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
}

function eraseCookie(cname) {
    try{
        document.cookie = cname+'=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        return true;
    } catch(error){
        return error;
    }
}

/**
 * This function will attempt to set all serach form fields values based on parameters passed in on the query string
 * Used for search forms which are on a redirected search page
 * Created by Jonny 2022-04-27
 */
 function populateSearchFormFields() {
	//get query params - note assumes that each param is passed only once
	const params = new URLSearchParams(window.location.search);

	//cycle through them
	for (const param of params) { //returns an array, [0]=name, [1]=value
		if(param[1] != '') { //parameter has a value
			//attempt to find the related field using jquery
			let field = jQuery(`input[name="${param[0]}"][type!="hidden"],select[name="${param[0]}"][type!="hidden"]`)
			
			//set field value
			field.val(param[1]);
		}
	}
}
