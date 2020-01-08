var faker = require('faker');
faker.seed(123);
var dateformat = require('dateformat');
var geolib = require('geolib');

const data = {
  disruptions: [],
  projects: [],
  types: [
    { "url": "/types/1/", "id": 1, "name": "Vehicles" },
    { "url": "/types/2/", "id": 2, "name": "Bus" },
    { "url": "/types/3/", "id": 3, "name": "Train" },
    { "url": "/types/4/", "id": 4, "name": "Community" },
    { "url": "/types/5/", "id": 5, "name": "Ferry" },
    { "url": "/types/6/", "id": 6, "name": "Walking" },
    { "url": "/types/7/", "id": 7, "name": "Cycling" },
    { "url": "/types/8/", "id": 8, "name": "Air" }
  ]
}

for (let id = 1; id < 101; id++) {
  let start_date = faker.date.between(faker.date.past(Math.random()), faker.date.future(Math.random()))
  let end_date = faker.date.between(start_date, faker.date.future(Math.random()));
  let randomPoint = generateRandomPoint({ lat: -37.8136, lng: 144.9631 }, 100000);
  data.disruptions.push({
    url: '/disruptions/' + id,
    id: id,
    name: faker.company.companyName(),
    description: faker.lorem.paragraph(),
    geometry: {
      type: 'Point',
      coordinates: [
        randomPoint.lng,
        randomPoint.lat
      ]
    },
    type: [data.types[(Math.floor(Math.random() * 8))].id.toString()],
    start_date: dateformat(start_date, 'yyyy-mm-dd'),
    end_date: dateformat(end_date, 'yyyy-mm-dd'),
    project: '/projects/' + faker.random.number(10) + '/',
    distance: -1
  });
}

for (let id = 1; id < 11; id++) {
  data.projects.push({
    url: '/projects/' + id + '/',
    id: id,
    name: faker.company.companyName(),
    description: faker.lorem.paragraph(),
    hyperlink: faker.internet.url
  });
}

const jsonServer = require('json-server')
const server = jsonServer.create();
const router = jsonServer.router(data);
const middleware = jsonServer.defaults();
server.use(middleware);

router.render = (req, res) => {
  let data = res.locals.data;

  if (req._parsedOriginalUrl.query) {
    // Custom querying for date ranges.
    if (dates = req._parsedOriginalUrl.query.match(/occurs_between=([0-9\-]+)%2C([0-9\-]+)/)) {
      data = data.filter((item) => item.start_date <= dates[2] && item.end_date >= dates[1]);
    }
    // Custom querying for radius searches.
    if (radius = req._parsedOriginalUrl.query.match(/within_radius=([0-9\-\.]+)%2C([0-9\-\.]+)%2C([0-9\-\.]+)/)) {
      data = data.filter(function (item) {
        if (item.geometry === undefined || item.geometry.coordinates === undefined || item.geometry.coordinates.length < 1) {
          return false;
        }
        var distance = geolib.getDistance(
          { latitude: parseFloat(radius[1]), longitude: parseFloat(radius[2]) },
          { latitude: parseFloat(item.geometry.coordinates[0]), longitude: parseFloat(item.geometry.coordinates[1])},
          1000
        );

        if (distance <= parseInt(radius[3])) {
          return true;
        }

      });
    }
  }

  res.json(data);
}

server.use('/api', router);
server.listen(3000, () => { console.log('JSON Server running at http://localhost:3000/'); });

/**
 * Generates number of random geolocation points given a center and a radius.
 * Reference URL: http://goo.gl/KWcPE.
 * @param  {Object} center A JS object with lat and lng attributes.
 * @param  {number} radius Radius in meters.
 * @return {Object} The generated random points as JS object with lat and lng attributes.
 */
function generateRandomPoint(center, radius) {
  var x0 = center.lng;
  var y0 = center.lat;
  // Convert Radius from meters to degrees.
  var rd = radius/111300;

  var u = Math.random();
  var v = Math.random();

  var w = rd * Math.sqrt(u);
  var t = 2 * Math.PI * v;
  var x = w * Math.cos(t);
  var y = w * Math.sin(t);

  var xp = x/Math.cos(y0);

  // Resulting point.
  return {'lat': y+y0, 'lng': xp+x0};
}
