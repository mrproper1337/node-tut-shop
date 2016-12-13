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
    if(users)
      res.render('admin/users', {users: users, successMsg: successMsg, noMessages: !successMsg});
  });
});

router.get('/products', isAdmin, function (req, res, next) {
  var successMsg = req.flash('success')[0];
  Product.find(function (err, products) {
    if(products)
      res.render('admin/products', {products: products, successMsg: successMsg, noMessages: !successMsg});
  });
});

router.get('/orders', isAdmin, function (req, res, next) {
  var successMsg = req.flash('success')[0];
  Order.find(function (err, orders) {
    if(orders){
      orders.forEach(function(order){
        User.findById(order.user ,function(err, user) {
          order.userEmail = user.email;
        })
      });
      res.render('admin/orders', {orders: orders, successMsg: successMsg, noMessages: !successMsg});
    }
  });
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
