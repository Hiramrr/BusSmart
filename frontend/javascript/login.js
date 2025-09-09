// login.js

document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const message = document.getElementById('loginMessage');

  // Validación simple (puedes cambiar por tu lógica real)
  if (username === 'admin' && password === 'admin') {
    message.style.color = '#2963b3';
    message.textContent = '¡Login exitoso!';
    // Redirigir o hacer otra acción aquí
  } else {
    message.style.color = '#d32f2f';
    message.textContent = 'Usuario o contraseña incorrectos.';
  }
});
