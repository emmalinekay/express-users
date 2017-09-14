const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const roomSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    photoUrl: {
      type: String,
      required: true
    },
    desc: {
      type: String,
    },

    owner: {
      type: Schema.Types.ObjectId,
      required: true
    }
},
{
  timestamps: true
});

const RoomModel = mongoose.model('Room', roomSchema);

module.exports = RoomModel;
