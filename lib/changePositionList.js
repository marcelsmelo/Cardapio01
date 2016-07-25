module.exports = (params) => {
	logger.debug('[changePositionList]', 'Parametros', params);
    let conditionUpdateList = {};
    let conditionUpdateItem = {};
    let valueInc = 0;
    let Model = params.model;


    conditionUpdateList[params.fieldName] = params.fieldID;
    if (params.newIndex > params.oldIndex) {
        conditionUpdateList.position = {
            $gt: params.oldIndex,
            $lte: params.newIndex
        };
        valueInc = -1;
    } else {
        conditionUpdateList.position = {
            $gte: params.newIndex,
            $lt: params.oldIndex
        };
        valueInc = 1;
    }
	logger.debug('[changePositionList]', 'Condições para update da lista', conditionUpdateList);
    return new Promise((success, reject) => {
        Model.update(conditionUpdateList, {
                $inc: {
                    position: valueInc
                }
            }, {
                multi: true
            })
            .then((result) => {
				logger.debug('[changePositionList]', 'Lista atualizada com sucesso', result);
                conditionUpdateItem[params.fieldName] = params.fieldID;
                conditionUpdateItem._id = params.elementID;
				logger.debug('[changePositionList]', 'Condições para atualizar item', conditionUpdateItem);
                Model.update(conditionUpdateItem, {
                        $set: {
                            position: params.newIndex
                        }
                    }, {
                        multi: false
                    })
                    .then((result) => {
						logger.debug('[changePositionList]', 'Item atualizado com sucesso', result);
                        success({
                            success: true,
                            msg: 'Posição do item alterado com sucesso!'
                        });
                    })
                    .catch((err) => {
						logger.error('[changePositionList]', 'Erro ao atualizar item', err.errmsg);
                        reject({
                            success: false,
                            msg: 'Erro ao atualizar posição do item desejado!',
							err: err.errmsg
                        });
                    })
            })
            .catch((err) => {
				logger.error('[changePositionList]', 'Erro ao atualizar lista', err.errmsg);
                reject({
                    success: false,
                    msg: 'Erro ao atualizar as posições dos itens da lista!',
					err: err.errmsg
                });
            })
    });
}
