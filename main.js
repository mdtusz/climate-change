(function () {

  const plot = document.getElementById('plot');

  createDiagram();

  function createDiagram(){

    const plot = document.getElementById('plot');

    var request = new XMLHttpRequest();
    request.open('GET', 'data.tsv', true);
    request.onload = function () {
      if(request.status >= 200 && request.status < 400){
        createPlot(request.responseText);
      }else{
        console.log('AJAX error: ', request.status);
      }
    };
    request.onerror = function () {
      console.log('AJAX connection error.');
    };
    request.send();



    function createPlot (raw) {
      const cleaned = parse(raw);
      const prepared = prepare(cleaned);

      const data = [{
        type: 'surface',
        visible: true,
        hoverinfo: 'all',
        name: '',
        x: prepared.x,
        y: prepared.y,
        z: prepared.z,
        colorscale: 'Reds'
      }];

      const layout = {
        autosize: 'initial',
        paper_bgcolor: '#222222',
        margin: {
          t: 20,
          b: 0, 
          l: 0,
          r: 0
        }
      };

      Plotly.newPlot(plot, data, layout);
      bindSliders(plot);
    }

    function parse (data) {
      return data.split('\n')
        .reduce((acc, row) => {
          row = row.trim().split(/\s+/).splice(0,3);
          if(row.indexOf('%') < 0 && row[0] >= '1800'){
            return acc.concat([row]);
          }else{
            return acc;
          }
        }, []);
    }

    function prepare (data) {
      var anomalies = [];
      var years = [];
      var yearData = [];

      for(var i = 0; i < data.length; i++){
        yearData.push(data[i][2]);
        if(data[i][1] === '12'){
          anomalies.push(yearData);
          years.push(data[i][0]);
          yearData = [];
        }  
      }

      return {
        x: [
          'January', 'February', 'March', 'April',
          'May', 'June', 'July', 'August', 
          'September', 'October', 'November', 'December'
        ],
        y: years,
        z: anomalies
      };
    }    

    function bindSliders (plot) {

      // const plot = document.getElementById('plot').data[0];
      console.log(plot.data[0]);
      const fromSlider = document.getElementById('slider-from');
      const toSlider = document.getElementById('slider-to');
      const sliderValues = document.getElementById('slider-values');

      fromSlider.addEventListener('mouseup', (e) => {
        Plotly.relayout(plot, { scene: { yaxis: { range: [e.target.value, toSlider.value] }}});
      });

      fromSlider.addEventListener('input', (e) => {
        sliderValues.innerHTML = e.target.value + ' - ' + toSlider.value;
      });

      toSlider.addEventListener('mouseup', (e) => {
        Plotly.relayout(plot, { scene: { yaxis: { range: [fromSlider.value, e.target.value] }}});
      });

      toSlider.addEventListener('input', (e) => {
        sliderValues.innerHTML = fromSlider.value + ' - ' + e.target.value;
      });
    }
  }


  
})();
