const Company = require('../models/CompanyModel.js');

module.exports = {

    get: (req, res, next) => {
        logger.debug('[Company Controller]', 'Parametros GETCompany', req.companyID);
        let companyID = req.companyID;
        Company.findOne({
                _id: companyID
            }).lean()
            .then((company) => {
                logger.debug('[Company Controller]', 'Dados da empresa recuperados com sucesso', company);
                res.status(200).json({
                    success: true,
                    company: company
                })
            })
            .catch((err) => { //Caso algum erro ocorra
                logger.error('[Company Controller]', 'Erro ao recuperar dados da empresa', err.errmsg);
                res.status(500).json({
                    success: false,
                    msg: 'Erro ao buscar os dados da companhia!',
                    company: null,
                    err: err.errmsg
                });
            });
    },

    edit: (req, res, next) => {
        logger.debug('[Company Controller]', 'Parametros editCompany', req.companyID, req.body);
        //Pegar dados da compania logada, via token
        const companyID = req.companyID;
        const companyUpd = {
            fantasyName: req.body.fantasyName,
            corporateName: req.body.corporateName,
            email: req.body.email,
            cpnj: req.body.cpnj,
            phone: req.body.phone,
            address: req.body.address,
            social: req.body.social,
        };

        Company.update({
                _id: companyID
            }, {
                $set: companyUpd
            })
            .then((companyMod) => { //Caso a companhia seja alterada com sucesso, a retorna ao cliente
                //Como foi realizada uma alteração nos dados do usuário, um novo token é gerado
                //cria o token com validade de 24h
                logger.debug('[Company Controller]', 'Empresa editada com sucesso', companyMod);
                logger.debug('[Company Controller]', 'Gerar novo token...');
                require('../lib/generateJWT.js')(companyMod)
                    .then((success) => {
                        logger.debug('[Company Controller]', 'Token gerado com sucesso', success);
                        res.status(200).json(success);
                    })
                    .catch((err) => {
                        logger.error('[Company Controller]', 'Erro ao gerar novo token', err);
                        err.msg = "Erro ao gerar token na edição da empresa. Tente novamente!";
                        res.status(500).json(err);
                    })
            })
            .catch((err) => { //Caso aconteca algum erro na edição
                logger.error('[Company Controller]', 'Erro ao editar empresa', err.errmsg);
                res.status(500).json({
                    success: false,
                    token: null,
                    msg: 'Erro ao editar Empresa. Tente novamente!',
                    err: err.errmsg
                });
            });
    },

    changePassword: (req, res, next) => {
        //Pegar dados da compania logada, via token
        logger.debug('[Company Controller]', 'Parametros changePassword', req.companyID, req.body);
        const companyID = req.companyID;
        let fields = {
            email: 1,
            password: 1
        };

        Company.findOne({
                _id: companyID
            }, fields)
            .then((company) => {
                logger.debug('[Company Controller]', 'Dados da empresa recuperados', company);
                if (!company) { //Não foi encontrado companhia com o name passado
                    logger.debug('[Company Controller]', 'Erro ao encontrar empresa com email passado', company);
                    res.status(500).json({
                        success: false,
                        token: null,
                        msg: 'A autenticação falhou. Empresa não encontrada!'
                    });
                } else {
                    logger.debug('[Company Controller]', 'Empresa encontrada. Verificar senha passada', company);
                    company.comparePassword(req.body.oldPassword, (err, isMatch) => {
                        if (isMatch && !err) { //Caso a senha passada esteja correta
                            //Altera somente o password da compania logada
                            logger.debug('[Company Controller]', 'Senha correta. Atualizar senha no DB...');
                            Company.findOneAndUpdate({
                                    _id: companyID
                                }, {
                                    password: req.body.newPassword
                                })
                                .then((companyMod) => { //Caso a companhia seja alterada com sucesso, a retorna ao cliente
                                    logger.debug('[Company Controller]', 'Senha atualizada com sucesso', companyMod);
                                    if (companyMod) {
                                        logger.debug('[Company Controller]', 'Gerar novo Token...');
                                        require('../lib/generateJWT.js')(companyMod)
                                            .then((success) => {
                                                logger.debug('[Company Controller]', 'Token gerado com sucesso. Senha alterada!', success);
                                                success.msg = "Senha alterada com sucesso!";
                                                res.status(200).json(success);
                                            })
                                            .catch((err) => {
                                                logger.error('[Company Controller]', 'Erro ao gerar token. Senha não alterada', err);
                                                err.msg = "Erro ao alterar senha. Tente novamente!";
                                                res.status(500).json(err);
                                            });
                                    } else {
                                        logger.error('[Company Controller]', 'Erro ao salvar senha no DB');
                                        res.status(500).json({
                                            success: false,
                                            token: null,
                                            msg: "Erro ao alterar a senha. Tente novamente!"
                                        });
                                    }
                                })
                                .catch((errUp) => { //Caso aconteca algum erro na edição
                                    logger.error('[Company Controller]', 'Erro ao salvar senha no DB', errUp.errmsg);
                                    res.status(500).json({
                                        success: false,
                                        token: null,
                                        msg: 'Atualização da senha falhou. Tente novamente!',
                                        err: errUp.errmsg
                                    });
                                });
                        } else { //Senha não corresponde com a cadastrada
                            logger.error('[Company Controller]', 'Senha antiga informada não está correta');
                            res.status(500).json({
                                success: false,
                                token: null,
                                msg: 'A autenticação falhou. Senha incorreta!',
                                err: err
                            })
                        }
                    });
                }
            })
            .catch((err) => { //Erro ao buscar usuário e/ou senha
                logger.error('[Company Controller]', 'Erro ao recuperar dados da empresa', err.errmsg);
                res.status(500).json({
                    success: false,
                    msg: 'A autenticação falhou. Usuário e/ou Senha incorretos!',
                    err: err.errmsg
                });
            });
    },

    changeStatus: (req, res, next) => {
        logger.debug('[Company Controller]', 'Parametros changeStatus', req.companyID, req.body);
        const companyID = req.companyID;

        Company.update({
                _id: companyID
            }, {
                $set: {
                    status: req.body.status
                }
            })
            .then((item) => {
                logger.debug('[Company Controller]', 'Status da empresa alterado com sucesso', item);
                res.status(200).json({
                    success: true,
                    msg: 'Status da Empresa alterado com sucesso!'
                });
            })
            .catch((err) => {
                logger.error('[Company Controller]', 'Erro ao alterar status da empresa', err.errmsg);
                res.status(500).json({
                    success: false,
                    msg: 'Erro ao atulizar o Status da Empresa. Tente novamente!',
                    err: err.errmsg
                });
            });
    },

    uploadLogo: (req, res, next) => {
        logger.debug('[Company Controller]', 'Upload do logo da empresa');
        require('../lib/uploadImageS3.js')(req.companyID, 'logo', req.body.image)
            .then((success) => {
                logger.debug('[Company Controller]', 'Sucesso ao fazer upload do logo para S3', success);
                logger.debug('[Company Controller]', 'Salvar URL no DB...');
                Company.update({
                        _id: req.companyID
                    }, {
                        $set: {
                            'images.logo': success.url
                        }
                    })
                    .then((company) => {
                        logger.debug('[Company Controller]', 'URL salva com sucesso.', company);
                        success.msg = 'Logo da empresa enviado com sucesso!';
                        res.status(200).json(success);
                    })
                    .catch((errBD) => {
                        logger.error('[Company Controller]', 'Erro ao salvar URL no DB', errBD.errmsg);
                        res.status(500).json({
                            success: false,
                            msg: 'Erro ao salvar a URL do logo. Tente novamente!',
                            err: errBD.errmsg
                        });
                    })
            })
            .catch((err) => {
                logger.error('[Company Controller]', 'Error ao enviar logo da empresa ao S3', err);
                err.msg = 'Erro ao enviar o logo da empresa. Tente novamente!';
                res.status(500).json(err);
            })
    },

    uploadBanner: (req, res, next) => {
        logger.debug('[Company Controller]', 'Upload do banner da empresa');
        require('../lib/uploadImageS3.js')(req.companyID, 'banner', req.body.image)
            .then((success) => {
                logger.debug('[Company Controller]', 'Sucesso ao fazer upload do banner para S3', success);
                logger.debug('[Company Controller]', 'Salvar URL no DB...');
                Company.update({
                        _id: req.companyID
                    }, {
                        $set: {
                            'images.banner': success.url
                        }
                    })
                    .then((company) => {
                        logger.debug('[Company Controller]', 'URL salva com sucesso.', company);
                        success.msg = 'Banner da empresa enviado com sucesso!';
                        res.status(200).json(success);
                    })
                    .catch((errBD) => {
                        logger.error('[Company Controller]', 'Erro ao salvar URL no DB', errBD.errmsg);
                        res.status(500).json({
                            success: false,
                            msg: 'Erro ao salvar a URL do logo. Tente novamente!',
                            err: errBD.errmsg
                        });
                    })
            })
            .catch((err) => {
                logger.error('[Company Controller]', 'Error ao enviar logo da empresa ao S3', err);
                err.msg = 'Erro ao enviar o Banner da empresa. Tente novamente!';
                res.status(500).json(err);
            })
    },

    uniqueFieldVerify: (req, res, next) => {
		logger.debug('[Company Controller]', 'Parâmetro Unique Field Verify', req.body);
        const fieldValue = req.body.fieldValue;
		const fieldName = req.body.fieldName;
		let validator = false;
		switch (fieldName) {
			case 'email':
				validator = require('../models/validations/isEmail.js')(fieldValue);
				break;
			case 'cnpj':
				validator = require('../models/validations/isCnpjOrCpf.js')(fieldValue);
				break;
			case 'corporateName':
				validator = require('../models/validations/isName.js')(fieldValue);
				break;
			default:
				break;
		}
		logger.debug('[Company Controller]', 'Validator Field Verify', validator);
		if(!validator){
			res.status(200).json({
				success: false,
				msg: `O ${fieldValue} não é um ${fieldName} válido!`
			})
		}else{
			const param = {};
			param[fieldName] = fieldValue;
			const field = {_id:1};
			Company.find(param, field)
	            .then((company) => {
	                if (company.length >= 1){
						logger.debug('[Company Controller]', 'Company Recuperada', company);
	                    res.status(200).json({
	                        success: false,
	                        msg: `${fieldName}: ${fieldValue} já cadastrado!`
	                    });
					}else{
						logger.debug('[Company Controller]', 'Nenhuma Company Recuperada');
						res.status(200).json({
		                    success: true
		                });
					}
	            })
	            .catch((err) => {
					logger.error('[Company Controller]', 'Erro ao recuperar company',err.errmsg);
	                res.status(200).json({
	                    success: false,
	                    msg: 'Erro ao recuperar dados da empresa!',
						err: err.errmsg
	                });
	            })
		}
    },
}
