const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 4000;

app.use(express.json());

let hospitalData = require('./hospital_data.json');

hospitalData.hospitals.sort((a, b) => a.id - b.id);

app.route('/hospitals')
  .get((req, res) => {
    res.json(hospitalData);
  })
  .post((req, res) => {
    const newHospital = req.body;
    newHospital.id = Date.now();
    hospitalData.hospitals.push(newHospital);
    saveAndRespond(res, newHospital, 201);
  });

app.route('/hospitals/:id')
  .get((req, res) => {
    const hospitalId = parseInt(req.params.id, 10);
    const hospital = hospitalData.hospitals.find(h => h.id === hospitalId);
    hospital ? res.json(hospital) : notFound(res);
  })
  .put((req, res) => {
    const hospitalId = parseInt(req.params.id, 10);
    const index = hospitalData.hospitals.findIndex(h => h.id === hospitalId);
    
    if (index !== -1) {
      const updatedHospital = { ...hospitalData.hospitals[index], ...req.body };
      hospitalData.hospitals[index] = updatedHospital;
      saveAndRespond(res, updatedHospital, 200);
    } else {
      notFound(res);
    }
  })
  .delete((req, res) => {
    const hospitalId = parseInt(req.params.id, 10);
    const index = hospitalData.hospitals.findIndex(h => h.id === hospitalId);

    if (index !== -1) {
      const deletedHospital = hospitalData.hospitals.splice(index, 1)[0];
      saveAndRespond(res, deletedHospital, 200);
    } else {
      notFound(res);
    }
  });

function saveAndRespond(res, data, statusCode) {
  fs.writeFile('./hospital_data.json', JSON.stringify(hospitalData, null, 2), (error) => {
    if (error) {
      res.status(500).send('Internal Server Error');
    } else {
      res.status(statusCode).json(data);
    }
  });
}

function notFound(res) {
  res.status(404).send('Not Found');
}

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

