const regex = /^[a-z A-Z-_*.&%$#@:?!^()\[\]{}]{6,}$/
module.exports = value => regex.test(value)
