var express = require('express');
var router = express.Router();

var config = require('../config/all');
var Product = require('../models/product');
var Order = require('../models/order');
var User = require('../models/user');

/* GET home page. */
router.get('/', isAdmin, function (req, res, next) {
  return res.redirect('/orders');
});

router.get('/users', isAdmin, function (req, res, next) {
  var successMsg = req.flash('success')[0];
  User.find(function (err, users) {
    if (users)
      res.render('admin/users', {users: users, successMsg: successMsg, noMessages: !successMsg});
  });
});

router.get('/products', isAdmin, function (req, res, next) {
  var successMsg = req.flash('success')[0];
  Product.find(function (err, products) {
    if (products)
      res.render('admin/products', {products: products, successMsg: successMsg, noMessages: !successMsg});
  });
});

router.get('/edit-product/:id', isAdmin, function (req, res, next) {
  var successMsg = req.flash('success')[0];
  Product.findById(req.params.id, function (err, product) {
    if (err)
      res.redirect('/admin/products');
    res.render('admin/edit-product', {edit: true, product: product, successMsg: successMsg, noMessages: !successMsg});
  })
});

router.post('/edit-product/:id', isAdmin, function (req, res, next) {
  Product.findByIdAndUpdate(req.params.id, {
    $set: {
      imagePath: req.body.imagePath,
      title: req.body.title,
      description: req.body.description,
      price: parseInt(req.body.price)
    }
  }, function (err, result) {
    req.flash('success', 'Збережено!');
    res.redirect('/admin/products');
  });
});

router.get('/create-product', isAdmin, function (req, res, next) {
  var successMsg = req.flash('success')[0];
  res.render('admin/edit-product', {edit: false, successMsg: successMsg, noMessages: !successMsg});
});

router.post('/create-product', isAdmin, function (req, res, next) {
  var newProduct = new Product({
    imagePath: req.body.imagePath,
    title: req.body.title,
    description: req.body.description,
    price: parseInt(req.body.price)
  });
  newProduct.save(function (err, result) {
    req.flash('success', 'Збережено!');
    res.redirect('/admin/products');
  });
});

router.get('/delete-user/:id', isAdmin, function (req, res, next) {
  User.findByIdAndRemove(req.params.id, function (err, result) {
    req.flash('success', 'Видалено!');
    res.redirect('/admin/users');
  });
});

router.get('/delete-order/:id', isAdmin, function (req, res, next) {
  Order.findByIdAndRemove(req.params.id, function (err, result) {
    req.flash('success', 'Видалено!');
    res.redirect('/admin/orders');
  });
});

router.get('/delete-product/:id', isAdmin, function (req, res, next) {
  Product.findByIdAndRemove(req.params.id, function (err, result) {
    req.flash('success', 'Видалено!');
    res.redirect('/admin/products');
  });
});

router.get('/orders', isAdmin, function (req, res, next) {
  var successMsg = req.flash('success')[0];
  Order.find(function (err, orders) {
    if (orders) {
      orders.forEach(function (order) {
        User.findById(order.user, function (err, user) {
          order.userEmail = user.email;
        })
      });
      res.render('admin/orders', {orders: orders, successMsg: successMsg, noMessages: !successMsg});
    }
  });
});

var statFunc = [
  {
    title: 'Список користувачів що зробили замовлення на сумму більше n',
    path: 'userOrdersMoreThanN',
    getData: function (req, res) {
      var successMsg = req.flash('success')[0];
      var n = parseInt(req.query.n) || 100;
      Order.find({'cart.totalPrice': {$gt: n}})
        .then((orders) => {
          var userTotal = [];
          orders.forEach((order) => {
            if (userTotal.indexOf(order.user) === -1)
              userTotal.push(order.user);
          });
          User.find({_id: {$in: userTotal}})
            .then((users) => {
              res.render('admin/stats/' + this.path, {
                data: users,
                n: n,
                successMsg: successMsg,
                noMessages: !successMsg
              });
            })
        });
    }
  },
  {
    title: 'Статистика кількості продажів по кожному продукту',
    path: 'productSales',
    getData: function (req, res) {
      var successMsg = req.flash('success')[0];
      Product.find({})
        .then((products) => {
          Order.find({})
            .then((orders)=> {
              products.forEach((product) => {
                product.sales = 0;
                orders.forEach((order) => {
                  product.sales += order.cart.items[product._id] && order.cart.items[product._id].qty || 0;
                });
              });
              res.render('admin/stats/' + this.path, {
                data: products,
                successMsg: successMsg,
                noMessages: !successMsg
              });
            })
        })
    }
  },
  {
    title: 'Продукти що не мають зображень',
    path: 'productsWithoutPics',
    getData: function (req, res) {
      var successMsg = req.flash('success')[0];
      Product.find({imagePath: ''})
        .then((prods) => {
          console.log(prods);
          res.render('admin/products', {
            products: prods,
            successMsg: successMsg,
            noMessages: !successMsg
          });
        })
    }
  },
  {
    title: 'Середня вартість замовлення',
    path: 'avgTotal',
    getData: function (req, res) {
      var successMsg = req.flash('success')[0];
      Order.find({})
        .then((orders) => {
          var avg = 0;
          orders.forEach((order) => {
            avg += order.cart.totalPrice
          });
          avg /= orders.length;
          res.render('error', {
            message: 'Середня вартість замовлення: ' + avg
          });
        })
    }
  },
  {
    title: 'Продукти в певному діапазоні цін',
    path: 'pricesBetween',
    getData: function (req, res) {
      var successMsg = req.flash('success')[0];
      var from = parseInt(req.query.from) || 0;
      var to = parseInt(req.query.to) || 100;
      Product.find({price: {$gte: from, $lte: to}})
        .then((prods) => {
          res.render('admin/stats/' + this.path, {
            data: prods,
            from: from,
            to: to,
            successMsg: successMsg,
            noMessages: !successMsg
          });
        });
    }
  },
  /*
   {
   title: 'Список замовлень у конкретний проміжок часу',
   path: 'orderTimeBetween',
   getData: function (params) {
   }
   },
   {
   title: 'Користувачі зареєстровані в конкретний проміжок часу',
   path: 'userTimeBetween',
   getData: function (params) {
   }
   },
   {
   title: 'Замовлення користувача в конкретний проміжок часу',
   path: 'userOrderTimeBetween',
   getData: function (params) {
   }
   },
   {
   title: 'Середній розмір кошика',
   path: 'avgCart',
   getData: function () {
   }
   },
   {
   title: 'Найпопулярніший товар',
   path: 'bestSeller',
   getData: function () {
   }
   }
   */
];

router.get('/stats/:stat', isAdmin, function (req, res, next) {

  var stat = statFunc.find(function (sf) {
    return sf.path === req.params.stat;
  });
  stat.getData(req, res);
});

router.get('/stats', isAdmin, function (req, res, next) {
  var successMsg = req.flash('success')[0];
  var chunks = [];
  var chunkSize = 2;
  for (var i = 0; i < statFunc.length; i += chunkSize) {
    chunks.push(statFunc.slice(i, i + chunkSize));
  }
  res.render('admin/stats/index', {functions: chunks, successMsg: successMsg, noMessages: !successMsg});
});

module.exports = router;

function isAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.email === config.defaultAdmin.email) {
    return next();
  }
  var err = new Error('Forbidden');
  err.status = 403;
  next(err);
}
