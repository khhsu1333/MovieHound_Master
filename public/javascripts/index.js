// SECTION: 變數===============================================

// SECTION: DOM===============================================

// DOM Ready
$(document).ready(function() {
	$('#loading').hide();
	$('#result').hide();
});

// 啟動搜尋按鈕
$('#btnSearchMovie').on('click', searchMovie);

// 啟動按鈕特效
document.getElementById("uploadBtn").onchange = function () {
    document.getElementById("uploadFile").value = this.value;
};

// 啟動'開始'按鈕
$("#link").on('click', function(e) {
	// prevent default anchor click behavior
	e.preventDefault();

	// store hash
	var hash = this.hash;

	// animate
	$('html, body').animate({
		scrollTop: $(this.hash).offset().top
	}, 800, function(){
		// when done, add hash to url
		window.location.hash = hash;
	});
});


// SECTION: Functions============================================

function searchMovie(event) {
	event.preventDefault();

	if($('#uploadBtn')[0].files[0] == undefined) return false;

	// 讓按鈕無效化
	$('#btnSearchMovie').attr("disabled", true);
	$('#result').hide();
	$('#loading').fadeIn();


	var data = new FormData();
    	data.append('snapshot', $('#uploadBtn')[0].files[0]);

	$.ajax({
		type: 'POST',
		data: data,
		url: '/search',
		dataType: 'JSON',
		cache: false,
		contentType: false,
		processData: false,
		success: function(data, textStatus, jqXHR)
		{
			if(typeof data.error === 'undefined') {
				//alert('Search complete. Found ' + data.length + ' data.');
				if(data.length != 0)
					$('#msg').attr('style', 'background: #5cb85c;');
				else
					$('#msg').attr('style', 'background: #f0ad4e;');
				$('#msg').text('搜尋到 ' + data.length + ' 筆符合電影');

				// Success get snapshot list
				tableContent = '';
				i = 1;
				$.each(data, function() {
					tableContent += '<tr>';
					tableContent += '<td>' + i + '</td>';
					tableContent += '<td><image src="http://' + this.slave + '/image/' + this.filename + '" /></td>';
					tableContent += '<td>' + this.movie + '</td>';
					tableContent += '<td>' + this.time + '</td>';
					similar = '0%';
					if(this.distance == 0)
						similar = '100%';
					else if(this.distance == 1)
						similar = '85%';
					else if(this.distance == 2)
						similar = '70%';
					else if(this.distance == 3)
						similar = '40%';
					else if(this.distance == 4)
						similar = '20%';
					else
						similar = '10%';
					tableContent += '<td>' + similar + '</td>';
					tableContent += '</tr>';
					i += 1;
				});

				// 讓讀取特效消失
				$('#loading').hide();
				// Inject the whole content string into our existing HTML table
				$('#result table tbody').html(tableContent);
				$('#result').fadeIn();
			}
			else {
				$('#msg').attr('style', 'background: #f0ad4e;');
				$('#msg').text(data.error);

				// 讓讀取特效消失
				$('#loading').hide();
				$('#result').fadeIn();
			}

			// 啟用按鈕
			$('#btnSearchMovie').attr("disabled", false);
		},
		error: function(jqXHR, textStatus, errorThrown) {
			alert('發生錯誤，請等待管理人員處理。');
		}
	});
}