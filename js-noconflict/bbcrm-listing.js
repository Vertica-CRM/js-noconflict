jQuery.fn.exists = function () {
    return this.length > 0;
};

let contact = null;

jQuery(document).ready ( function(){

    setTimeout(function(){
        if (jQuery('#galleria').exists()) {
            Galleria.run('#galleria', {
                height: 400,
                width:750,
                debug:true
            });
        } else {
            console.log("not found");
        }

    }, 1500);


    jQuery(document).on('click', 'input[id*=\'add-to-data-room\']', function (e) {
	e.preventDefault();
	jQuery(this).prop('disabled', true);
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




    jQuery(document).on('click', '.bbcrm-download-orig', function (e) {
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
                download(response.data, response.name);
            }
        });
    });

  jQuery(document).on('click', '.bbcrm-download', function (e) {
        request=new XMLHttpRequest();
        request.open("GET", "/viewer/viewer.html", false); 
        request.send();
        // Test to see if the viewer is on the host (ie it is bbcrm hosted)
        // If not check load viewerhost from bbcrm_contants
        if (request.status == 200) viewerhost='/viewer';
        else
             viewerhost=document_viewer;  // Set in bbcrm_constants
        var mimetype=decodeURIComponent(atob(jQuery(this).attr('id')).split('&')[3].split('=')[1]);  // id is a b64encoded array, 4th element is mimetype
        if (mimetype === 'application/pdf' || mimetype === 'application/msword' || mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        || mimetype === 'image/jpeg' || mimetype === 'image/png') {
        var viewerWindow=window.open('', 'PDF Viewer', 'height=768,width=1224');
        e.preventDefault();
        jQuery.ajax({
            url: api_path + 'display',
            method: 'POST',
            data: {
                dl: e.target.id,
                authorization: getCookie('auth_token')
            },
            success: function (response) {
                response = JSON.parse(response);
                //viewerWindow.location.replace('https://api.verticacrm.com/pdf.js/web/viewer.html?file=' + encodeURIComponent(response.file));
                viewerWindow.location.replace(viewerhost+'/viewer.html?file=' + encodeURIComponent(response.file));
            }
        });
        }
        else {
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
                download(response.data, response.name);
            }      
        });  
        }
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
                        jQuery(element).parents('div:first').parent().children('.portfoliostatus').remove();
                        jQuery(element).parents('div:first').parent().prepend(response.body.html);
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

    jQuery(document).on('click', '.contact', function (e) {
        setCookie('clicked', jQuery(this).data("id"), 1);
    });

    jQuery(document).on('click', '.sign-nda-button', function (e) {

        var listid = jQuery(this).data('id');

        jQuery( "#bbcrm-nda" + listid).empty();
        jQuery( "#signaturebox" + listid).empty();

        jQuery.ajax({
            url: api_path+'getnda',
            method: 'POST',
            data: {
                single_nda: true,
                authorization: getCookie('auth_token'),
                listingid: jQuery(this).data('id')
            },
            success: function( response ) {

                /* format:
                 * code
                 * message
                 * type ( = document)
                 * body
                    html
                    form_id
                 */
                 
                nda_json = JSON.parse( response );
                
                var nda_details = nda_json.body;

                var html_unescape = JSON.parse(nda_details.html);

                contact = nda_details.buyer;

                let div = '<div id="nda" class="bbcrm-element">' + html_unescape.text + '</div>';
                
                jQuery( "#bbcrm-nda" + listid).append(div);
                jQuery( "#signaturebox" + listid).append(nda_details.signaturebox);

                jQuery("#signature").jSignature({'height': '150px','width': '450px'})

                jQuery("#signature64").attr("id", "signature64" + listid);
                jQuery("#signature64" + listid).attr("name", "signature64" + listid);

                jQuery("#bbcrm-nda" + listid).scroll(function() {
                   if(Math.ceil(jQuery(this).scrollTop()) + jQuery(this).height()  >= jQuery(this)[0].scrollHeight-20 ) {
                       jQuery("#bbcrm-reg-message").slideUp();
                       jQuery("#bbcrm-reg-accept").slideDown();
                   }
                });
            }
        });

    });

});

function submitNda(portfolioId){

    if(jQuery("#accept-sig").val().toLowerCase() != contact.toLowerCase() ){
        if (!jQuery("#accept-sigerr").length){
            jQuery("#accept-text").append("<div id='accept-sigerr' class='formerr'>This field must match your name. Please check your entries.</div>");
        }
        return false;
    } else {
        jQuery("#accept-sigerr").remove();
    }

    if(!jQuery("#acceptance").prop("checked") ){
        if (!jQuery("#acceptanceerr").length){
            jQuery("#accept-text").append("<div id='acceptanceerr' class='formerr'>Please check the I accept checkbox in order to continue.</div>");
        }
        return false;
    } else {
        jQuery("#acceptanceerr").remove();
    }

     if( jQuery("#signature").jSignature('getData', 'native').length == 0) {
        if (!jQuery("#sigerr").length){
            jQuery("#sigwrap").prepend("<div id='sigerr' class='formerr'>Please sign it below.</div>");
        }
        return false;
     } else {
        jQuery("#sigerr").remove();
    }


    sigdata = jQuery("#signature").jSignature("getData");
    listingid=jQuery('.sign-nda-button').data('id');
   // let nda = jQuery('#bbcrm-nda'+listingid+'>#nda').html(); this caused a bug when more then one nda is unsigned in dataroom and the one that is being signed is not the first.
   nda = jQuery('#nda.bbcrm-element').html();


    jQuery.ajax({
        url: api_path+'submitSignedNda',
        method: 'POST',
        data: {
            data: {
                signature64: sigdata,
            },
            document: nda,
            authorization: getCookie('auth_token'),
            portfolioId: portfolioId
        },
        success: function( response ) {
            console.log(response);
            response = JSON.parse(response);
            if (response.code === 200) {
                window.location.reload();
            }
        }
    });

}
