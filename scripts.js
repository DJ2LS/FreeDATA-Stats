let raw_avgsnr_list = [];
let raw_filesize_list = [];
let raw_bytesperminute_list = [];


let raw_crc_errors_after_fix = 0;
let raw_crc_errors_before_fix = 0;
let raw_no_crc_error = 0;

let raw_unique_callsings = new Set();

let avgsnr_list = [];
let nack_list = [];
let timestamp_list = [];
let bytesperminute_list = [];
let filesize_list = [];
let crcerror_list = [];

let snr_vs_nack = [];
let snr_vs_bytesperminute = [];
let time_vs_bytesperminute = [];
let snr_vs_filesize = [];
let speed_vs_filesize = [];
let snr_vs_crcerror = [];

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
                let nack = parseInt(data[i]["nacks"], 10);
                let timestamp = data[i]["timestamp"];
                let filesize = parseInt(data[i]["filesize"], 10);
                let bytesperminute = parseInt(data[i]["bytesperminute"], 10);
                let crcerror = data[i]["crcerror"];

                let version = data[i]["version"];
                let version_splitted = parseInt(version.split('.')[1], 10)

                // unique list of callsigns
                let callsign = data[i]["callsign"]
                raw_unique_callsings.add(callsign);

                // raw snr list, unsorted, for snr min/max/avg calculation
                raw_avgsnr_list.push(avgsnr);

                // raw filesize list
                raw_filesize_list.push(filesize);

                // raw bytesperminute list
                raw_bytesperminute_list.push(bytesperminute);

                // raw crc check for version after fix
                if(crcerror === 'True' && version_splitted >= 8){
                    raw_crc_errors_after_fix += 1;
                } else {
                    // count no crc errors after fix for milestone validation
                    if(version_splitted >= 8){
                        raw_no_crc_error += 1;
                    }
                 }

                // raw crc check for version after fix
                if(crcerror === 'True' && version_splitted < 8){
                    raw_crc_errors_before_fix += 1;
                }

        // create snr_vs_nack
        snr_vs_nack.push({
          avgsnr: avgsnr,
          nack: nack,
        });

        // create snr_vs_speed
        snr_vs_bytesperminute.push({
          avgsnr: avgsnr,
          bytesperminute: bytesperminute,
        });

        // create time_vs_speed
        time_vs_bytesperminute.push({
          timestamp: timestamp,
          bytesperminute: bytesperminute,
        });

        // create snr_vs_filesize
        snr_vs_filesize.push({
          filesize: filesize,
          avgsnr: avgsnr,
        });

        // create snr_vs_filesize
        speed_vs_filesize.push({
          filesize: filesize,
          bytesperminute: bytesperminute,
        });

        // create snr_vs_crcerror
        snr_vs_crcerror.push({
          avgsnr: avgsnr,
          crcerror: crcerror,
        });
      }
    },
  });
}

