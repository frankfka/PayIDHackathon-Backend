const paymentService = require('../services/payments')

module.exports = function(app) {
    app.get('/pages/:id', (req, res) => paymentService.find(req, res))

    app.delete('/pages/:id', (req,res) => paymentService.delete(req, res))
    
    app.post('/pages', (req, res) => paymentService.create(req, res))

    app.post('/test/pages', (req, res) => paymentService.test_create(req, res))
    
    app.post('/pages/verify/:id', (req, res) => paymentService.verify(req, res))
}