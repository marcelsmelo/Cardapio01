module.exports = (categoryID)=> {
  const CategoryStatistics = require('../models/CategoryStatistics.js');
  const date = new Date();
  const stringDate = date.getDate() +"/"+ date.getMonth() +"/"+ date.getFullYear();

  CategoryStatistics.update({categoryID: categoryID, date: stringDate}, {$inc: {count: 1}}, {upsert: true, setDefaultsOnInsert: true})
  .then((data)=>{
    //
  })
  .catch((err)=>{
    //
  });
}
