class Modal {
  static createModal(options = {}) {
    const {
      title = "Confirm",
      message = "Are you sure?",
      type = "confirm",
      inputs = [],
      confirmText = "Yes",
      cancelText = "No",
      onConfirm = () => {},
      onCancel = () => {},
      size = "medium",
    } = options;

    const existingModal = document.getElementById("universalModal");
    if (existingModal) {
      existingModal.remove();
    }

    // Model overlay
    const modalOverlay = document.createElement("div");
    modalOverlay.id = "universalModal";
    modalOverlay.className = "modal-overlay";
    modalOverlay.innerHTML = `
            <div class="modal-content modal-${size}">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close" onclick="Modal.close()">&times;</button>
                </div>
                <div class="modal-body">
                    <p>${message}</p>
                    ${
                      type === "prompt" || type === "form"
                        ? this.createInputs(inputs)
                        : ""
                    }
                </div>
                <div class="modal-footer">
                    ${
                      type !== "alert"
                        ? `<button class="btn btn-outline modal-cancel">${cancelText}</button>`
                        : ""
                    }
                    <button class="btn btn-primary modal-confirm">${
                      type === "alert" ? "OK" : confirmText
                    }</button>
                </div>
            </div>
        `;

    document.body.appendChild(modalOverlay);

    const confirmBtn = modalOverlay.querySelector(".modal-confirm");
    const cancelBtn = modalOverlay.querySelector(".modal-cancel");

    confirmBtn.addEventListener("click", () => {
      if (type === "prompt" || type === "form") {
        const inputs = modalOverlay.querySelectorAll(".modal-input");
        const values = {};
        inputs.forEach((input) => {
          values[input.name] = input.value;
        });
        onConfirm(values);
      } else {
        onConfirm();
      }
      this.close();
    });

    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        onCancel();
        this.close();
      });
    }

    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) {
        onCancel();
        this.close();
      }
    });

    const escapeHandler = (e) => {
      if (e.key === "Escape") {
        onCancel();
        this.close();
        document.removeEventListener("keydown", escapeHandler);
      }
    };
    document.addEventListener("keydown", escapeHandler);

    return modalOverlay;
  }

  static createInputs(inputs) {
    return inputs
      .map(
        (input) => `
            <div class="modal-input-group">
                <label>${input.label}</label>
                <input type="${input.type || "text"}" 
                       class="modal-input" 
                       name="${input.name}" 
                       value="${input.value || ""}" 
                       placeholder="${input.placeholder || ""}"
                       ${input.required ? "required" : ""}>
            </div>
        `
      )
      .join("");
  }

  static close() {
    const modal = document.getElementById("universalModal");
    if (modal) {
      modal.remove();
    }
  }
  static confirm(options) {
    return new Promise((resolve) => {
      this.createModal({
        ...options,
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });
  }
  static prompt(options) {
    return new Promise((resolve) => {
      this.createModal({
        ...options,
        type: "prompt",
        onConfirm: (values) => resolve(values),
        onCancel: () => resolve(null),
      });
    });
  }
  static alert(options) {
    return new Promise((resolve) => {
      this.createModal({
        ...options,
        type: "alert",
        onConfirm: () => resolve(true),
      });
    });
  }
}

window.Modal = Modal;
