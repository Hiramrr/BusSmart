export const mostrarAlertaExito = (title, text, timer = 2000) => {
  Swal.fire({
    icon: 'success',
    title: title,
    text: text,
    timer: timer,
    showConfirmButton: false, // No mostrar el botón de confirmación
    timerProgressBar: true    // Muestra una barra de progreso
  });
};

export const mostrarAlertaError = (title, text) => {
  Swal.fire({
    icon: 'warning',
    title: title,
    text: text,
    confirmButtonColor: '#d33'
  });
};

export const mostrarDialogoConfirmacion = (title, text) => {
  return Swal.fire({
    title: title,
    text: text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, continuar',
    cancelButtonText: 'Cancelar'
  });
};