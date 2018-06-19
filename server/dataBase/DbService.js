const _ = require('lodash')
const mongoose = require('mongoose')

// helpers
const uniqueId = require('../../app/helpers/uniqueId')
const helpers = require('../helpers/helpers')

// services
const DatesService = require('../services/DatesService')

// models
const Meme = require('../models/meme');
const UserGeneratedMeme = require('../models/userGeneratedMeme');
const WeeklyMeme = require('../models/weeklyMeme');
const SuggestedMeme = require('../models/suggestedMeme');
const UserReport = require('../models/userReport');
const User = require('../models/user');
const Item = require('../models/item');


let db;
const sectionLimit = 68;

const init = ({ isProduction }) => {

    let dbPath

    if (!isProduction) {
        const dbConstants = require('../../anigma/dbConstants')
        dbPath = dbConstants.prodDataBasePath
    }

    const database = (

        isProduction
            ?
            JSON.parse(process.env.MONGO_PATH)
            :
            dbPath
    )


    mongoose.connect(database)

    db = mongoose.connection

    db.on('error', console.error.bind(console, 'connection error:'))


    db.once('open', function () {

        console.log('Database Connected!')
    })
}

const saveMemeToDataBase = ({ meme } = {}) => {
    return new Promise(resolve => {

        const newMeme = new Meme(meme)
        newMeme.save(function (err, res) {

            if (err) return console.error(err)

            console.log(`saved meme to database - ${meme.id}`)

            resolve(res)
        })
    })
}

const getCategory = ({ category } = {}) => {
    return new Promise(resolve => {
        Meme.find({ category }).sort('-date').exec(function (err, res) {
            console.log(category, 'category fetched')
            resolve(helpers.arrayToObjById(res))
        })
    })
}

const getPopularMemes = () => {
    return new Promise(resolve => {
        Meme.find({}).sort('-rating').limit(sectionLimit).exec(function (err, memes) {
            console.log(`popular memes fetched`, _.size(memes))
            resolve(helpers.arrayToObjById(memes))
        })

    })
}

const getNewMemes = () => {
    return new Promise(resolve => {
        Meme.find({}).sort('-date').limit(sectionLimit).exec(function (err, memes) {
            console.log(`new memes memes fetched`, _.size(memes))
            resolve(helpers.arrayToObjById(memes))
        })

    })
}

const incrementMemeRating = ({ meme = {} } = {}) => {

    return new Promise(resolve => {

        if (!meme.id) {
            resolve()
            return
        }

        Meme.findOneAndUpdate({ id: meme.id }, { $inc: { 'rating': 1 } }).exec(function (err, meme) {
            console.log('increment rating meme: ', _.get(meme, 'description'), _.get(meme, 'rating'))
        })

        const week = helpers.getWeekNumber()
        WeeklyMeme.findOneAndUpdate({ id: meme.id, week }, { $inc: { 'rating': 1 } }).exec(function (err, res) {

            WeeklyMeme.remove({ week: week - 1 })

            if (!res) {

                const newMemeOBject = { ...meme, rating: 1, week };
                delete newMemeOBject['_id'];

                const newMeme = new WeeklyMeme(newMemeOBject);

                newMeme.save(function (err, weeklyRes) {

                    console.log('save new weekly Meme', _.get(weeklyRes, 'description'), _.get(weeklyRes, 'rating'))
                    resolve(weeklyRes)

                })

            } else {
                console.log('saved new weekly Meme', _.get(res, 'description'), _.get(res, 'rating'))
                resolve(res)
            }


        })
    })
}

const getMemeSuggestions = ({ category, amount = 6 } = {}) => {

    return new Promise(resolve => {
        const promises = []

        _.times(amount, () => {
            promises.push(new Promise(async function (resolve) {
                Meme.count({ category: 'dank' }, function (err, count) {

                    const random = Math.floor(Math.random() * count)

                    db.collections.memes.find({ category }).limit(-1).skip(random).next(function (err, result) {
                        resolve(result)
                    })
                })
            }))
        })


        return Promise.all(promises).then(suggestions => {
            console.log(`got suggestions`, _.size(suggestions))
            resolve(helpers.arrayToObjById(suggestions))
        })
    })
}


const getRandomMeme = () => {

    return new Promise(resolve => {

        Meme.count(function (err, count) {

            const random = Math.floor(Math.random() * count)

            db.collections.memes.find().limit(-1).skip(random).next(function (err, result) {
                resolve(result)
            })
        })

    })
}

const deleteMeme = ({ meme = {}, id } = {}) => {
    return new Promise(resolve => {
        Meme.remove({ id: meme.id || id }, function (err) {

            if (!err) {
                resolve()
            }

        })
    })
}

const saveUserGeneratedMeme = ({ meme = {} } = {}) => {
    console.log('saveing user meme to database')

    return new Promise(resolve => {

        const newMeme = new UserGeneratedMeme({ ...meme, id: meme.id || uniqueId() })

        newMeme.save(function (err, res) {
            if (err) return console.error(err)
            console.log(`saved user generated meme - ${meme.id}`)
            resolve(res)
        })
    })
}

const getUserGeneratedMemes = () => {

    return new Promise(resolve => {


        UserGeneratedMeme.find({}, function (err, memes) {
            if (err) return console.error(err)
            console.log(`got user generated memes`, _.size(memes))
            resolve(memes)
        })
    })
}