getData().then(function (data) {

    // ----- header

    // total Records
    document.getElementById("totalRecords").innerText = data.length;

    // min SNR
    document.getElementById("lowestSNR").innerText = Math.min.apply(Math, raw_avgsnr_list);

    // max SNR
    document.getElementById("highestSNR").innerText = Math.max.apply(Math, raw_avgsnr_list);

    // avg SNR
    let SNRsum = 0
    for (let x of raw_avgsnr_list){
        SNRsum += x;
    }
    document.getElementById("avgSNR").innerText = (SNRsum / raw_avgsnr_list.length).toFixed(1);

    //crc errors
    document.getElementById("crcErrorBeforeFix").innerText = raw_crc_errors_before_fix;
    document.getElementById("crcErrorAfterFix").innerText = raw_crc_errors_after_fix;
    document.getElementById("noCRCErrorsAfterFix").innerText = raw_no_crc_error;


    // unique callsigns
    document.getElementById("uniqueStations").innerText = raw_unique_callsings.size;

    // average filesize
    let fsSum = 0
    for (let x of raw_filesize_list){
        fsSum += x;
    }
    document.getElementById("averageFileSize").innerText = (fsSum / raw_filesize_list.length).toFixed(0);


    // average bytesperminute
    let bpmSum = 0
    for (let x of raw_bytesperminute_list){
        bpmSum += x;
    }
    document.getElementById("averageBytesPerMinute").innerText = (bpmSum / raw_bytesperminute_list.length).toFixed(0);
  // ----- statistics

  const chartSNRvsSPEED = document.getElementById("chartSNRvsSPEED");
  const chartSNRvsNACK = document.getElementById("chartSNRvsNACK");
  const chartSNRvsFILESIZE = document.getElementById("chartSNRvsFILESIZE");
  const chartSPEEDvsFILESIZE = document.getElementById("chartSPEEDvsFILESIZE");
  const chartSNRvsCRCERROR = document.getElementById("chartSNRvsCRCERROR");

  const speedOverTime = document.getElementById("chartSpeedOverTime");

  // cleanup
  cleanup();

  // sort snr_vs_bytesperminute lists
  snr_vs_bytesperminute.sort(function (a, b) {
    return a.avgsnr - b.avgsnr;
  });

  // split snr_vs_bytesperminute lists
  for (let k = 0; k < snr_vs_bytesperminute.length; k++) {
    avgsnr_list[k] = snr_vs_bytesperminute[k].avgsnr;
    bytesperminute_list[k] = snr_vs_bytesperminute[k].bytesperminute;
  }

  new Chart(chartSNRvsSPEED, {
    type: "bar",
    data: {
      labels: avgsnr_list,
      datasets: [
        {
          label: "SNR vs Speed",
          data: bytesperminute_list,
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
            text: "[dB]",
          },
        },
        y: {
          beginAtZero: true,
          display: true,
          title: {
            display: true,
            text: "[Bytes/min]",
          },
        },
      },
    },
  });

  // cleanup
  cleanup();

  // sort snr_vs_nack lists
  snr_vs_nack.sort(function (a, b) {
    return a.avgsnr - b.avgsnr;
  });

  // split snr_vs_nack lists
  for (let k = 0; k < snr_vs_nack.length; k++) {
    avgsnr_list[k] = snr_vs_nack[k].avgsnr;
    nack_list[k] = snr_vs_nack[k].nack;
  }

  new Chart(chartSNRvsNACK, {
    type: "bar",
    data: {
      labels: avgsnr_list,
      datasets: [
        {
          label: "SNR vs NACK",
          data: nack_list,
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
            text: "[dB]",
          },
        },
        y: {
          beginAtZero: true,
          display: true,
          title: {
            display: true,
            text: "[N]",
          },
        },
      },
    },
  });

  // cleanup
  cleanup();

  // sort snr_vs_filesize lists
  snr_vs_filesize.sort(function (a, b) {
    return a.avgsnr - b.avgsnr;
  });

  // split snr_vs_filesize lists
  for (let k = 0; k < snr_vs_filesize.length; k++) {
    avgsnr_list[k] = snr_vs_filesize[k].avgsnr;
    filesize_list[k] = snr_vs_filesize[k].filesize;
  }

  new Chart(chartSNRvsFILESIZE, {
    type: "bar",
    data: {
      labels: avgsnr_list,
      datasets: [
        {
          label: "SNR vs FILESIZE",
          data: filesize_list,
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
            text: "[dB]",
          },
        },
        y: {
          beginAtZero: true,
          display: true,
          title: {
            display: true,
            text: "[Bytes]",
          },
        },
      },
    },
  });

  // cleanup
  cleanup();

  // sort time_vs_bytesperminute lists
  speed_vs_filesize.sort(function (a, b) {
    return a.filesize - b.filesize;
  });

  // split snr_vs_bytesperminute lists
  for (let k = 0; k < speed_vs_filesize.length; k++) {
    filesize_list[k] = speed_vs_filesize[k].filesize;
    bytesperminute_list[k] = speed_vs_filesize[k].bytesperminute;
  }

  new Chart(chartSPEEDvsFILESIZE, {
    type: "bar",
    data: {
      labels: filesize_list,
      datasets: [
        {
          label: "SPEED vs FILESIZE",
          data: bytesperminute_list,
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
            text: "[Bytes]",
          },
        },
        y: {
          beginAtZero: true,
          display: true,
          title: {
            display: true,
            text: "[Bytes/min]",
          },
        },
      },
    },
  });

  // cleanup
  cleanup();

  // sort time_vs_bytesperminute lists
  time_vs_bytesperminute.sort(function (a, b) {
    return a.timestamp - b.timestamp;
  });

  // split snr_vs_bytesperminute lists
  for (let k = 0; k < time_vs_bytesperminute.length; k++) {
    timestamp_list[k] = format_time(time_vs_bytesperminute[k].timestamp);
    bytesperminute_list[k] = time_vs_bytesperminute[k].bytesperminute;
  }

  new Chart(speedOverTime, {
    type: "line",
    data: {
      labels: timestamp_list,
      datasets: [
        {
          label: "SPEED over TIME",
          data: bytesperminute_list,
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
            text: "[Timestamp]",
          },
        },
        y: {
          beginAtZero: true,
          display: true,
          title: {
            display: true,
            text: "[Bytes/min]",
          },
        },
      },
    },
  });

  // cleanup
  cleanup();

  // sort time_vs_bytesperminute lists
  snr_vs_crcerror.sort(function (a, b) {
    return a.avgsnr - b.avgsnr;
  });

  // split snr_vs_bytesperminute lists
  for (let k = 0; k < snr_vs_crcerror.length; k++) {
    avgsnr_list[k] = snr_vs_crcerror[k].avgsnr;
    crcerror_list[k] = snr_vs_crcerror[k].crcerror;
  }

  new Chart(chartSNRvsCRCERROR, {
    type: "category",
    data: {
      labels: avgsnr_list,
      datasets: [
        {
          label: "SNR vs CRC ERROR",
          labels: ["true", "false"],
          data: crcerror_list,
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
            text: "[dB]",
          },
        },
        y: {
          beginAtZero: true,
          display: true,
          title: {
            display: true,
            text: "[True/False]",
          },
        },
      },
    },
  });
});

function format_time(s) {
  const dtFormat = new Intl.DateTimeFormat("en-GB", {
    //dateStyle: 'full',
    timeStyle: "short",
    timeZone: "UTC",
  });

  return dtFormat.format(new Date(s * 1e3));
}

function cleanup() {
  avgsnr_list = [];
  nack_list = [];
  timestamp_list = [];
  bytesperminute_list = [];
  filesize_list = [];
}

function getGridFromCall(callsign) {
  // function for checking if we have gridsquare information available
  return $.getJSON({
    url: "https://api.freedata.app/explorer.php",
    type: "GET",
    dataType: "jsonp",
    error: function (xhr, status, error) {
      console.log(error);
    },
    success: function (data) {
      for (let i = 0; i < data.length; i++) {
        if (data[i]["callsign"] === callsign) {
          return data[i]["gridsquare"];
        }

        if (data[i]["dxcallsign"] === callsign) {
          return data[i]["dxgridsquare"];
        }
      }

      return false;
    },
  });
}
