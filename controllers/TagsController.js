const Company = require('../models/CompanyModel.js');
const amazonConfig = require('../config/amazonConfig.js');

module.exports = {
    generateTags: (req, res, next) => {
		logger.debug('[Tags Controller]', 'Parametros generateTags', req.companyID);
        require('../lib/generateTags.js')(req.companyID)
            .then((success) => {
                logger.debug('[Tags Controller]', 'Arquivo Tags gerado com sucesso', success);
				success.qrCode = `${amazonConfig.baseURL}/${params.bucket}/${req.companyID}_qrCode.png`
				res.status(200).json(success);
            })
            .catch((err) => {
                logger.error('[Tags Controller]', 'Erro ao gerar arquivo de tags', err);
                res.status(500).json(err);
            });
    },

    getTags: (req, res, next) => {
        logger.debug('[Tags Controller]', 'Parametros getTags', req.companyID);
        Company.findOne({
                _id: req.companyID
            }, {
                tags: 1
            })
            .then((company) => {
                logger.debug('[Tags Controller]', 'URL de tags recuperada');
                res.status(200).json({
                    success: true,
                    url: company.tags,
					qrCode: `${amazonConfig.baseURL}/${params.bucket}/${req.companyID}_qrCode.png`
                });
            })
            .catch((err) => {
                logger.error('[Tags Controller]', 'Erro ao recuperar URL de Tags', err.errmsg);
                res.status(500).json({
                    success: false,
                    msg: 'Erro ao recuerar etiquetas. Tente novamente!',
					err: err.errmsg
                });
            })
    },
};
