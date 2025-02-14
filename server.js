const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);

// Add custom route for password change
server.patch('/users/:id', (req, res, next) => {
  const db = router.db; // Get the lowdb instance
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;

  const user = db.get('users').find({ id }).value();

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // In a real app, you would hash and compare passwords
  if (user.password !== currentPassword) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }

  // Update the password
  db.get('users')
    .find({ id })
    .assign({ 
      password: newPassword,
      updated_at: new Date().toISOString() 
    })
    .write();

  res.json(user);
});

server.use(router);
server.listen(3001, () => {
  console.log('JSON Server is running');
}); 