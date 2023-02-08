var avgsnr_list = [];
var nack_list = [];
var timestamp_list = [];
var bytesperminute_list = [];
var filesize_list = [];

var snr_vs_nack = [];
var snr_vs_bytesperminute = [];
var time_vs_bytesperminute = [];




function getData(){

return $.getJSON({
	url:'https://api.freedata.app/stats.php',
	type: 'GET', 
	dataType: 'jsonp',
	error: function(xhr, status, error) {
                console.log(error)
            },
	success: 
	function(data) {
	
	for (var i = 0; i < data.length; i++) {

		var avgsnr = data[i]['avgsnr'];	
		var nack = data[i]['nacks'];
		var timestamp = data[i]['timestamp'];
		var filesize = data[i]['filesize'];		
		var bytesperminute = data[i]['bytesperminute'];
		
		// create snr_vs_nack
		snr_vs_nack.push({'avgsnr': avgsnr, 'nack': nack});

		// create snr_vs_speed
		snr_vs_bytesperminute.push({'avgsnr': avgsnr, 'bytesperminute': bytesperminute});

		// create time_vs_speed
		time_vs_bytesperminute.push({'timestamp': timestamp, 'bytesperminute': bytesperminute});
		

	}
	}
});

};


getData().then(function(data){



	




const ctx1 = document.getElementById('myChart1');
const ctx2 = document.getElementById('myChart2');
const speedOverTime = document.getElementById('speedOverTime');

	// sort snr_vs_nack lists
	snr_vs_nack.sort(function(a, b) {
		return a.avgsnr > b.avgsnr;
	});
		
	// split snr_vs_nack lists
	for (var k = 0; k < snr_vs_nack.length; k++) {
    	avgsnr_list[k] = snr_vs_nack[k].avgsnr;
    	nack_list[k] = snr_vs_nack[k].nack;
	}

new Chart(ctx1, {
	type: 'bar',
	data: {
		labels: avgsnr_list,
		datasets: [{
			label: 'SNR vs Speed',
			data: bytesperminute_list,
			borderWidth: 1
		}]
	},
	options: {
		scales: {
			y: {
				beginAtZero: true
			}
		}
	}
});

	
	
		// sort snr_vs_bytesperminute lists
	snr_vs_bytesperminute.sort(function(a, b) {
		return a.avgsnr - b.avgsnr;
	});
		
	// split snr_vs_bytesperminute lists
	for (var k = 0; k < snr_vs_bytesperminute.length; k++) {
    	avgsnr_list[k] = snr_vs_bytesperminute[k].avgsnr;
    	bytesperminute_list[k] = snr_vs_bytesperminute[k].bytesperminute;
	}
	
new Chart(ctx2, {
	type: 'line',
	data: {
		labels: bytesperminute_list,
		datasets: [{
			label: 'SNR vs NACK',
			data: nack_list,
			borderWidth: 1
		}]
	},
	options: {
		scales: {
			y: {
				beginAtZero: true
			}
		}
	}
});
	

	
	
	
	// sort time_vs_bytesperminute lists
	time_vs_bytesperminute.sort(function(a, b) {
		return a.timestamp - b.timestamp;
	});

	// split snr_vs_bytesperminute lists
	for (var k = 0; k < time_vs_bytesperminute.length; k++) {
		timestamp_list[k] = format_time(time_vs_bytesperminute[k].timestamp);
		bytesperminute_list[k] = time_vs_bytesperminute[k].bytesperminute;
		
	}
	
new Chart(speedOverTime, {
	type: 'line',
	data: {
		labels: timestamp_list,
		datasets: [{
			label: 'SPEED over TIME',
			data: bytesperminute_list,
			borderWidth: 1
		}]
	},
	options: {
		scales: {
			y: {
				beginAtZero: true
			}
		}
	}
});	
	
	
	
	
	

	
	});



function format_time(s) {
  const dtFormat = new Intl.DateTimeFormat('en-GB', {
    //dateStyle: 'full',
	timeStyle: 'short',
    timeZone: 'UTC'
  });
  
  return dtFormat.format(new Date(s * 1e3));
}