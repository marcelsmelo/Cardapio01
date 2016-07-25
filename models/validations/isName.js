const regex = /^.{3,}$/ //Minimo tres caracteres
module.exports = value => regex.test(value)
