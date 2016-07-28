const request = require('request');
const xml2js = require('xml2js');
const pagSeguroConfig = require('../config/pagSeguroConfig.js');
const Company = require('../models/CompanyModel.js');
const Payment = require('../models/PaymentModel.js');

module.exports = {
    assinatura: (req, res, next) => {
        const email = pagSeguroConfig.emailSandbox;
        const token = pagSeguroConfig.tokenSandbox;

		Company.findOne({_id: req.companyID}, {paymentService: 1, subscription: 1})
			.then((company) => {
				if(company.subscription != 'ACTIVE' || company.subscription.status != 'PENDING'){
					let endDate = new Date();
					endDate.setFullYear(endDate.getFullYear() + 2);

					const params = {
						'reference': req.companyID,
						preApproval: {
							'charge': 'auto',
							'name': 'Assinatura mensal Cardapio01',
							'amountPerPayment': '50.00',
							'period': 'Monthly',
							'finalDate': endDate.toISOString(),
							'maxTotalAmount': '1200.00'
						}
					};

					logger.debug('[Pagseguro Controller]', 'Parâmetros assinatura (JSON)', params);


					// const testeXML = parser2xml('preApprovalRequest', data);
					// logger.debug('[Pagseguro Controller]', '2XML', testeXML);

					let builder = new xml2js.Builder({
						rootName: 'preApprovalRequest'
					});
					let paramsXml = builder.buildObject(params);
					logger.debug('[Pagseguro Controller]', 'Parâmetros assinatura (XML)', paramsXml);


					let options = {
						uri: 'https://ws.sandbox.pagseguro.uol.com.br/v2/pre-approvals/request?email=' + email + '&token=' + token,
						method: 'POST',
						headers: {
							'Content-Type': 'application/xml; charset=UTF-8'
						},
						body: paramsXml
					}

					request(options, function(errPS, responsePS, bodyPS) {
						if (errPS) {
							logger.error('[Pagseguro Controller]', 'Erro ao gerar Token para assinatura', errPS);
							res.status(500).json({
								success: false,
								msg: 'Erro ao gerar link do Pagseguro. Tente novamente!'
							})
						}
						logger.debug('[Pagseguro Controller]', 'Token da assinatura gerado (XML)', bodyPS);
						let parse2json = xml2js.parseString;
						parse2json(bodyPS, {
							'explicitArray': false
						}, (errParse, resultParse) => {
							if (errParse) {
								logger.error('[Pagseguro Controller]', 'Erro parser XML para JSON', errParse);
								res.status(500).json({
									success: false,
									msg: 'Erro ao gerar link do Pagseguro. Tente novamente!'
								})
							}
							logger.debug('[Pagseguro Controller]', 'Token da assinatura (JSON)', resultParse);
							let code = resultParse.preApprovalRequest.code;
							let baseURL = 'https://sandbox.pagseguro.uol.com.br/v2/pre-approvals/request.html?code=';
							logger.debug('[Pagseguro Controller]', 'URL para realização da assinatura', baseURL + code);
							res.status(200).json({
								success: true,
								url: baseURL + code
							});
						});
					});
				}else{
					logger.error('[Company Controller]', 'O usuário já possui uma assinatura ativa!!!', company.payment);
					res.status(200).json({
						success: false,
						url: '',
						msg: 'O usuário já possui uma assinatura ativa!!!'
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
    },

    //https://sandbox.pagseguro.uol.com.br/v2/pre-approvals/request.html?code=658EC868171728C33474EFAB64FC1D7C
    notificacao: (req, res, next) => {
        if (req.body.errors) {
            logger.error('[Pagseguro Controller]', 'Notificação de erro do Pagseguro', req.body.errors);
            res.status(200).json({
                success: true
            });
        }

        logger.debug('[Pagseguro Controller]', 'Notificação Pagseguro', req.body);

        const email = pagSeguroConfig.emailSandbox;
        const token = pagSeguroConfig.tokenSandbox;
        const notificationType = req.body.notificationType;

        let baseURL = '';
        if (notificationType == 'transaction') {
            baseURL = 'https://ws.sandbox.pagseguro.uol.com.br/v3/transactions/notifications/';
        } else if (notificationType == 'preApproval') {
            baseURL = 'https://ws.sandbox.pagseguro.uol.com.br/v2/pre-approvals/notifications/';
        }

        let options = {
            uri: baseURL + req.body.notificationCode + '?email=' + email + '&token=' + token,
            method: 'GET'
        }

        logger.debug('[Pagseguro Controller]', 'Parametros para consultar notificação', options);

        request(options, (errPS, responsePS, bodyPS) => {
            if (errPS) {
                logger.error('[Pagseguro Controller]', 'Erro ao gerar recuperar dados da notificação', errPS);
                res.status(200).json({
                    success: true
                });
            }
            logger.debug('[Pagseguro Controller]', 'Dados da notificação (XML)', bodyPS);
            let parse2json = xml2js.parseString;
            parse2json(bodyPS, {
                'explicitArray': false
            }, (errParse, resultParse) => {
				if(errParse){
					logger.error('[Pagseguro Controller]', 'Erro ao gerar recuperar dados da notificação', errParse);
					res.status(200).json({
	                    success: true
	                });
				}
                logger.debug('[Pagseguro Controller]', 'Dados da notificação (JSON)', resultParse);

                let updateData = {
					status: false,
					paymentService: 'pagseguro'
				};

				let notificationData = {
					code: resultParse[notificationType].code,
					date: new Date(resultParse[notificationType].date),
					status: resultParse[notificationType].status,
					lastEventDate: new Date(resultParse[notificationType].lastEventDate),
					tracker: resultParse[notificationType].tracker ? resultParse[notificationType].tracker : undefined
				}

                if (notificationType == 'transaction'){
					if(resultParse[notificationType].status == 2 || resultParse[notificationType].status == 3)
						updateData.status = true
					updateData.transaction = notificationData;
				}else if(notificationType == 'preApproval'){
					if(resultParse[notificationType].status == 'ACTIVE')
						updateData.status = true
					updateData.subscription = notificationData;
				}
						companyStatus = true;

                logger.debug('[Pagseguro Controller]', 'Status da Company a ser atualizado', companyStatus);

                Company.update({
                        _id: resultParse[notificationType].reference
                    }, {
                        $set: updateData
                    })
                    .then((companyMod) => {
                        logger.debug('[Pagseguro Controller]', 'Status Company atualizado', companyMod);
                        let values = {
                            companyID: resultParse[notificationType].reference,
                            service: 'Pagseguro',
                            infoType: notificationType,
                            data: updateData
                        };
                        logger.debug('[Pagseguro Controller]', 'Salvar dados da notificação', values);
                        let newPayment = new Payment(values).save();
                        res.status(200).json({
                            success: true
                        });
                    })
                    .catch((err) => { //Caso algum erro ocorra
                        logger.error('[Pagseguro Controller]', 'Erro ao atualizar status da Company', err.errmsg);
                        res.status(200).json({
                            success: true
                        });
                    });
            });
        });
    },

    cancelar: (req, res, next) => {
        const email = pagSeguroConfig.emailSandbox;
        const token = pagSeguroConfig.tokenSandbox;

		Company.findOne({_id: req.companyID}, {paymentService: 1, subscription: 1, transaction: 1})
			.then((company) => {
				logger.debug('[Pagseguro Controller]', 'Dados da Company para cancelar assinatura', company);
                if (company.subscription.status == 'ACTIVE') {
                    let baseURL = 'https://ws.sandbox.pagseguro.uol.com.br/v2/pre-approvals/cancel/';
                    let options = {
                        uri: baseURL + company.payment.subscriptionID + '?email=' + email + '&token=' + token,
                        method: 'GET'
                    }
                    logger.debug('[Pagseguro Controller]', 'Dados para realizar o cancelamento', options);
                    request(options, (errPS, responsePS, bodyPS) => {
                        if (errPS) {
                            logger.error('[Pagseguro Controller]', 'Erro no cancelamento da assinatura', errPS);
                            res.status(500).json({
                                success: false,
                                msg: 'Assinatura não cancelada. Tente novamente!'
                            })
                        }
                        logger.debug('[Pagseguro Controller]', 'Resultado do cancelamento Pagseguro (XML)', bodyPS);
                        let parse2json = xml2js.parseString;
                        parse2json(bodyPS, {
                            'explicitArray': false
                        }, (errParse, resultParse) => {
							if(errParse){
								logger.error('[Pagseguro Controller]', 'Erro ao gerar cancelar assinatura', errParse);
								res.status(500).json({
				                    success: false,
									msg: 'Assinatura não cancelada. Tente novamente!'
				                });
							}
							logger.debug('[Pagseguro Controller]', 'Resultado do cancelamento Pagseguro (JSON)', resultParse);
                            res.status(200).json({
                                success: true,
								msg: 'Assintura cancelada com sucesso!'
                            });
                        });
                    });
                }else{
					logger.debug('[Pagseguro Controller]', 'O usuário não possui uma assinatura ativa!', company);
					res.status(200).json({
						success: false,
						msg: 'Erro ao cancelar assinatura. O usuário não possui uma assinatura ativa!'
					});
				}
			})
			.catch((err) => {
				logger.error('[Pagseguro Controller]', 'Erro ao recuperar company',err.errmsg);
				res.status(200).json({
					success: false,
					msg: 'Erro ao recuperar dados da empresa!',
					err: err.errmsg
				});
			})
    }

};
