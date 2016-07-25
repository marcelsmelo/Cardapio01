const request = require('request');
const xml2js = require('xml2js');
const pagSeguroConfig = require('../config/pagSeguroConfig.js');
const Company = require('../models/CompanyModel.js');
const Payment = require('../models/PaymentModel.js');

module.exports = {
    assinatura: (req, res, next) => {
        const email = pagSeguroConfig.emailSandbox;
        const token = pagSeguroConfig.tokenSandbox;

        let endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 2);

        const params = {
            'reference': '573b8cf7da7504af0ae33501', //TODO ID da empresa
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

                let companyStatus = false;
                if (notificationType == 'transaction' &&
                    (resultParse[notificationType].status == 2 || resultParse[notificationType].status == 3))
                    companyStatus = true;
                else if (notificationType == 'preApproval' && (resultParse[notificationType].status == 'ACTIVE'))
                    companyStatus = true;

                logger.debug('[Pagseguro Controller]', 'Status da Company a ser atualizado', companyStatus);

                Company.update({
                        _id: resultParse[notificationType].reference
                    }, {
                        $set: {
                            'status': companyStatus
                        }
                    })
                    .then((companyMod) => {
                        logger.debug('[Pagseguro Controller]', 'Status Company atualizado', companyMod);
                        let values = {
                            companyID: resultParse[notificationType].reference,
                            service: 'Pagseguro',
                            infoType: notificationType,
                            data: {
                                code: resultParse[notificationType].code,
                                date: resultParse[notificationType].date,
                                status: resultParse[notificationType].status,
                                lastEventDate: resultParse[notificationType].lastEventDate,
                                tracker: resultParse[notificationType].tracker ? resultParse[notificationType].tracker : undefined
                            }
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

        Company.findOne({
                _id: '573b8cf7da7504af0ae33501'
            }, {
                subscription: 1,
                status: 1
            })
            .then((company) => {
                logger.debug('[Pagseguro Controller]', 'Dados da Company para cancelar assinatura', company);
                if (company.subscription.status == 'ACTIVE') {
                    let baseURL = 'https://ws.sandbox.pagseguro.uol.com.br/v2/pre-approvals/cancel/';
                    let options = {
                        uri: baseURL + company.subscription.code + '?email=' + email + '&token=' + token,
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
								logger.error('[Pagseguro Controller]', 'Erro ao gerar cancelar assintura', errParse);
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
                }
            })
            .catch((err) => {
                logger.error('[Pagseguro Controller]', 'Erro ao buscar informações da Empresa para cancelamento', err.errmsg);
                res.status(500).json({
                    success: false,
					msg: 'Erro ao cancelar assinatura. Tente novamente!',
					err: err.errmsg
                });
            });
    }

};
