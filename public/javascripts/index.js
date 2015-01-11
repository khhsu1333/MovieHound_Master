// SECTION: 變數===============================================

// SECTION: DOM===============================================

// DOM Ready
$(document).ready(function() {
	// Do nothing
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
				data = $.parseJSON(data);
				alert('Search complete. Found ' + data.length + ' data.');

				// Success get snapshot list
				tableContent = '';
				i = 1;
				$.each(data, function() {
					tableContent += '<tr>';
					tableContent += '<td>' + i + '</td>';
					tableContent += '<td><image src="http://' + this.slave + '/image/' + this.filename + '" /></td>';
					tableContent += '<td>' + this.movie + '</td>';
					tableContent += '<td>' + this.time + '</td>';
					tableContent += '<td>' + this.distance + '</td>';
					tableContent += '</tr>';
					i += 1;
				});

				// Inject the whole content string into our existing HTML table
				$('#result table tbody').html(tableContent);
			}
			else
				alert(data.error);
		},
		error: function(jqXHR, textStatus, errorThrown) {
			alert('發生錯誤，請等待管理人員處理。')
		}
	});

}