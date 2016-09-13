
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const Company = require('../../models/CompanyModel.js');

module.exports = (params)=>{
	logger.debug('[MailGun - Payment]', 'Preparando para enviar e-mail');
	const config = require('../../config/mailgun.js');
	const mailgun = require('mailgun-js')({apiKey: config.apiKey, domain: config.domain});

	logger.debug('[MailGun - Payment]', 'Verificando template a ser utilizado no email');
	let templatePath = '';
	if (params.notificationType == 'transaction'){
		if(params.status == 2 || params.status == 3){
			templatePath = path.join(__dirname, './template/transactionReceived.html');
		}else{
			templatePath = path.join(__dirname, './template/transactionNotReceived.html');
		}
	}else if(params.notificationType == 'preApproval'){
		if(params.status == 'ACTIVE'){
			templatePath = path.join(__dirname, './template/signatureActive.html');
		}else{
			templatePath = path.join(__dirname, './template/signatureNotActive.html');
		}
	}
	logger.debug('[MailGun - Payment]', 'Caminho do template de email a ser enviado', templatePath);
	logger.debug('[MailGun - Payment]', 'Configurando parâmetros para gerar HTML do e-mail');

	const templateHTML = fs.readFileSync(templatePath, 'utf8');
	const template = handlebars.compile(templateHTML); //Compila o template HTML usando Handlebars
	logger.debug('[MailGun - Payment]', 'Parametros configurados. Buscar Dados Empresa');
	Company.find({_id: params._id},{email:1, fantasyName:1})
	.then((company)=>{
		logger.debug('[MailGun - Payment]', 'Dados da empresa recuperados com sucesso');
		const templateData = {
			name: company.fantasyName
		};
		const htmlResult = template(templateData);
		logger.debug('[MailGun - Payment]', 'HTML Gerado com sucesso');
		let logoImagePath = path.join(__dirname, './template/logo-cardapio01.png');

		logger.debug('[MailGun - Payment]', 'Configurando parâmetros para envio');
		let data = {
		  from: 'Cardapio01 <no-reply@cardapio01.com>',
		  to: 'marcel.msmelo@gmail.com',//company.email
		  subject: 'Cardapio01 - Contato Site',
		  html: htmlResult,
		  inline: logoImagePath
		};

		logger.debug('[MailGun- Payment ]', 'Enviando E-mail...');

		return mailgun.messages().send(data);
	})
	.catch((err) => {
		return new Promise((success, reject) => {
			reject(err.errmsg);
		});
	});



};
