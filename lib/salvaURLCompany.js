const Company = require('../models/CompanyModel.js');

module.exports = (params)=>{
  return Company.update({_id: params.companyID}, {$set: {params.field: params.url}});
}
