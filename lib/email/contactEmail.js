const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');

module.exports = (params)=>{
	logger.debug('[MailGun - Contact]', 'Preparando para enviar e-mail');
	const config = require('../../config/mailgun.js');
	const mailgun = require('mailgun-js')({apiKey: config.apiKey, domain: config.domain});

	logger.debug('[MailGun - Contact]', 'Configurando parâmetros para gerar HTML do e-mail');
	const templatePath = path.join(__dirname, './template/contactEmail.html');
	const templateHTML = fs.readFileSync(templatePath, 'utf8');
	const template = handlebars.compile(templateHTML); //Compila o template HTML usando Handlebars
	const templateData = {
		name: params.name,
		email:params.email,
		subject: params.subject,
		message: params.message
	};
	const htmlResult = template(templateData);
	logger.debug('[MailGun - Contact]', 'HTML Gerado com sucesso');


	logger.debug('[MailGun - Contact]', 'Configurando parâmetros para envio');
	let logoImagePath = path.join(__dirname, './template/logo-cardapio01.png');

	let data = {
	  from: 'Cardapio01 <contact@cardapio01.com>',
	  to: 'marcel.msmelo@gmail.com',
	  cc: 'luiz.alexandre@live.com',
	  subject: 'Cardapio01 - Contato Site',
	  html: htmlResult,
	  inline: logoImagePath
	};

	logger.debug('[Contact MailGun]', 'Enviando E-mail...');

	return mailgun.messages().send(data);

};
