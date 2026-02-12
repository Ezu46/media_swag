document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("requestForm");
  const success = document.getElementById("formSuccess");
  const submitButton = form?.querySelector('button[type="submit"]');

  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Валидация формы
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

    // Сбор данных формы
    const formData = {
      orgType: form.elements.orgType?.value || "",
      orgName: form.elements.orgName?.value.trim() || "",
      city: form.elements.city?.value.trim() || "",
      participants: form.elements.participants?.value || "",
      age: form.elements.age?.value || "",
      preferredFormat: form.elements.preferredFormat?.value || "",
      date: form.elements.date?.value.trim() || "",
      contact: form.elements.contact?.value.trim() || "",
      email: form.elements.email?.value.trim() || "",
      comment: form.elements.comment?.value.trim() || "",
    };

    // Отправка на сервер
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Отправка...";
    }

    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        // Успешная отправка
        success.textContent = result.message || "Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.";
        success.hidden = false;
        form.reset();
        form.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        // Ошибка от сервера
        showFormError(result.error || "Произошла ошибка при отправке заявки");
      }
    } catch (error) {
      console.error("Ошибка при отправке формы:", error);
      showFormError(
        "Не удалось отправить заявку. Проверьте подключение к интернету или попробуйте позже."
      );
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Отправить заявку";
      }
    }
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

  function showFormError(message) {
    success.hidden = true;
    let errorDiv = form.querySelector(".form-error-global");
    if (!errorDiv) {
      errorDiv = document.createElement("p");
      errorDiv.className = "form-error form-error-global";
      form.insertBefore(errorDiv, submitButton);
    }
    errorDiv.textContent = message;
    errorDiv.hidden = false;
    form.scrollIntoView({ behavior: "smooth", block: "start" });
    
    // Скрыть ошибку через 5 секунд
    setTimeout(() => {
      errorDiv.hidden = true;
    }, 5000);
  }
});

