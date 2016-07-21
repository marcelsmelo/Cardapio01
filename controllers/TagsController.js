const Company = require('../models/CompanyModel.js');


module.exports = {
    generateTags: (req, res, next) =>{
        require('../lib/generateTags.js')(req.companyID)
        .then((success)=>{
            logger.debug('[Tags Controller]', 'Retorno gerar arquivo Tags', success);
            res.status(200).json(success);
        })
        .catch((err) => {
            logger.error('[Tags Controller]', 'Erro ao gerar arquivo de tags', err);
            res.status(500).json(err);
        });
    },

    getTags: (req, res, next)=>{
        Company.findOne({_id: req.companyID},{tags: 1})
        .then((company)=>{
            logger.debug('[Tags Controller]', 'URL de tags recuperada', company);
            res.status(200).json({success: true, url: company.tags});
        })
        .catch((err)=>{
            logger.error('[Tags Controller]', 'Erro ao recuperar URL de Tags', err);
            res.status(500).json({success: false, msg: 'Erro ao recuerar etiquetas. Tente novamente!'});
        })
    },
};
