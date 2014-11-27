var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * User Schema
 */

var articleSchema = new Schema({
    _id:{type:Schema.ObjectId},
    author: {type:String,required:true},
    authorArticleId:{type:String,required:true},
    authorProfileImg:{type:String},
    title: {type: String,required:true},
    description: {type: String,required:true},
    price: {type: Number,required:true},
    priceNegotiable:{type:Boolean,required:true},
    hashTags: {type:[],required:true},
    LatLng:{
                Lat:{type:Number,required:true},
                Lng:{type:Number,required:true},
                LocationName:String
    },
    imageUrl:{type:String,required:true},
    no_of_view: { type: Number, default: 0 },
    created: { type: Date, default: Date.now }
})
articleSchema.set('toObject',{getters: true});

/**
 * Methods
 */

mongoose.model('Articles', articleSchema,'articles');