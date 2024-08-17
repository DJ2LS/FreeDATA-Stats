let raw_avgsnr_list = [];
let raw_avgsnr_list_rounded = [];
let raw_bytesperminute_list = [];
let raw_filesize_list = [];
let version_distribution = {};
let total_bytes_transmitted = 0;

function getData() {
  return $.getJSON({
    url: "https://api.freedata.app/stats.php",
    type: "GET",
    dataType: "jsonp",
    error: function (xhr, status, error) {
      console.log(error);
    },
    success: function (data) {
      for (let i = 0; i < data.length; i++) {
        let avgsnr = parseFloat(data[i]["avgsnr"]);
        let bytesperminute = parseInt(data[i]["bytesperminute"], 10);
        let filesize = parseInt(data[i]["filesize"], 10);
        let version = data[i]["version"];

        // Round the SNR to the nearest integer
        let rounded_snr = Math.round(avgsnr);

        // Collect raw data for further processing
        raw_avgsnr_list.push(avgsnr);
        raw_avgsnr_list_rounded.push(rounded_snr);
        raw_bytesperminute_list.push(bytesperminute);
        raw_filesize_list.push(filesize);

        // Calculate total bytes transmitted
        total_bytes_transmitted += filesize;

        // Version distribution
        if (version_distribution[version] === undefined) {
          version_distribution[version] = 1;
        } else {
          version_distribution[version]++;
        }
      }
    },
  });
}

getData().then(function () {
  // Update total bytes transmitted
  document.getElementById("totalBytesTransmitted").innerText = formatBytes(total_bytes_transmitted, 4);

  // ----- SNR Histogram -----
  let snr_histogram = {};
  raw_avgsnr_list_rounded.forEach(snr => {
    snr_histogram[snr] = (snr_histogram[snr] || 0) + 1;
  });

  let snr_values = Object.keys(snr_histogram).map(Number).sort((a, b) => a - b);
  let snr_counts = snr_values.map(snr => snr_histogram[snr]);

  new Chart(document.getElementById("chartSNRHistogram"), {
    type: "bar",
    data: {
      labels: snr_values,
      datasets: [
        {
          label: "SNR Histogram",
          data: snr_counts,
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: "SNR [dB]",
          },
        },
        y: {
          beginAtZero: true,
          display: true,
          title: {
            display: true,
            text: "Occurrences",
          },
        },
      },
    },
  });

  // ----- Speed Histogram -----
  let speed_histogram = {};
  raw_bytesperminute_list.forEach((bpm, index) => {
    let snr = raw_avgsnr_list_rounded[index];
    if (speed_histogram[snr] === undefined) {
      speed_histogram[snr] = [bpm];
    } else {
      speed_histogram[snr].push(bpm);
    }
  });

  let speed_snr_values = Object.keys(speed_histogram).map(Number).sort((a, b) => a - b);
  let speed_averages = speed_snr_values.map(snr => {
    let total = speed_histogram[snr].reduce((sum, value) => sum + value, 0);
    return Math.round(total / speed_histogram[snr].length);
  });

  new Chart(document.getElementById("chartSpeedHistogram"), {
    type: "bar",
    data: {
      labels: speed_snr_values,
      datasets: [
        {
          label: "Speed vs SNR",
          data: speed_averages,
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: "SNR [dB]",
          },
        },
        y: {
          beginAtZero: true,
          display: true,
          title: {
            display: true,
            text: "Average Bytes/Minute",
          },
        },
      },
    },
  });

  // ----- Version Distribution -----
  let version_values = Object.keys(version_distribution);
  let version_counts = version_values.map(version => version_distribution[version]);

  new Chart(document.getElementById("chartVersionDistribution"), {
    type: "bar",
    data: {
      labels: version_values,
      datasets: [
        {
          label: "Version Distribution",
          data: version_counts,
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: "Version",
          },
        },
        y: {
          beginAtZero: true,
          display: true,
          title: {
            display: true,
            text: "Count",
          },
        },
      },
    },
  });
});

function formatBytes(bytes, decimals = 2) {
  if (!+bytes) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
