const router = require('express').Router();
const htmlRoutes = require('./html/html-routes');
const apiRoutes = requrie('./api');

router.use('/', htmlRoutes);
router.use('/', apiRoutes);

router.use((req, res) => {
  res.status(404).send('<h1>😝 404 Error!</h1>');
});

module.exports = router;
