const Contact = require('../models/ContactModel.js');

module.exports = {
	form: (req, res, next) =>{
		logger.debug('[Contact Controller]', 'Dados recebidos pelo contato', req.body);
		let newContact = new Contact(req.body);
		newContact.save()
		.then((contact)=>{
			logger.debug('[Contact Controller]', 'Contato salvo com sucesso');
			logger.debug('[Contact Controller]', 'Chamar envio de email...');

			require('../lib/email/contactEmail.js')(req.body)
			.then((result)=>{
				logger.debug('[Contact Controller]', 'Email enviado com sucesso', result);
				res.status(200).json({success: true, msg: 'Contato salvo com sucesso. Email enviado com sucesso'})
			})
			.catch((err)=>{
				logger.error('[Contact Controller]', 'Erro ao enviar email', err);
				res.status(500).json({success: false, msg: 'Contato salvo com sucesso. Erro ao enviar o email. Tente novamente!'});
			});
		})
		.catch((err) => {
			logger.error('[Contact Controller]', 'Erro ao salvar contato no BD');
			res.status(500).json({success: false, msg: 'Erro ao salvar contato. Tente novamente!', err: err.errmsg});
		});


	},
};
