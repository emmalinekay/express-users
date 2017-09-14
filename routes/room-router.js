const express = require('express');
const multer = require('multer');
const RoomModel = require('../models/room-model.js');
const router = express.Router();

const myUploader = multer(
  {
    dest: __dirname + '/../public/uploads/'
  }
);

router.get('/rooms/new', (req, res, next) => {
  if(req.user === undefined) {
    req.flash('securityError', 'Log in to add a room');
    res.redirect('/login');
    return;
  }
    res.render('room-views/room-form.ejs');
});

router.post(
  '/rooms',
  myUploader.single('roomPhoto'), //name that's on the input in the form.
  (req, res, next) => {

  if(req.user === undefined) {
    req.flash('securityError', 'Log in to add a room');
    res.redirect('/login');
    return;
  }
  //multer creates a "req.file" with all the file info
  console.log('req.file ------>');
  console.log(req.file);

    const theRoom = new RoomModel({
      name: req.body.roomName,
      photoUrl: '/uploads/' + req.file.filename, //automatically generated nme for uploaded file
      desc: req.body.roomDesc,
      owner: req.user._id //logged in user's idea from passport
    });

    theRoom.save((err) => {
      if(err) {
        next(err);
        return;
      }
      req.flash('roomFeedback', 'Room Added.');
      res.redirect('/');
    });
});

router.get('/my-rooms', (req, res, next) => {

    if(req.user === undefined) {
      req.flash('securityError', 'Log in to add a room');
      res.redirect('/login');
      return;
    }

    RoomModel.find(

      { owner: req.user._id },

      (err, myRooms) => {
        if(err) {
          next(err);
          return;
        }

        res.locals.securityFeedback = req.flash('securityError');
        res.locals.updateFeedback = req.flash('updateSuccess');
        res.locals.listOfRooms = myRooms;
        res.render('room-views/user-rooms.ejs');
      }
    );
});

router.get('/rooms/:roomId/edit', (req, res, next) => {

      if(req.user === undefined) {
        req.flash('securityError', 'Log in to edit your rooms');
        res.redirect('/login');
        return;
      }

      RoomModel.findById(
        req.params.roomId,
        (err, roomFromDb) => {
          if(err) {
            next(err);
            return;
          }
          if (roomFromDb.owner.toString() !== req.user._id.toString()) {
            req.flash('securityError', 'You can only edit your rooms.');
            res.redirect('/my-rooms');
            return;
          }

          res.locals.roomInfo = roomFromDb;
          res.render('room-views/room-edit.ejs');
        }
      );
});

router.post('/rooms/:roomId',
myUploader.single('roomPhoto'),
(req, res, next) => {
      RoomModel.findById(
        req.params.roomId,
        (err, roomFromDb) => {
          if (err) {
            next(err);
            return;
          }

          if (roomFromDb.owner.toString() !== req.user._id.toString()) {
            req.flash('securityError', 'You can only edit your rooms.');
            res.redirect('/my-rooms');
            return;
          }

          roomFromDb.name = req.body.roomName;
          roomFromDb.desc = req.body.roomDesc;

          //req.file will be undefined if user doesnt upload anything.
          //update photourl only if the user uploaded a file
          if(req.file) {
            roomFromDb.photoUrl = '/uploads/' + req.file.filename;
          }

          roomFromDb.save((err) => {
            if(err) {
              next(err);
              return;
            }

            req.flash('updateSuccess', 'Room update successful.');
            res.redirect('/my-rooms');
          });
        }
      );

});

module.exports = router;
