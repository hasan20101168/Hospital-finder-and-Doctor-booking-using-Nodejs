const mongoose =require('mongoose');
const Schema = mongoose.Schema;

const doctorSchema = new Schema({
    name: String,
    department: String,
    email: {
        type: String,
        required: true,
        unique: true
    },
    image: String,
    education: String,
    availabledays: String,
    start_time: String,
    end_time: String,
    room_no: String
});

module.exports = mongoose.model("Doctor", doctorSchema);


/*
doctor : {
    name
    department
    image
    email
    available days
    time schedule
    education (MBBS)
    room_no
    description**
}
*/