const removeUserGeneratedMemes = () => {
    UserGeneratedMeme.collection.drop()
}

const getWeeklyPopularMemes = () => {

    return new Promise(resolve => {

        const week = helpers.getWeekNumber()

        WeeklyMeme.find({ week }).limit(sectionLimit).sort('-rating').exec(function (err, res) {
            console.log('weekly popular memes', _.size(res))
            resolve(helpers.arrayToObjById(res))
        })
    })
}

const getSearchMemes = ({ description } = {}) => {

    console.log('9999', description)
    return new Promise(resolve => {
        Meme.find({ description: { $regex: `.*${description}*` } }, function (err, memes) {
            console.log('searched memes', _.size(memes))
            resolve(helpers.arrayToObjById(memes))
        })
    })
}

const saveUserSuggestedMeme = ({ meme } = {}) => {
    return new Promise(resolve => {
        const newMeme = new SuggestedMeme(meme)
        newMeme.save(function (err, res) {

            if (err) return console.error(err)

            console.log(`saved user suggested meme`)

            resolve(res)
        })
    })
}

const getUserSuggestedMemes = () => {
    return new Promise(resolve => {
        SuggestedMeme.find({}, function (err, res) {
            console.log(_.size(res), 'user suggested memes fetched')
            resolve(res)
        })
    })
}

const removeMemeSuggestions = () => {
    SuggestedMeme.collection.drop()

}

const saveUserReport = ({ report }) => {
    return new Promise(resolve => {

        const newReport = new UserReport(report)

        newReport.save(function (err, res) {

            if (err) return console.error(err)

            console.log(`saved user report`)

            resolve(res)
        })
    })
}

const getUserReports = () => {
    return new Promise(resolve => {
        UserReport.find({}).exec(function (err, res) {
            console.log('user reports fetched', _.size(res))
            resolve(res)
        })
    })
}

const updateUserReportLikes = ({ report = {} } = {}) => {
    return new Promise(resolve => {
        UserReport.findOneAndUpdate({ id: report.id }, { $inc: { 'likes': 1 } }, { new: 'true' }).exec(function (err, report = {}) {
            console.log('increment user report likes meme: ' + report)
            resolve(report)
        })
    })
}

const getSingleMeme = ({ id } = {}) => {
    return new Promise(resolve => {
        Meme.find({ id }, function (err, meme) {
            resolve(meme)
        })
    })
}

const updateMeme = ({ meme = {} } = {}) => {
    return new Promise(resolve => {
        Meme.findOneAndUpdate({ id: meme.id }, meme, { upsert: true }, function (err, doc) {
            if (err) resolve(err)
            return resolve("succesfully updated meme")
        })
    })
}

const addPersonalMeme = ({ id, meme } = {}) => {
    return new Promise((resolve, reject) => {
        User.findOneAndUpdate({ _id: id }, { $push: { personalMemes: meme  } },
            function (error, success) {
                if (error) {
                    console.log(error, '----');
                    reject(error);
                } else {
                    console.log(success, '+++');
                    resolve({ ...success, personalMemes: [  ...success.personalMemes, meme ]});
                }
            });

    })
}

const removePersonalMemes = ({ id } = {}) => {
    return new Promise((resolve, reject) => {
        User.findOne({ _id: id }, function(err, userData){
            if(userData){
                userData.personalMemes = [];
                userData.save(function(err) {
                    resolve();
                });
            }
        });
    })
}

const removePersonalMeme = ({ id, memeId } = {}) => {
    return new Promise((resolve, reject) => {
        User.findOne({ _id: id }, function(err, userData){
            if(userData){
                userData.personalMemes = userData.personalMemes.filter(function(meme){ return meme.id != memeId});
                userData.save(function(err) {
                    resolve();
                });
            }
        });
    })
}

const getMemeItems = () => {
    return new Promise(resolve => {
        Item.find({}).exec(function (err, res) {
            console.log('items fetched', _.size(res))
            resolve(res)
        })
    })
}

const saveNewItem = ({ item = {} } = {}) => {
    return new Promise(resolve => {

        const newItem = new Item(item)

        newItem.save(function (err, res) {

            if (err) return console.error(err)

            console.log(`saved new item`)

            resolve(res)
        })
    })
}

const get = {
    getCategory,
    getPopularMemes,
    getNewMemes,
    getMemeSuggestions,
    getRandomMeme,
    getWeeklyPopularMemes,
    getSearchMemes,
    getUserSuggestedMemes,
    getSingleMeme,
    getUserGeneratedMemes,
    getUserReports,
    getMemeItems,
}

const put = {
    updateMeme,
    updateUserReportLikes,
    removePersonalMemes,

}

const deleteApi = {
    removeMemeSuggestions,
}

const post = {
    saveMemeToDataBase,
    incrementMemeRating,
    saveUserSuggestedMeme,
    deleteMeme,
    saveUserGeneratedMeme,
    saveUserReport,
    removeUserGeneratedMemes,
    addPersonalMeme,
    removePersonalMeme,
    saveNewItem,
}


const DbService = {
    init,
    ...deleteApi,
    ...put,
    ...get,
    ...post
}


module.exports = DbService