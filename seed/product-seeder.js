var Product = require('../models/product');

var mongoose = require('mongoose');

mongoose.connect('localhost:27017/shopping');

var products = [
  new Product({
    imagePath: 'https://www.deere.com/common/media/images/products/equipment/tractors/row-crop-tractors/6M-series/r2z001369-6140M-642x462.png',
    title: '6145M TRACTOR',
    description: 'With the 6145M, you get the right mix of automation and mechanical efficiency in a compact but powerful package.',
    price: 120000
  }),
  new Product({
    imagePath: 'https://www.deere.com/common/media/images/product/grain_harvesting/combines/s_series/s650/r4a037573_s650_642x462.jpg',
    title: 'S650 COMBINE',
    description: 'Run with the newest addition to the family: the S650. With up to an 8% increase in speed and capacity from the S550, the new S650 is perfectly sized for a 6-row corn head or 25-foot platform.',
    price: 125000
  }),
  new Product({
    imagePath: 'https://www.deere.com/common/media/images/product/grain_harvesting/combines/s_series/s680/r4d015550_S680_642x462.jpg',
    title: 'S680 COMBINE',
    description: 'The S680 is capable of handling all header sizes up to 45 feet in width. The S680 has many built-in performance, safety, service, and reliability features to make harvesting easier in a large crop.',
    price: 130000
  }),
  new Product({
    imagePath: 'https://www.deere.com/common/media/images/products/equipment/cotton_harvesting/cp690_cotton_picker/r4a048116_cp690_642x462.png',
    title: 'CP690 COTTON PICKER',
    description: 'It would be easy to just slap a new model number on the same old machine. That’s not what we did.',
    price: 120000
  }),
  new Product({
    imagePath: 'https://www.deere.com/common/media/images/product/cutters_and_shredders/medium-duty_rotary_cutters/MX8/rotaryCutters_MX8_472020_642x462.png',
    title: 'MX8 ROTARY CUTTER',
    description: 'The MX8 cutter features a multi-spindle configuration and comes in three mounting configurations.',
    price: 110000
  })
];

var done = 0;
for (var i = 0; i < products.length; i++) {
  products[i].save(function (err, result) {
    done++;
    if (done === products.length) {
      exit();
    }
  });
}

function exit() {
  mongoose.disconnect();
}