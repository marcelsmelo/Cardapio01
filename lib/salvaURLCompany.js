const Company = require('../models/CompanyModel.js');

module.exports = (params)=>{
  Company.update({_id: params.companyID}, {$set: {params.field: params.url}})
  .then((success)=>{
    //
  })
  .catch((err) => {
    //
  })
}
