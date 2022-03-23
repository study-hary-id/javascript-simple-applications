/**
 * Dialog module.
 * @module dialog.js
 * @version 1.0.0
 * @summary 18-03-2022
 * @author Mads Stouman, Muhammad Haryansyah
 * @description Custom version of `alert`, `confirm`, and `prompt` using <dialog>.
 */
class Dialog {
  constructor(settings = {}) {
    this.settings = Object.assign(
      {
        // This is the “Accept” button’s label.
        accept: "Ok",

        // This is a CSS class that is added to <body> element when the dialog is open
        // and <dialog> is unsupported by the browser.
        bodyClass: "dialog-open",

        // This is the “Cancel” button’s label.
        cancel: "Cancel",

        // This is a custom CSS class added to the <dialog> element.
        dialogClass: "",

        // This is the content inside the <dialog>.
        message: "",

        // This is the URL to the sound file we’ll play when the user hits the “Accept” button.
        soundAccept: "",

        // This is the URL to the sound file we’ll play when the user opens the dialog.
        soundOpen: "",

        // This is an optional, little HTML template that’s injected into the <dialog>.
        template: "",
      },
      settings
    );
    this.init();
  }

  init() {
    // Checking for <dialog> support.
    this.dialogSupported = typeof HTMLDialogElement === "function";
    if (this.dialogSupported) console.log("Dialog is supported.");

    this.dialog = document.createElement("dialog");
    this.dialog.dataset.component = this.dialogSupported
      ? "dialog"
      : "no-dialog";
    this.dialog.role = "dialog";

    // HTML template.
    this.dialog.innerHTML = `
    <form method="dialog" data-ref="form">
      <fieldset data-ref="fieldset" role="document">
        <legend data-ref="message" id="${Math.round(Date.now()).toString(36)}">
        </legend>
        <dif data-ref="template"></div>
      </fieldset>
      <menu>
        <button
          ${this.dialogSupported ? "" : `type="button"`}
          data-ref="cancel"
          value="cancel"
        ></button>
        <button
          ${this.dialogSupported ? "" : `type="button"`}
          data-ref="accept"
          value="default"
        ></button>
      </menu>
      <audio data-ref="soundAccept"></audio>
      <audio data-ref="soundOpen"></audio>
    </form>
    `;

    document.body.appendChild(this.dialog);

    //
    this.elements = {};
    this.focusable = [];
    this.dialog
      .querySelectorAll("[data-ref]")
      .forEach((el) => (this.elements[el.dataset.ref] = el));
    this.dialog.setAttribute("aria-labelledby", this.elements.message.id);
    this.elements.cancel.addEventListener("click", () => {
      this.dialog.dispatchEvent(new Event("cancel"));
    });

    // Keyboard navigation.
    this.dialog.addEventListener("keyup", (e) => {
      if (e.key === "Enter") {
        if (!this.dialogSupported) e.preventDefault();
        this.elements.accept.dispatchEvent(new Event("click"));
      }
      if (e.key === "Escape") this.dialog.dispatchEvent(new Event("cancel"));
      if (e.key === "Tab") {
        e.preventDefault();
        const len = this.getFocusable.length - 1;
        let index = this.getFocusable.indexOf(e.target);
        index = e.shiftKey ? index - 1 : index + 1;
        if (index < 0) index = len;
        if (index > len) index = 0;
        this.focusable[index].focus();
      }
    });

    this.toggle();
  }

  open(settings = {}) {
    const dialog = Object.assign({}, this.settings, settings);
    this.dialog.className = dialog.dialogClass || "";

    // Set innerText of the elements.
    this.elements.accept.innerText = dialog.accept;
    this.elements.cancel.innerText = dialog.cancel;
    this.elements.cancel.hidden = dialog.cancel === "";
    this.elements.message.innerText = dialog.message;

    // If sounds exists, update `src`.
    this.elements.soundAccept.src = dialog.soundAccept || "";
    this.elements.soundOpen.src = dialog.soundOpen || "";

    // A target can be added (from the element invoking the dialog).
    this.elements.target = dialog.target || "";

    // Optional HTML for custom dialogs.
    this.elements.template.innerHTML = dialog.template;

    // Grab focusable elements.
    this.focusable = this.getFocusable();
    this.hasFormData = this.elements.fieldset.elements.length > 0;
    if (dialog.soundOpen) this.elements.soundOpen.play();

    this.toggle(true);
    if (this.hasFormData) {
      // If form elements exist, focus on that first.
      this.focusable[0].focus();
      this.focusable[0].select();
    } else {
      this.elements.accept.focus();
    }
  }

  toggle(open = false) {
    if (this.dialogSupported && open) this.dialog.showModal();
    if (!this.dialogSupported) {
      document.body.classList.toggle(this.settings.bodyClass, open);
      this.dialog.hidden = !open;

      // If a `target` exist, set focus on it when closing.
      if (this.elements.target && !open) {
        this.elements.target.focus();
      }
    }
  }

  getFocusable() {
    return [
      ...this.dialog.querySelectorAll(
        `button,[href],select,textarea,input:not([type="hidden"]),[tabindex]:not([tabindex="-1"])`
      ),
    ];
  }

  waitForUser() {
    return new Promise((resolve) => {
      this.dialog.addEventListener(
        "cancel",
        () => {
          this.toggle();
          resolve(false);
        },
        { once: true }
      );
      this.elements.accept.addEventListener(
        "click",
        () => {
          let value = this.hasFormData
            ? this.collectFormData(new FormData(this.elements.form))
            : true;
          if (this.elements.soundAccept.getAttribute("src").length > 0)
            this.elements.soundAccept.play();
          this.toggle();
          resolve(value);
        },
        { once: true }
      );
    });
  }

  collectFormData(formData) {
    const object = {};
    formData.forEach((value, key) => {
      if (!Reflect.has(object, key)) {
        object[key] = value;
        return;
      }
      if (!Array.isArray(object[key])) {
        object[key] = [object[key]];
      }
      object[key].push(value);
    });
    return object;
  }

  alert(message, config = { target: event.target }) {
    const settings = Object.assign({}, config, {
      cancel: "",
      message,
      template: "",
    });
    this.open(settings);
    return this.waitForUser();
  }

  confirm(message, config = { target: event.target }) {
    const settings = Object.assign({}, config, { message, template: "" });
    this.open(settings);
    return this.waitForUser();
  }

  prompt(message, value, config = { target: event.target }) {
    const template = `
    <label aria-label="${message}">
      <input name="prompt" value="${value}">
    </label>
    `;
    const settings = Object.assign({}, config, { message, template });
    this.open(settings);
    return this.waitForUser();
  }
}
