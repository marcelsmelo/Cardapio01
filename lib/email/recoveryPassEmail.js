const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');

module.exports = (params)=>{
	logger.debug('[RecoveryPass - MailGun]', 'Preparando para enviar e-mail');
	const config = require('../config/mailgun.js');
	const mailgun = require('mailgun-js')({apiKey: config.apiKey, domain: config.domain});

	logger.debug('[RecoveryPass - MailGun]', 'Configurando parâmetros para gerar HTML do e-mail');
	const templatePath = path.join(__dirname, './template/recoveryPassEmail.html');
	const templateHTML = fs.readFileSync(templatePath, 'utf8');
	const template = handlebars.compile(templateHTML); //Compila o template HTML usando Handlebars
	const templateData = {
		name: params.fantasyName
	};
	const htmlResult = template(templateData);
	logger.debug('[RecoveryPass - MailGun]', 'HTML Gerado com sucesso');

	logger.debug('[Send MailGun]', 'Configurando parâmetros para envio');
	let logoImagePath = path.join(__dirname, './template/logo-cardapio01.png');

	let data = {
	  from: 'Cardapio01 <pass-recovery@cardapio01.com>',
	  to: 'marcel.msmelo@gmail.com',
	  subject: 'Cardapio01 - Recuperação de senha',
	  html: htmlResult,
	  inline: logoImagePath
	};
	//@TODO Melhorar testo de recuperação senha
	logger.debug('[Send MailGun]', 'Enviando E-mail...');

	return mailgun.messages().send(data);

};
