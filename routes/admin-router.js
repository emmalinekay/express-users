const express = require('express');
const UserModel = require('../models/user-model.js');
const RoomModel = require('../models/room-model.js');

const router = express.Router();

router.get('/admin/rooms', (req, res, next) => {
      if (req.user === undefined) {
        req.flash('securityError', 'Log in to do admin stuff room');
        res.redirect('/login');
        return;
      }

      if(req.user.role !== 'admin') {
        req.flash('securityError', 'You are not an admin.');
        res.redirect('/');
        return;
      }

      RoomModel.find((err, allRooms) => {
        if(err) {
          next(err);
          return;
        }
        res.locals.listOfRooms = allRooms;
        res.render('admin-views/rooms-list.ejs');
      });
});

router.get('/admin/users', (req, res, next) => {
      UserModel.find((err, allUsers) => {
        if(err) {
          next(err);
          return;
        }

        res.locals.listOfUsers = allUsers;
        res.render('admin-views/user-list.ejs');
      });
});

module.exports = router;
