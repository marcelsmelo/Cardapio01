const jwt = require('jsonwebtoken');
const config = require('../config/config.js');
const Company = require('../models/CompanyModel.js');


module.exports = (req, res, next) => {
	logger.debug('[jwtVerify]', 'Parametros', req.headers['x-access-token']);
    // check header or url parameters or post parameters for token
    var token = req.headers['x-access-token'];

    // decode token
    if (token) {
		logger.debug('[jwtVerify]', 'Token existente', req.headers['x-access-token']);
		logger.debug('[jwtVerify]', 'Buscar uma empresa com o token passado');
        // verifies secret and checks exp
        Company.findOne({
                accessToken: token
            }).lean()
            .then((company) => {
                if (!company) { //Não encontre companhia cadastrada com o token passado
					logger.error('[jwtVerify]', 'Não foi encontrada Empresa com o token passado', company);
                    return res.status(401).json({
                        success: false,
                        msg: 'Token inválido!'
                    });
                }
				logger.debug('[jwtVerify]', 'Empresa encontrada com o token passado', company);
				logger.debug('[jwtVerify]', 'Verificar validade do token', company);
                jwt.verify(token, config.secret, function(err, decoded) {
                    if (err) {
						logger.error('[jwtVerify]', 'Falha ao verificar validade do token', err);
                        return res.status(401).json({
                            success: false,
                            msg: 'Falha ao verificar token de acesso. Tente novamente!'
                        });
                    } else {
                        logger.debug('[jwtVerify]', 'Token valido. Salvar valor do token na req.companyID', decoded._id);
                        req.companyID = decoded._id;
                        next();
                    }
                });
            })
            .catch((err) => { //Não seja encontrado um token válido no BD
				logger.error('[jwtVerify]', 'Token inválido. Nenhuma empresa com o token passado', err);
                return res.status(401).json({
                    success: false,
                    msg: 'Token Inválido!'
                });
            });
    } else {
		logger.error('[jwtVerify]', 'Não foi passado token no HEADER');
        // if there is no token
        // return an error
        return res.status(401).json({
            success: false,
            message: 'O envio do token é obrigatório!'
        });
    }
};
