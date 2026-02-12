document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("requestForm");
  const success = document.getElementById("formSuccess");

  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    // простая валидация мок-формы
    const requiredFields = ["orgName"];
    let hasError = false;

    requiredFields.forEach((name) => {
      const field = form.elements[name];
      if (!field) return;
      const value = String(field.value || "").trim();
      clearFieldError(field);

      if (!value) {
        setFieldError(field, "Укажите название организации");
        hasError = true;
      }
    });

    if (hasError) {
      success.hidden = true;
      return;
    }

    // имитация успешной отправки
    success.hidden = false;
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  function setFieldError(field, message) {
    field.classList.add("field-error");
    let error = field.parentElement.querySelector(".form-error");
    if (!error) {
      error = document.createElement("p");
      error.className = "form-error";
      field.parentElement.appendChild(error);
    }
    error.textContent = message;
  }

  function clearFieldError(field) {
    field.classList.remove("field-error");
    const error = field.parentElement.querySelector(".form-error");
    if (error) {
      error.remove();
    }
  }
});

