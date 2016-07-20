const Company = require('../models/CompanyModel.js');


module.exports = {
    generateTags: (req, res, next) =>{
        require('../lib/generateTags.js')(req.companyID)
        .then((success)=>{
            res.status(200).json(success);
        })
        .catch((err)=>{
            res.status(500).json(err);
        })
    },

    getTags: (req, res, next)=>{
        Company.findOne({_id: req.companyID},{tags: 1})
        .then((company)=>{
            res.status(200).json({success: true, url: company.tags});
        })
        .catch((err)=>{
            res.status(500).json({success: false, msg: 'Erro ao recuerar etiquetas. Tente novamente!'});
        })
    },
};
