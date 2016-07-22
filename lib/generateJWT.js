const config = require('../config/config.js');
const jwt = require('jsonwebtoken');
const Company = require('../models/CompanyModel.js');


module.exports = (company) => {
    logger.debug('[generateJWT]', 'Parametros', company._id);
    return new Promise((success, reject) => {
        //cria o token com validade de 24h
        let token = jwt.sign({
            _id: company._id
        }, config.secret, {
            expiresIn: 14400 //(seconds) 24h
        });
		logger.debug('[generateJWT]', 'Token gerado com sucesso', token);
		logger.debug('[generateJWT]', 'Salvar token no BD...');
        //Salva o Token criado para conferencia
        Company.update({
                _id: company._id
            }, {
                $set: {
                    accessToken: token
                }
            })
            .then((companyMod) => { //É retornado o token salvo no BD
				logger.debug('[generateJWT]', 'Token salvo com sucesso', companyMod);
                success({
                    success: true,
                    token: token
                });
            })
            .catch((err) => { //Caso algum erro ocorra, inviabiliza o token
				logger.error('[generateJWT]', 'Erro ao salvar token no DB', err);
                reject({
                    success: false,
                    token: null
                });
            });
    });
}
