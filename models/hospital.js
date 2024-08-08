const mongoose = require('mongoose');
const Review = require('./review')
const Schema = mongoose.Schema;

const opts = {toJSON: {virtuals: true}};

const HospitalSchema = new Schema({
    name: String,
    images: [
        {
            url: String,
            filename: String
        }
    ],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);

HospitalSchema.virtual('properties.popUpMarkup').get(function(){
    return `<strong><a href="/hospitals/${this._id}">${this.name}</a></strong>`
})

HospitalSchema.post('findOneAndDelete', async function(doc){
    if (doc){
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Hospital', HospitalSchema);