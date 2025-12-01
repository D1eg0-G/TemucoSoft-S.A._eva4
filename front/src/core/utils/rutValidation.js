export const validateRut = (rut) => {
  if (!rut) return false;

  // 1. Limpiar el RUT (quitar puntos y guión)
  let value = rut.replace(/\./g, "").replace(/-/g, "");

  // 2. Separar cuerpo y dígito verificador
  let body = value.slice(0, -1);
  let dv = value.slice(-1).toUpperCase();

  // 3. Validar largo mínimo
  if (body.length < 7) return false;

  // 4. Calcular Dígito Verificador esperado
  let sum = 0;
  let multiple = 2;

  for (let i = 1; i <= body.length; i++) {
    let index = multiple * value.charAt(body.length - i);
    sum = sum + index;
    if (multiple < 7) {
      multiple = multiple + 1;
    } else {
      multiple = 2;
    }
  }

  let dvExpected = 11 - (sum % 11);
  dv = dv === "K" ? 10 : dv;
  dv = dv === "0" ? 11 : dv;

  // 5. Comparar
  return parseInt(dv) === parseInt(dvExpected);
};

export const formatRut = (rut) => {
  // Formatea visualmente a XX.XXX.XXX-X
  if (!rut) return "";
  let value = rut.replace(/\./g, "").replace(/-/g, "");
  if (value.length > 1) {
    value = value.slice(0, -1) + "-" + value.slice(-1);
  }
  if (value.length > 5) {
    value = value.slice(0, -5) + "." + value.slice(-5);
  }
  if (value.length > 9) {
    value = value.slice(0, -9) + "." + value.slice(-9);
  }
  return value;
};
