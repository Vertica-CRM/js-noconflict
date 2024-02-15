/*HELLO*/
function toggle_advanced_search( this_button ) {
		this_button.parents('.bbcrm-search-form:first').find('.advanced').slideToggle(200);
}

function search( this_button ) {
	var form_data = this_button.parents('form:first').serialize();
	
	jQuery.ajax({
		url: api_path+'submitsearchtool',
		method: 'POST',
		data: { search: form_data,
				searchtoolid: this_button.parents("div.bbcrm-search-tool:first").attr("id")},
		success: function( response ) {
			console.log( response );
			var r = JSON.parse( response )
			this_button.parents('.bbcrm-search-tool:first').siblings('.bbcrm-listing-searchresults-wrapper').remove();
			this_button.parents('.bbcrm-search-tool:first').after('<div class="bbcrm-listing-searchresults-wrapper">'+ r.body.html +'</div>');

			limitText();

		}
	});
}

function search_with_redirect( this_button, do_redirect ) {

	/* Updated by Jonny 24/11/2021
	 * If there is no wrapper for search results then will redirect to /search-results page instead
	*/
	if(jQuery("div.bbcrm-listing-searchresults-wrapper").length == 0 || do_redirect == true) { //div for results does not exist as tag was not added on this page, either on purpose or by accident
		console.log('BBCRM: Search results wrapper not found so redirecting to /search-results page');

		//identify the form
		//cycle throug the form fields of type input
		//get their name and value

		var form_data = this_button.parents('form:first').serialize();
		var search_path = "/search-results"+"?"+form_data;
		window.location.href = search_path;
	}

	var form_data = this_button.parents('form:first').serialize();
	var form_data_array = this_button.parents('form:first').find('input:not([type=hidden])').serializeArray();
	var search_path = "/"+this_button.parents('form:first').attr("redirect")+"?"+form_data;
	var resperpage = parseInt(jQuery('.bbcrm-search-form').find('form:first').find("#resultsperpage").val());
	/*
	if(parseInt(jQuery("#c_listing_askingprice_c_min").val()) > parseInt(jQuery("#c_listing_askingprice_c_max").val())) {
		alert('Price From must be lower than Price To');
		return false;
	}
	*/

	for(var input in form_data_array) {
		if(parseInt(form_data_array[input].value) < 0) {
			alert(form_data_array[input].name + " field must be positive!");
			return false;
		}
	}

	jQuery('.bbcrm-search-range').each(
		function (index, element) {
			lowerValue=parseInt(jQuery('.lower select')[index].value);
			upperValue=parseInt(jQuery('.upper select')[index].value);
			if (lowerValue > upperValue) {
				title=jQuery(element).data('title');
				alert(title+' From must be lower than '+title+' To');
				return false;
			}
		}
	);
	
	//window.location.href = search_path;
	//console.log( this_button );
	searchElement = form_data;
	fetching = false;
	jQuery.ajax({
		url: api_path+'submitsearchtoolNew',
		method: 'POST',
		data: { search: form_data,
				searchtoolid: this_button.parents("div.bbcrm-search-tool:first").attr("id"),
                presets: jQuery('#presets').val(),
                sort: jQuery('#sort').val(),
        },
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

function clear_search( this_button ) {
	var search_form = this_button.parents('form:first');
	
	search_form.find("select").val("");
	search_form.find("input").val("");
	
}

function bbcrm_search_next( this_button ) {
    // If bbcrm-search-form is not present substitute with the form from bbcrm-all-listings
    if (jQuery('.bbcrm-search-form').length == 0 ) jQuery('.bbcrm-search-params').addClass('bbcrm-search-form');
	var curr_page = parseInt(jQuery('.bbcrm-search-form').find('form:first').find("#pagenumber").val());
	var resperpage = parseInt(jQuery('.bbcrm-search-form').find('form:first').find("#resultsperpage").val());
	
	jQuery('.bbcrm-search-form').find('form:first').find("#pagenumber").val( curr_page + 1 );
	
		//NOTE search results will also need to validate LIMIT and OFFSET
	
	
	// submit search form, which may or may not be the full form, or just the pagination (depends on whether I'm submitting 
	var form_data = jQuery('.bbcrm-search-form').find('form:first').serialize();
    var template =jQuery('bbcrm[api_string=SubmitSearchToolNew]').attr('template');
	
	jQuery.ajax({
		url: api_path+'submitsearchtoolNew',
		method: 'POST',
		data: { search: form_data,
				searchtoolid: jQuery('bbcrm-search-form').parents('.bbcrm-search-tool').attr('id'),
                template: template,
                presets: jQuery("#presets").val(),
                sort: jQuery("#sort").val(),
        },
		success: function( response ) {
			console.log( response );
			var r = JSON.parse( response )
			var resultswrap = jQuery('.bbcrm-listing-searchresults-wrapper');
			resultswrap.empty();
			resultswrap.append(r.body.html);
			jQuery('html, body').animate({
				scrollTop: (resultswrap.offset().top - 200)
			}, 500);
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
			resultswrap.find('.pagination').find('.previous.btn').show();
			//this_button.parents('.bbcrm-search-tool:first').after('<div class="bbcrm-listing-searchresults-wrapper">'+ r.body.html +'</div>');

			limitText();
		}
	});
}


function bbcrm_search_page( pageselected ) {
    // If bbcrm-search-form is not present substitute with the form from bbcrm-search=params
    if (jQuery('.bbcrm-search-form').length == 0 ) jQuery('.bbcrm-search-params').addClass('bbcrm-search-form');
	var curr_page = parseInt(jQuery('.bbcrm-search-form').find('form:first').find("#pagenumber").val());
	var resperpage = parseInt(jQuery('.bbcrm-search-form').find('form:first').find("#resultsperpage").val());

	
	jQuery('.bbcrm-search-form').find('form:first').find("#pagenumber").val( pageselected );
	
		//NOTE search results will also need to validate LIMIT and OFFSET
	
	
	// submit search form, which may or may not be the full form, or just the pagination (depends on whether I'm submitting 
	var form_data = jQuery('.bbcrm-search-form').find('form:first').serialize();

    var template =jQuery('bbcrm[api_string=SubmitSearchToolNew]').attr('template');
	
	jQuery.ajax({
		url: api_path+'submitsearchtoolNew',
		method: 'POST',
		data: {
            search: form_data,
            searchtoolid: jQuery('bbcrm-search-form').parents('.bbcrm-search-tool').attr('id'),
            template: template,
            presets: jQuery('#presets').val(),
            sort: jQuery('#sort').val(),
        },
		success: function( response ) {
			console.log( response );
			var r = JSON.parse( response )
			var resultswrap = jQuery('.bbcrm-listing-searchresults-wrapper');
			resultswrap.empty();
			resultswrap.append(r.body.html);
			jQuery('html, body').animate({
				scrollTop: (resultswrap.offset().top - 200)
			}, 500);
			var currlistnum = resultswrap.find('#bbcrm-listings-searchresults').find('.listing-search-result').length;
			if(resperpage > currlistnum) {
				resultswrap.find('.pagination').find('.next.btn').hide();
			} else {
				resultswrap.find('.pagination').find('.next.btn').show();
			}
			if(currlistnum === 0) {
				resultswrap.find('.pagination').find('.next.btn').hide();
				resultswrap.find('.pagination').find('.previous.btn').hide();
			}
			resultswrap.find('.pagination').find('.previous.btn').show();
			//this_button.parents('.bbcrm-search-tool:first').after('<div class="bbcrm-listing-searchresults-wrapper">'+ r.body.html +'</div>');

			limitText();
		}
	});
}

function bbcrm_search_previous( this_button ) {
    // If bbcrm-search-form is not present substitute with the form from bbcrm-all-listings
    if (jQuery('.bbcrm-search-form').length == 0 ) jQuery('.bbcrm-search-params').addClass('bbcrm-search-form');
	//alert( this_button.html() );
	
	// validate hidden pagination field, in case of page_number < 0
	//var curr_page = parseInt(this_button.parents('.bbcrm-search-tool:first').find("#pagenumber").val());
	//var curr_page = parseInt(this_button.parents('.bbcrm-window:first').find('.bbcrm-search-tool:first').find("#pagenumber").val());
	var curr_page = parseInt(jQuery('.bbcrm-search-form').find('form:first').find("#pagenumber").val());
	//alert( curr_page );
	
	if( isNaN( curr_page ) || curr_page <= 0  ) { curr_page = 1; }
	if( curr_page - 1 <= 0 ) {
		return false;
	}
	
	//this_button.parents('.bbcrm-window:first').find('.bbcrm-search-tool:first').find("#pagenumber").val( curr_page-1 );
	jQuery('.bbcrm-search-form').find('form:first').find("#pagenumber").val( curr_page - 1 );
	
		//NOTE search results will also need to validate LIMIT and OFFSET
	
	// iterate hidden pagination
	
	// submit search form, which may or may not be the full form, or just the pagination (depends on whether I'm submitting 
	//var form_data = this_button.parents('.bbcrm-window:first').find('.bbcrm-search-tool:first').find('form:first').serialize();
	var form_data = jQuery('.bbcrm-search-form').find('form:first').serialize();
	var template =jQuery('bbcrm[api_string=SubmitSearchToolNew]').attr('template');
	
	//alert( form_data );
	jQuery.ajax({
		url: api_path+'submitsearchtoolNew',
		method: 'POST',
		data: { search: form_data,
				//searchtoolid: this_button.parents('.bbcrm-window:first').find('.bbcrm-search-tool:first').attr("id")},
				searchtoolid: jQuery('bbcrm-search-form').parents('.bbcrm-search-tool').attr('id'),
                template: template,
                presets: jQuery("#presets").val(),
                sort: jQuery("#sort").val(),
        },
		success: function( response ) {
			console.log( response );
			var r = JSON.parse( response )
			var resultswrap = jQuery('.bbcrm-listing-searchresults-wrapper');
			resultswrap.empty();
			resultswrap.append(r.body.html);
			jQuery('html, body').animate({
				scrollTop: (resultswrap.offset().top - 200)
			}, 500);
			//this_button.parents('.bbcrm-search-tool:first').after('<div class="bbcrm-listing-searchresults-wrapper">'+ r.body.html +'</div>');
			if( curr_page - 1 <= 1) {
				jQuery('.bbcrm-listing-searchresults-wrapper').find('.pagination').find('.previous.btn').hide();
			}
			var currlistnum = resultswrap.find('#bbcrm-listings-searchresults').find('.listing-search-result').length;
			if(currlistnum == 0) {
				resultswrap.find('.pagination').find('.next.btn').hide();
				resultswrap.find('.pagination').find('.previous.btn').hide();
			}
			limitText();
		}
	});
	
}


jQuery(document).on('keypress','#Keywords',function(e) {
     if(e.which === 13){
       search_with_redirect( jQuery(this) )
     }
});

jQuery(document).ready(function() {
	setTimeout(function() {
		var curr_page = parseInt(jQuery('.bbcrm-search-form').find('form:first').find("#pagenumber").val());
		if( curr_page - 1 <= 0 ) {
			jQuery('.bbcrm-listing-searchresults-wrapper').find('.pagination').find('.previous.btn').hide();
		}
		//jQuery(".buttons").find(".real-btn.btn").trigger("click");
	}, 2000);
});



