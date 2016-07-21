const Company = require('../models/CompanyModel.js');


module.exports = {
    generateTags: (req, res, next) =>{
        require('../lib/generateTags.js')(req.companyID)
        .then((success)=>{
            logger.debug('[Tags Controller]', 'Retorno S3', success);
            Company.update({_id: companyID}, {$set: {tags: success.url}})
            .then((company)=>{
              logger.debug('[Tags Controller]', 'Salvar URL Tags', company);
              success.msg = 'Arquivo de etiquetas criado com sucesso!';
              res.status(200).json(success);
            })
            .catch((err)=>{
              logger.error('[Tags Controller]', 'Erro ao salvar URL Tags', err);
              res.status(500).json({success: false, msg: 'Erro ao salvar a URL do arquivo de etiquetas. Tente novamente!'});
            })
        })
        .catch((err) => {
            logger.error('[Tags Controller]', 'Erro ao salvar Tags S3', err);
            err.msg = 'Erro ao criar arquivo de etiquetas. Tente novamente!';
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
