let qrCodeSmall;
let qrval_small_image_param = {
	width: 250,
	height: 250,
	image: null,
	type: "canvas",
	data: "",
	dotsOptions: {
		color: "#000000",
		type: "square"
	},
	backgroundOptions: {
		color: "#ffffff",
	},
	imageOptions: {
		crossOrigin: "anonymous",        
		imageSize : 0.4,
		margin: 0,
		hideBackgroundDots : true
	},
	qrOptions: {
		errorCorrectionLevel: "L"   
	},
	cornersSquareOptions : {
		type: "square"
	},
	cornersDotOptions : {
		type: "square"
	}
};

function showLoader() {
	$("#loading").show();
}

function hideLoader() {
	$("#loading").fadeOut(800);
}

const genQRCode = (qr_code_url) => {
	if (qr_code_url == "") {
		showDialog("올바른 정보를 입력해 주세요.", null);
		return;
	}	

	showLoader();
	GATAGM("genQRClick", "service", qr_code_url);
	qrCodeSmall.update({data : qr_code_url});
	$("#resultArea").show();
	
	showDialog("QR코드가 생성되었습니다.<br>스마트폰으로 촬영하여 동작을 확인해 보세요!", null);	
	hideLoader();
}

const initQRCode = () => {
	showLoader();

	qrCodeSmall = new QRCodeStyling(qrval_small_image_param);
	qrCodeSmall.append(document.getElementById("qr_sm_image_1"));		
	
	let colorInputfg = document.querySelector('#color_fg');
	colorInputfg.addEventListener('input', () =>{	  
	  qrCodeSmall.update({dotsOptions : {color : colorInputfg.value}});
	});
  
	let colorInputbg = document.querySelector('#color_bg');
	colorInputbg.addEventListener('input', () =>{
	  qrCodeSmall.update({backgroundOptions : {color : colorInputbg.value}});
	});

	$("#downloadButton").click(function () {
		let form_image_kind = $("#form_image_kind option:selected").val();
		qrCodeSmall.download({ name: "AQR", extension: form_image_kind });
	});

	$("#form_qr_shape").change(function() { 
	  let param = {
		dotsOptions : {type : this.value},
		cornersSquareOptions : {type : this.value},
		cornersDotOptions : {type : this.value}
	  };    
	  
	  let cdoOption = "square";
	  if (this.value == "dots") cdoOption = "dot";
	  else cdoOption = this.value;
	  
	  param.cornersSquareOptions.type = cdoOption;
	  
	  if (this.value == "extra_rounded") cdoOption = "dot";
	  param.cornersDotOptions.type = cdoOption;
  	  
	  qrCodeSmall.update(param);
	});
  
	$("#qr_image_input").change(function(e){
	  var reader = new FileReader();
	  reader.readAsDataURL($('#qr_image_input')[0].files[0]);
	  reader.onload = function () {
		qrCodeSmall.update({image:reader.result});
		$("#qr_image_input").hide();
		$("#cancelImageButton").show();
	  };
	  reader.onerror = function (error) {
		console.log('Error: ', error);
		$("#cancelImageButton").hide();
	  };
	});
  
	$("#cancelImageButton").click(function() {	  
	  qrCodeSmall.update({image:null });
	  $("#qr_image_input").val("");
	  $("#qr_image_input").show();
	  $("#cancelImageButton").hide();
	});
  
	$("#resetButton").click(function() {
	  $("#form_url_data").val("");
	  $("#qr_image_input").val("");
	  $("#qr_image_input").show();
	  $("#cancelImageButton").hide();
	  $("#color_fg").val("#000000");
	  $("#color_bg").val("#ffffff");
	  $("#form_qr_shape").val("square").prop("selected", true);	  
	  qrCodeSmall.update(qrval_small_image_param);
	});

	hideLoader();
  }

  function escape_string(string) {
		let to_escape = ['\\', ';', ',', ':', '"'];
		let hex_only = /^[0-9a-f]+$/i;
		let output = "";
		for (var i=0; i<string.length; i++) {
			if($.inArray(string[i], to_escape) != -1) {
				output += '\\'+string[i];
			}
			else {
				output += string[i];
			}
		}		
		return output;
  }

  function generateWIFIData() {
	let ssid = $('#form_ssid').val();
	if(isSet(ssid) == false || ssid == "") {		
		return "";
	}

	let hidden = $('#form_hidden').is(':checked');
	let enc = $('#form_enc').val();	
	let key = "";
	if (enc != 'nopass') {
		key = $('#form_password').val();		
	}
	
	var qrstring = 'WIFI:S:'+escape_string(ssid)+';T:'+enc+';P:'+escape_string(key)+';';
	if (hidden) {
		qrstring += 'H:true';
	}
	qrstring += ';';
	return qrstring;
  }

  (function($) {
	initQRCode();	

	$("#applyWiFiButton").click(function() {
		let genStr = generateWIFIData();
		if (genStr == "") {
			showDialog("올바른 WiFi 정보를 입력해 주세요.", null);
			return;
		}

		genQRCode(genStr);
	});

	$("#form_qr_shape").append('<option value="dots">동그라미</option>');
    $("#form_qr_shape").append('<option value="square" selected>사각형</option>');
    $("#form_qr_shape").append('<option value="extra-rounded">약간둥글게</option>');

	$("#form_image_kind").append('<option value="png">PNG</option>');
    $("#form_image_kind").append('<option value="jpg">JPG</option>');
    $("#form_image_kind").append('<option selected value="svg">SVG</option>');

	$('#selSites').change(function () {
		let targetVal = $(this).val();
		let targetUrl = "";

		targetsInfo.forEach(function (t) {
			if (t[0] == targetVal) {
				targetUrl = t[1];
			}
		});

		if (targetUrl != "")
			window.open(targetUrl, "_blank");
	});

})(jQuery);


function GATAGM(event_name, category, label) {    
    gtag(
        'event', event_name, {
        'event_category': category,
        'event_label': label        
    }
    );
}

function showDialog(msg, callback) {
	$('#askModalContent').html(msg);
	$('#askModal').modal('show');

	if (callback == null) return;

	$('#askModalOKButton').off('click');
	$('#askModalOKButton').click(function () {
			$('#askModal').modal('hide');
			callback();
	});
}


function isSet(value) {
    if (typeof (value) === 'number')
        return true;
    if (value == "" || value == null || value == "undefined" || value == undefined)
        return false;
    return true;
}

function showPrivacyDialog() {	
	$('#modal_title_content').text("APLY 개인정보처리방침");
    $('#modal_body_content').load("privacy_for_email.html");
    $('#modal-3').modal('show');
}


const targetsInfo = [
	["aply", "https://aply.biz/"],
	["aqr", "https://aqr.aplx.link"],
	["recruit", "https://home.aply.biz/recruit/index.html"],
	["duni", "https://duni.io"],
	["dunipilot", "https://pilot.duni.io"],
	["dunistock", "https://dunistock.com"],
	["dromi", "https://dromi.aply.biz"],
	["aplx", "https://home.aplx.link"],
	["dkdk", "https://dkdk.io"],
	["drdr", "https://drdr.io"],
	["blog", "https://blog.naver.com/PostList.naver?blogId=jebo78&categoryNo=38&from=postList"],
	["catchme", "https://catchme.aply.biz"],
	["kiosk", "https://kiosk.aply.biz"],
	["polaris", "https://polarisconsulting.modoo.at"],
	["gps", "https://gps.aply.biz"]
];