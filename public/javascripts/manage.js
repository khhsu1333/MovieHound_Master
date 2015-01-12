
$(document).ready(function() {
	getSlaves();
});

$('#btnGetSlaves').on('click', getSlaves);

function getSlaves(event) {
	if(event != undefined)
		event.preventDefault();

	$.ajax({
		type: 'GET',
		url: '/slave',
		dataType: 'JSON',
		success: function(data, textStatus, jqXHR)
		{
			if(typeof data.error === 'undefined') {
				// Success get snapshot list
				tableContent = '';
				i = 1;
				$.each(data, function() {
					tableContent += '<tr>';
					tableContent += '<td>' + i + '</td>';
					tableContent += '<td>' + this.name + '</td>';
					tableContent += '<td>' + this.IP + '</td>';
					tableContent += '<td>' + this.amount + '</td>';
					s = Math.sqrt(this.speed * 1000000);
					s = Math.floor(s);
					
					tableContent += '<td>' + s + '</td>';
					status = '離線';
					if(this.status)
						status = '上線';
					tableContent += '<td>' + status + '</td>';
					tableContent += '</tr>';
					i += 1;
				});

				$('#result table tbody').html(tableContent);
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			alert('發生錯誤，請等待管理人員處理。');
		}
	});	
}